import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import { useSocketContext } from "../context/SocketContext";
import Cookies from "js-cookie";

const term = new Terminal();

export function XTerminal() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const isRendered = useRef(false);
  const { socket } = useSocketContext()

  useEffect(() => {
    if (isRendered.current) return;
    isRendered.current = true;

    const session = Cookies.get('project');

    if(session) {
      console.log('session', session);
      if(socket) {
        console.log('reconnecting');
        socket.emit('reconnect');
      }
    } else {
      console.log('no session');
      Cookies.set('project', 'project1');
    }

    const reconnectInterval = setInterval(() => {
      console.log('Checking socket status...');
      console.log('Socket disconnected status:', socket?.disconnected);
      if (!socket || socket.disconnected) {
        console.log('Attempting to reconnect...');
        socket?.emit('reconnect');
      }
    }, 5000);

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

      return () => {
        clearInterval(reconnectInterval);
        if (socket) {
          socket.emit("disconnect");
          socket.off("terminal:data", onTerminalData)
        }
      }
    }
  }, [terminalRef,socket]);

  return <div ref={terminalRef} id="terminal"></div>;
}
