// Headless Ghidra helper for targeted AMS2 BFF/KAP reverse engineering.
// Run with analyzeHeadless and pass absolute function addresses as script args.

import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.Function;

public class DecompileAms2Bff extends GhidraScript {
  @Override
  protected void run() throws Exception {
    DecompInterface decompiler = new DecompInterface();
    decompiler.openProgram(currentProgram);

    for (String arg : getScriptArgs()) {
      Address address = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(arg);
      disassemble(address);

      Function function = getFunctionAt(address);
      if (function == null) {
        function = createFunction(address, "ams2_bff_" + arg.replace("0x", ""));
      }

      println("===== " + arg + " =====");
      if (function == null) {
        println("Could not create function at " + arg);
        continue;
      }

      println("Function: " + function.getName() + " " + function.getEntryPoint());
      DecompileResults results = decompiler.decompileFunction(function, 60, monitor);
      if (!results.decompileCompleted()) {
        println("Decompile failed: " + results.getErrorMessage());
        continue;
      }

      println(results.getDecompiledFunction().getC());
    }
  }
}
