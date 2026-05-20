import Navigation from './components/Navigation';
import MainDashboard from './pages/MainDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-cream-50 font-sans text-slate-800">
      <Navigation />
      {/* pt-16 = 네비게이션 높이(h-16) 보정 */}
      <div className="pt-16">
        <MainDashboard />
      </div>
    </div>
  );
}
