import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HttpRepl from './components/HttpRepl';
import WebSocketRepl from './components/WebSocketRepl';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<HttpRepl />} />
            <Route path="/websocket" element={<WebSocketRepl />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App
