import { useState, useEffect, useRef } from 'react';

export default function WebSocketRepl() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const wsRef = useRef<WebSocket | null>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      setConnected(true);
    };
    
    wsRef.current.onmessage = (event) => {
      setOutput(prev => prev + event.data);
    };
    
    wsRef.current.onclose = () => {
      setConnected(false);
      setOutput(prev => prev + '\n[Connection closed]\n');
    };
    
    wsRef.current.onerror = () => {
      setOutput(prev => prev + '\n[Connection error]\n');
    };
  };

  const executeCode = () => {
    if (!wsRef.current || !connected || !code.trim()) return;
    
    wsRef.current.send(code);
    setOutput(prev => prev + `>>> ${code}\n`);
    
    // Add to history
    if (code.trim() && history[history.length - 1] !== code) {
      setHistory(prev => [...prev, code]);
    }
    setHistoryIndex(-1);
    setCode('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      executeCode();
    } else if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setCode(history[newIndex]);
    } else if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCode(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setCode('');
      }
    }
  };

  const clearOutput = () => {
    setOutput('');
  };

  const reconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectWebSocket();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">WebSocket Python REPL</h1>
        <p className="text-gray-600">Real-time Python execution via WebSocket</p>
      </div>

      <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="space-x-2">
          <button
            onClick={clearOutput}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear
          </button>
          <button
            onClick={reconnect}
            disabled={connected}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Reconnect
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output
          </label>
          <pre
            ref={outputRef}
            className="w-full h-64 p-3 border border-gray-300 rounded-lg bg-black text-green-400 font-mono text-sm overflow-auto whitespace-pre-wrap"
          >
            {output || 'Connecting to Python REPL...\n'}
          </pre>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Python Code
          </label>
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
              placeholder="print('Hello, World!')"
              disabled={!connected}
            />
            <button
              onClick={executeCode}
              disabled={!connected || !code.trim()}
              className="absolute bottom-2 right-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press Cmd/Ctrl+Enter to execute • Use ↑/↓ arrows for history
          </p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">WebSocket Features:</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li><strong>Real-time:</strong> Live connection to Python interpreter</li>
          <li><strong>Persistent state:</strong> Variables persist across executions</li>
          <li><strong>Command history:</strong> Use arrow keys to navigate previous commands</li>
          <li><strong>Keyboard shortcuts:</strong> Cmd/Ctrl+Enter to execute</li>
        </ul>
      </div>
    </div>
  );
}