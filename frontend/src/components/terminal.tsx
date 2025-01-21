import { Terminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import { useSocketContext } from "../context/SocketContext";
import Cookies from "js-cookie";

const term = new Terminal({
  cursorBlink: true,
  fontSize: 16,
  fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  theme: {
    background: '#1a1b26',
    foreground: '#a9b1d6',
    black: '#32344a',
    brightBlack: '#444b6a',
    red: '#f7768e',
    brightRed: '#ff7a93',
    green: '#9ece6a',
    brightGreen: '#b9f27c',
    yellow: '#e0af68',
    brightYellow: '#ff9e64',
    blue: '#7aa2f7',
    brightBlue: '#7da6ff',
    magenta: '#ad8ee6',
    brightMagenta: '#bb9af7',
    cyan: '#449dab',
    brightCyan: '#0db9d7',
    white: '#787c99',
    brightWhite: '#acb0d0',
    cursor: '#c0caf5'
  },
  allowTransparency: true
});

export function XTerminal() {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const { socket } = useSocketContext()

  useEffect(() => {

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

    if (terminalRef.current) {
      term.open(terminalRef.current);
      term.onData((data) => {
        if (socket) {
          socket.emit("terminal:write", data);
        }
      })

      function onTerminalData(data: any) {
        term.write(data);
        term.scrollToBottom();
      }

      if (socket) {
        socket.on("terminal:data", onTerminalData)
      }

      return () => {
        if (socket) {
          socket.emit("disconnection");
          socket.off("terminal:data", onTerminalData)
        }
      }
    }
  }, [terminalRef,socket]);

  return <div ref={terminalRef} id="terminal"></div>;
}
