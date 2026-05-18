import { HashRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Worldcup from './pages/Worldcup';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-surface-950 font-body text-zinc-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/worldcup" element={<Worldcup />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
