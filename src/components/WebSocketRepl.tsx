import { useState, useEffect, useRef } from 'react';

export default function WebSocketRepl() {
  const [currentInput, setCurrentInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>(['Python REPL - Ready']);
  const [connected, setConnected] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const wsRef = useRef<WebSocket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      setConnected(true);
    };
    
    wsRef.current.onmessage = (event) => {
      const lines = event.data.split('\n').filter((line: string) => line.trim() !== '');
      setTerminalHistory(prev => [...prev, ...lines]);
    };
    
    wsRef.current.onclose = () => {
      setConnected(false);
      setTerminalHistory(prev => [...prev, '[Connection closed]']);
    };
    
    wsRef.current.onerror = () => {
      setTerminalHistory(prev => [...prev, '[Connection error]']);
    };
  };

  const executeCommand = () => {
    if (!wsRef.current || !connected || !currentInput.trim()) return;
    
    // Add command to terminal history
    setTerminalHistory(prev => [...prev, `>>> ${currentInput}`]);
    
    // Send to WebSocket
    wsRef.current.send(currentInput);
    
    // Add to command history
    if (currentInput.trim() && commandHistory[commandHistory.length - 1] !== currentInput) {
      setCommandHistory(prev => [...prev, currentInput]);
    }
    setHistoryIndex(-1);
    setCurrentInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
    } else if (e.key === 'ArrowUp' && commandHistory.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setCurrentInput(commandHistory[newIndex]);
    } else if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  const clearTerminal = () => {
    setTerminalHistory(['Python REPL - Ready']);
  };

  const reconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  return (
    <div className="h-screen flex flex-col bg-black text-green-400 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-white">WebSocket Python REPL</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-300">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="space-x-2">
          <button
            onClick={clearTerminal}
            className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            Clear
          </button>
          <button
            onClick={reconnect}
            disabled={connected}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Reconnect
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Terminal Output */}
        <div
          ref={terminalRef}
          className="flex-1 overflow-auto p-4 space-y-1"
        >
          {terminalHistory.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>

        {/* Input Line */}
        <div className="flex items-center px-4 py-2 border-t border-gray-700">
          <span className="text-green-400 mr-2">{'>>>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-green-400 outline-none placeholder-gray-500"
            placeholder={connected ? "Enter Python code..." : "Disconnected"}
            disabled={!connected}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-1 bg-gray-900 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Press Enter to execute • Use ↑/↓ arrows for history • Real-time Python REPL
        </p>
      </div>
    </div>
  );
}