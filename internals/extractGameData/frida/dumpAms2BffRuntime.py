#!/usr/bin/env python3
"""Attach to AMS2 and persist Frida runtime dumps for BFF/KAP decoding."""

from __future__ import annotations

import argparse
import json
import re
import signal
import sys
import threading
import time
from pathlib import Path
from typing import Any

import frida


DEFAULT_OUTPUT_DIR = Path("build/extracted/ams2/frida")
SCRIPT_PATH = Path(__file__).with_suffix(".js")


def sanitize(value: str) -> str:
    value = re.sub(r"[^A-Za-z0-9_.-]+", "_", value)
    return value.strip("_") or "dump"


def append_jsonl(path: Path, payload: dict[str, Any]) -> None:
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, sort_keys=True) + "\n")


def find_process(device: frida.core.Device, name: str) -> frida.core.Process:
    needle = name.lower()
    matches = [
        process
        for process in device.enumerate_processes()
        if needle in process.name.lower()
    ]
    if not matches:
        names = ", ".join(process.name for process in device.enumerate_processes()[:30])
        raise SystemExit(f"Process matching {name!r} not found. Visible processes: {names}")
    if len(matches) > 1:
        details = ", ".join(f"{process.pid}:{process.name}" for process in matches)
        raise SystemExit(f"Multiple processes match {name!r}; pass --pid. Matches: {details}")
    return matches[0]


def list_processes(device: frida.core.Device) -> None:
    for process in sorted(device.enumerate_processes(), key=lambda item: item.name.lower()):
        print(f"{process.pid:>8}  {process.name}")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(line_buffering=True)
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(line_buffering=True)

    parser = argparse.ArgumentParser(
        description="Attach to a running AMS2 process and dump BFF/KAP runtime decode buffers.",
    )
    parser.add_argument("--pid", type=int, help="Attach to this PID instead of searching by name.")
    parser.add_argument(
        "--process",
        default="AMS2AVX.exe",
        help="Process name fragment to attach to when --pid is not supplied.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directory for JSONL logs and binary dumps.",
    )
    parser.add_argument(
        "--max-dump-size",
        type=int,
        default=32 * 1024 * 1024,
        help="Maximum single binary dump size in bytes.",
    )
    parser.add_argument(
        "--dump-oodle-buffers",
        action="store_true",
        help="Dump every Oodle source/output buffer. This can be noisy.",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List visible Frida processes and exit.",
    )
    parser.add_argument(
        "--spawn",
        nargs=argparse.REMAINDER,
        help=(
            "Spawn a command under Frida instead of attaching. Put this option last, "
            "for example: --spawn wine /path/to/AMS2AVX.exe"
        ),
    )
    parser.add_argument(
        "--duration",
        type=float,
        help="Detach after this many seconds instead of waiting for Ctrl-C/process exit.",
    )
    parser.add_argument(
        "--cwd",
        type=Path,
        help="Working directory for --spawn.",
    )
    parser.add_argument(
        "--kill-spawn-on-exit",
        action="store_true",
        help="Kill the spawned process when the runner exits. Only applies with --spawn.",
    )
    parser.add_argument(
        "--follow-children",
        action="store_true",
        help="Enable Frida child-gating and install the agent into child processes.",
    )
    parser.add_argument(
        "--realm",
        choices=["native", "emulated"],
        default="native",
        help="Frida realm to attach in. Use emulated for Wine PE modules.",
    )
    args = parser.parse_args()

    device = frida.get_local_device()
    if args.list:
        list_processes(device)
        return 0

    args.output.mkdir(parents=True, exist_ok=True)
    events_path = args.output / "events.jsonl"
    dumps_dir = args.output / "dumps"
    dumps_dir.mkdir(parents=True, exist_ok=True)

    spawned_pid: int | None = None
    if args.spawn:
        spawn_kwargs: dict[str, Any] = {"stdio": "inherit"}
        if args.cwd is not None:
            spawn_kwargs["cwd"] = str(args.cwd)
        spawned_pid = device.spawn(args.spawn, **spawn_kwargs)
        target = spawned_pid
        target_label = f"{spawned_pid}:{' '.join(args.spawn)}"
    elif args.pid is not None:
        target = args.pid
        target_label = str(args.pid)
    else:
        process = find_process(device, args.process)
        target = process.pid
        target_label = f"{process.pid}:{process.name}"

    print(f"Writing Frida dumps to {args.output}")

    script_source = SCRIPT_PATH.read_text(encoding="utf-8")
    stop = threading.Event()
    dump_counter = 0
    sessions: dict[str, frida.core.Session] = {}

    def on_message(label: str, message: dict[str, Any], data: bytes | None) -> None:
        nonlocal dump_counter

        payload = message.get("payload")
        if message.get("type") == "error":
            append_jsonl(events_path, {"session": label, "frida_error": message})
            print(f"[{label}] {message.get('stack', message)}", file=sys.stderr)
            return

        if not isinstance(payload, dict):
            append_jsonl(events_path, {"session": label, "message": message})
            print(f"[{label}] {message}")
            return

        if payload.get("type") == "dump":
            dump_counter += 1
            kind = sanitize(str(payload.get("kind", "dump")))
            name = sanitize(str(payload.get("name", "buffer")))
            dump_id = int(payload.get("id", dump_counter))
            filename = f"{dump_counter:06d}_{kind}_{dump_id:04d}_{name}.bin"
            file_path = dumps_dir / filename
            file_path.write_bytes(data or b"")
            payload = {
                **payload,
                "session": label,
                "file": str(file_path),
                "host_dump_counter": dump_counter,
            }
            append_jsonl(events_path, payload)
            print(
                f"[{label}] dump {filename} size={payload.get('size')} "
                f"kind={payload.get('kind')} address={payload.get('address')}"
            )
            return

        append_jsonl(events_path, {"session": label, **payload})
        if payload.get("type") == "error":
            print(
                f"[{label}] agent error: "
                f"{payload.get('message')} {payload.get('fields', {})}",
                file=sys.stderr,
            )
        elif payload.get("type") == "log":
            print(f"[{label}] agent: {payload.get('message')} {payload.get('fields', {})}")
        else:
            print(f"[{label}] {payload}")

    def attach_session(session_target: int, label: str, gate_children: bool) -> frida.core.Session:
        print(f"Attaching to {label}")
        session = device.attach(session_target, realm=args.realm)
        sessions[label] = session

        if gate_children:
            session.enable_child_gating()

        def on_detached(reason: str, crash: Any) -> None:
            print(f"[{label}] Detached: {reason}")
            if crash is not None:
                print(crash, file=sys.stderr)
            sessions.pop(label, None)
            if not sessions:
                stop.set()

        script = session.create_script(script_source)
        script.on("message", lambda message, data: on_message(label, message, data))
        session.on("detached", on_detached)
        script.load()

        configured = script.exports_sync.configure(
            {
                "maxDumpSize": args.max_dump_size,
                "dumpOodleBuffers": args.dump_oodle_buffers,
            },
        )
        if not configured:
            raise RuntimeError(f"Agent configuration failed for {label}")
        return session

    def describe_child(child: Any) -> str:
        pid = getattr(child, "pid", "?")
        path = getattr(child, "path", "")
        argv = getattr(child, "argv", None)
        if argv:
            return f"{pid}:{' '.join(argv)}"
        if path:
            return f"{pid}:{path}"
        return str(pid)

    def resume_process(pid: int, label: str) -> None:
        try:
            device.resume(pid)
        except Exception as error:
            print(f"Failed to resume {label}: {error}", file=sys.stderr)

    def on_child_added(child: Any) -> None:
        pid = getattr(child, "pid", None)
        label = f"child:{describe_child(child)}"
        print(f"Child added: {label}")
        if pid is None:
            return
        try:
            attach_session(pid, label, gate_children=True)
        except Exception as error:
            print(f"Failed to attach child {label}: {error}", file=sys.stderr)
        finally:
            threading.Thread(target=resume_process, args=(pid, label), daemon=True).start()

    if args.follow_children:
        device.on("child-added", on_child_added)
    attach_session(target, target_label, gate_children=args.follow_children)

    if args.duration is not None:
        def stop_later() -> None:
            time.sleep(args.duration)
            stop.set()

        threading.Thread(target=stop_later, daemon=True).start()

    if spawned_pid is not None:
        print(f"Resuming spawned process {spawned_pid}")
        threading.Thread(
            target=resume_process,
            args=(spawned_pid, target_label),
            daemon=True,
        ).start()

    def handle_signal(_signum: int, _frame: Any) -> None:
        stop.set()

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)
    stop.wait()
    for session in list(sessions.values()):
        is_detached = session.is_detached
        if callable(is_detached):
            is_detached = is_detached()
        if not is_detached:
            session.detach()
    if spawned_pid is not None and args.kill_spawn_on_exit:
        try:
            device.kill(spawned_pid)
        except frida.ProcessNotFoundError:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
