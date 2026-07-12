// Frida agent for dumping AMS2 BFF/KAP runtime decode state.
//
// This is intentionally diagnostic. The output is used to confirm exact archive
// semantics before porting the logic into the static TypeScript extractor.

'use strict';

const IMAGE_BASE = 0x140000000;
const MAX_DEFAULT_DUMP_SIZE = 32 * 1024 * 1024;

let options = {
  maxDumpSize: MAX_DEFAULT_DUMP_SIZE,
  dumpOodleBuffers: false,
};

const counters = new Map();
let moduleObserver = null;
let ams2HooksInstalled = false;
let oodleHookInstalled = false;

function nextId(kind) {
  const value = (counters.get(kind) ?? 0) + 1;
  counters.set(kind, value);
  return value;
}

function log(message, fields) {
  send({
    type: 'log',
    message,
    fields: fields ?? {},
  });
}

function fail(message, fields) {
  send({
    type: 'error',
    message,
    fields: fields ?? {},
  });
}

function ptrHex(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return value.toString();
}

function u32(address) {
  return address.readU32();
}

function u8(address) {
  return address.readU8();
}

function ascii(address, size) {
  try {
    return address.readByteArray(size)
      ? Array.from(new Uint8Array(address.readByteArray(size)))
          .map(byte =>
            byte >= 0x20 && byte < 0x7f ? String.fromCharCode(byte) : '.',
          )
          .join('')
      : '';
  } catch (error) {
    return `<read failed: ${error}>`;
  }
}

function moduleByPredicate(predicate) {
  return Process.enumerateModules().find(module => predicate(module));
}

function moduleByNameFragment(fragment) {
  const lower = fragment.toLowerCase();
  return moduleByPredicate(module => {
    const name = module.name.toLowerCase();
    const path = module.path.toLowerCase();
    return name.includes(lower) || path.endsWith(lower);
  });
}

function describeAddress(address) {
  const module = Process.findModuleByAddress(address);
  if (!module) {
    return {
      address: ptrHex(address),
      module: '',
      rva: '',
    };
  }

  return {
    address: ptrHex(address),
    module: module.name,
    rva: `0x${address.sub(module.base).toString(16)}`,
  };
}

function dumpBytes(kind, name, address, size, metadata) {
  if (address.isNull() || size <= 0) {
    return;
  }

  if (size > options.maxDumpSize) {
    log('Skipping oversized dump', {
      kind,
      name,
      address: ptrHex(address),
      size,
      maxDumpSize: options.maxDumpSize,
    });
    return;
  }

  try {
    const bytes = address.readByteArray(size);
    if (!bytes) {
      return;
    }

    send(
      {
        type: 'dump',
        kind,
        name,
        id: nextId(kind),
        address: ptrHex(address),
        size,
        metadata: metadata ?? {},
      },
      bytes,
    );
  } catch (error) {
    fail('Dump failed', {
      kind,
      name,
      address: ptrHex(address),
      size,
      error: String(error),
    });
  }
}

function ams2Module() {
  return moduleByNameFragment('ams2avx.exe');
}

function ams2Address(module, va) {
  return module.base.add(va - IMAGE_BASE);
}

function hookAt(module, va, name, callbacks) {
  const address = ams2Address(module, va);
  try {
    Interceptor.attach(address, callbacks);
    log(`Hooked ${name}`, {
      va: `0x${va.toString(16)}`,
      address: ptrHex(address),
      module: module.name,
      moduleBase: ptrHex(module.base),
    });
  } catch (error) {
    fail(`Failed to hook ${name}`, {
      va: `0x${va.toString(16)}`,
      address: ptrHex(address),
      error: String(error),
    });
  }
}

function hookKapLoader(module) {
  hookAt(module, 0x141ad4c30, 'KAP loader 0x141ad4c30', {
    onEnter() {
      this.kap = this.context.rcx;
      this.size = this.context.rdx;
      this.magic = '';

      try {
        this.magic = ascii(this.kap, 4);
      } catch (_) {
        this.magic = '';
      }
    },
    onLeave(retval) {
      if (!this.kap || this.kap.isNull() || this.magic !== ' KAP') {
        return;
      }

      let rootEntrySize;
      let rootEntryCompressedSize;
      let rootEntryOffset;
      let rootEntryHeaderSize;
      let headerTransformMode;
      let secondaryOffset;
      let secondarySize;

      try {
        rootEntrySize = u32(this.kap.add(0x118));
        rootEntryCompressedSize = u32(this.kap.add(0x120));
        rootEntryOffset = u32(this.kap.add(0x124));
        rootEntryHeaderSize = u32(this.kap.add(0x128));
        headerTransformMode = u8(this.kap.add(0x12d));
        secondaryOffset = 0x438 + rootEntrySize;
        secondarySize =
          rootEntryCompressedSize > 0x308 ? rootEntryCompressedSize - 0x308 : 0;
      } catch (error) {
        fail('Could not read KAP header after loader return', {
          kap: ptrHex(this.kap),
          retval: ptrHex(retval),
          error: String(error),
        });
        return;
      }

      const metadata = {
        retval: ptrHex(retval),
        kap: ptrHex(this.kap),
        sizeRegister: ptrHex(this.size),
        rootEntrySize,
        rootEntryCompressedSize,
        rootEntryOffset,
        rootEntryHeaderSize,
        headerTransformMode,
        secondaryOffset,
        secondarySize,
        head: ascii(this.kap, 0x20),
      };

      dumpBytes(
        'kap-header-after-loader',
        'kap-header',
        this.kap,
        0x130,
        metadata,
      );
      if (secondarySize > 0) {
        dumpBytes(
          'kap-secondary-after-loader',
          'kap-secondary-toc',
          this.kap.add(secondaryOffset),
          secondarySize,
          metadata,
        );
      }
    },
  });
}

function hookRuntimeTransform(module) {
  hookAt(module, 0x141ad5180, 'block transform 0x141ad5180', {
    onEnter() {
      const metadata = {
        rcx: ptrHex(this.context.rcx),
        rdx: ptrHex(this.context.rdx),
        r8: ptrHex(this.context.r8),
        r9: ptrHex(this.context.r9),
        caller: describeAddress(this.returnAddress),
      };

      log('Block transform entered', metadata);
    },
  });
}

function hookRuntimeOodleCall(module) {
  hookAt(module, 0x140d52778, 'runtime Oodle call site 0x140d52778', {
    onEnter() {
      const source = this.context.rcx;
      const compressedSize = this.context.rdx.toUInt32();
      const destination = this.context.r8;
      const uncompressedSize = this.context.r9.toUInt32();
      let stackArg28 = '';
      let stackArg68 = '';

      try {
        stackArg28 = ptrHex(this.context.rsp.add(0x28).readPointer());
      } catch (_) {
        stackArg28 = '';
      }
      try {
        stackArg68 = ptrHex(this.context.rsp.add(0x68).readPointer());
      } catch (_) {
        stackArg68 = '';
      }

      const metadata = {
        source: ptrHex(source),
        compressedSize,
        destination: ptrHex(destination),
        uncompressedSize,
        stackArg28,
        stackArg68,
        caller: describeAddress(this.returnAddress),
      };

      log('Runtime Oodle call site hit', metadata);
      dumpBytes(
        'runtime-oodle-source',
        'source',
        source,
        compressedSize,
        metadata,
      );
    },
  });
}

function hookOodleExport() {
  if (oodleHookInstalled) {
    return;
  }

  const oodle = moduleByNameFragment('oo2core');
  if (!oodle) {
    log('Oodle module not currently loaded; export hook skipped');
    return;
  }

  const oodleExport = oodle.enumerateExports().find(entry => {
    return entry.name === 'OodleLZ_Decompress';
  });

  if (!oodleExport) {
    fail('OodleLZ_Decompress export not found', {
      module: oodle.name,
      path: oodle.path,
    });
    return;
  }

  Interceptor.attach(oodleExport.address, {
    onEnter() {
      this.source = this.context.rcx;
      this.compressedSize = this.context.rdx.toUInt32();
      this.destination = this.context.r8;
      this.uncompressedSize = this.context.r9.toUInt32();

      this.metadata = {
        source: ptrHex(this.source),
        compressedSize: this.compressedSize,
        destination: ptrHex(this.destination),
        uncompressedSize: this.uncompressedSize,
        returnAddress: describeAddress(this.returnAddress),
      };

      log('OodleLZ_Decompress entered', this.metadata);
      if (options.dumpOodleBuffers) {
        dumpBytes(
          'oodle-source',
          'source',
          this.source,
          this.compressedSize,
          this.metadata,
        );
      }
    },
    onLeave(retval) {
      const metadata = {
        ...this.metadata,
        retval: ptrHex(retval),
      };

      log('OodleLZ_Decompress returned', metadata);
      if (options.dumpOodleBuffers && !retval.isNull()) {
        dumpBytes(
          'oodle-output',
          'output',
          this.destination,
          this.uncompressedSize,
          metadata,
        );
      }
    },
  });

  log('Hooked OodleLZ_Decompress export', {
    module: oodle.name,
    modulePath: oodle.path,
    address: ptrHex(oodleExport.address),
  });
  oodleHookInstalled = true;
}

function installHooks() {
  if (ams2HooksInstalled) {
    hookOodleExport();
    return true;
  }

  const module = ams2Module();
  if (!module) {
    log('AMS2AVX.exe module not found yet; waiting for module load', {
      modules: Process.enumerateModules()
        .map(entry => entry.name)
        .slice(0, 80),
    });
    attachModuleObserver();
    return false;
  }

  log('Resolved AMS2 module', {
    name: module.name,
    path: module.path,
    base: ptrHex(module.base),
    size: module.size,
  });

  hookKapLoader(module);
  hookRuntimeTransform(module);
  hookRuntimeOodleCall(module);
  hookOodleExport();
  ams2HooksInstalled = true;
  return true;
}

function attachModuleObserver() {
  if (moduleObserver !== null) {
    return;
  }

  if (typeof Process.attachModuleObserver !== 'function') {
    fail('Process.attachModuleObserver is unavailable in this Frida runtime');
    return;
  }

  moduleObserver = Process.attachModuleObserver({
    onAdded(module) {
      const name = module.name.toLowerCase();
      const modulePath = module.path.toLowerCase();
      if (name.includes('ams2avx.exe') || modulePath.endsWith('ams2avx.exe')) {
        log('AMS2 module loaded', {
          name: module.name,
          path: module.path,
          base: ptrHex(module.base),
        });
        installHooks();
      }
      if (name.includes('oo2core') || modulePath.includes('oo2core')) {
        log('Oodle module loaded', {
          name: module.name,
          path: module.path,
          base: ptrHex(module.base),
        });
        hookOodleExport();
      }
    },
  });
  log('Attached module observer');
}

rpc.exports = {
  configure(newOptions) {
    options = {
      ...options,
      ...(newOptions ?? {}),
    };
    installHooks();
    return true;
  },
};
