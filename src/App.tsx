import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Worldcup from './pages/Worldcup';
import MorphDetail from './pages/MorphDetail';

// Page transition wrapper
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  enter:   { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  duration: 0.45,
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/"          element={<Landing />} />
          <Route path="/archive"   element={<Dashboard />} />
          <Route path="/worldcup"  element={<Worldcup />} />
          <Route path="/morph/:id" element={<MorphDetail />} />
          {/* Redirect old root to new landing */}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-surface-950 font-body text-zinc-100">
        <Navigation />
        <AnimatedRoutes />
      </div>
    </HashRouter>
  );
}
