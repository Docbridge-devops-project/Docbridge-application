import { useAuth } from '../../context/AuthContext';

export default function Header({ onMenuClick }) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-6 py-3">
        <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="flex-1" />
        <button onClick={logout} className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
          Logout
        </button>
      </div>
    </header>
  );
}
