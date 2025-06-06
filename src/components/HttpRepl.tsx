import { useState } from 'react';

export default function HttpRepl() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const executeStateless = async () => {
    setLoading(true);
    try {
      const response = await fetch('/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const result = await response.json();
      setOutput(result.stdout || '');
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
    setLoading(false);
  };

  const createSession = async () => {
    try {
      const response = await fetch('/session', { method: 'POST' });
      const result = await response.json();
      setSessionId(result.session_id);
      setOutput('Session created successfully!');
    } catch (error) {
      setOutput(`Error creating session: ${error}`);
    }
  };

  const executeWithSession = async () => {
    if (!sessionId) {
      setOutput('Please create a session first');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/exec/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const result = await response.json();
      setOutput(prev => prev + '\n' + (result.stdout || ''));
    } catch (error) {
      setOutput(prev => prev + `\nError: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HTTP Python REPL</h1>
        <p className="text-gray-600">Execute Python code using HTTP endpoints</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Python Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="print('Hello, World!')"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={executeStateless}
              disabled={loading || !code.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Executing...' : 'Execute (Stateless)'}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={createSession}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Create Session
              </button>
              <button
                onClick={executeWithSession}
                disabled={loading || !code.trim() || !sessionId}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Execute (Session)
              </button>
            </div>
          </div>

          {sessionId && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Session ID:</strong> {sessionId.slice(0, 8)}...
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output
          </label>
          <pre className="w-full h-64 p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm overflow-auto whitespace-pre-wrap">
            {output || 'Output will appear here...'}
          </pre>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Stateless:</strong> Each execution is independent (uses /exec)</li>
          <li><strong>Session:</strong> Creates a persistent Python session (uses /session then /exec/{'{id}'})</li>
          <li>Try defining variables in session mode to see persistence!</li>
        </ul>
      </div>
    </div>
  );
}