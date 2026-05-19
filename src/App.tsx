import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import MyPage from './pages/MyPage';
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
          <Route path="/"          element={<Dashboard />} />
          <Route path="/mypage"    element={<MyPage />} />
          <Route path="/morph/:id" element={<MorphDetail />} />
          {/* Legacy redirects */}
          <Route path="/archive"   element={<Navigate to="/" replace />} />
          <Route path="/worldcup"  element={<Navigate to="/" replace />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
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
