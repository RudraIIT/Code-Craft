import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import { useSocketContext } from "../context/SocketContext";

const term = new Terminal();

export function XTerminal() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const isRendered = useRef(false);
  const { socket } = useSocketContext()

  useEffect(() => {
    if (isRendered.current) return;
    isRendered.current = true;

    if (terminalRef.current) {
      term.open(terminalRef.current);
      term.onData((data) => {
        if (socket) {
          socket.emit("terminal:write", data);
        }
      })

      function onTerminalData(data: any) {
        term.write(data);
      }

      if (socket) {
        socket.on("terminal:data", onTerminalData)
      }
    }
  }, [terminalRef,socket]);

  return <div ref={terminalRef} id="terminal"></div>;
}
