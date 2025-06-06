import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HttpRepl from './components/HttpRepl';
import WebSocketRepl from './components/WebSocketRepl';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <main className="flex-1 py-8">
          <Routes>
            <Route path="/" element={<HttpRepl />} />
            <Route path="/websocket" element={<WebSocketRepl />} />
          </Routes>
        </main>
        
        {/* Sticky Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="text-center space-y-2">
              <p className="text-gray-700">
                Built with 🧡 using{' '}
                <a
                  href="https://developers.cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 font-semibold"
                >
                  Cloudflare Workers
                </a>
                {' + Containers + '}
                <a
                  href="https://www.python.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Python
                </a>
                !
              </p>
              <p className="text-gray-600">
                👀{' '}
                <a
                  href="https://github.com/craigsdennis/python-repl-workers-containers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-gray-900 font-medium underline"
                >
                  the code
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App
