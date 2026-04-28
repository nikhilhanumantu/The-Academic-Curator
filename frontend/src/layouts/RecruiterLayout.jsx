import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function RecruiterLayout() {
  const location = useLocation();
  const { user, token, loading, logout } = useContext(AuthContext);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-surface">Loading portal...</div>;

  // Protect route
  if (!token || (user && user.role !== 'recruiter')) {
      return <Navigate to="/recruiter/login" />;
  }

  const getLinkClasses = (path) => {
    const isActive = location.pathname.includes(path);
    if (isActive) {
      return "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[#0253cd] dark:text-cyan-400 font-bold border-r-4 border-[#0253cd] bg-white/50 font-manrope tracking-tight text-sm";
    }
    return "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[#595c5e] dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800 font-manrope tracking-tight text-sm font-medium";
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-[#eff1f3] dark:bg-slate-900 flex flex-col py-8 px-4 z-50">
        <div className="mb-10 px-2 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold font-manrope text-slate-800 dark:text-slate-100 tracking-tighter">The Curator</h1>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold opacity-50 mt-1">Recruiter Portal</p>
            </div>
        </div>
        
        <nav className="flex-1 space-y-1">
            <Link to="/recruiter/dashboard" className={getLinkClasses('/dashboard')}>
                <span className="material-symbols-outlined">dashboard</span>
                <span>Dashboard</span>
            </Link>
            <Link to="/recruiter/search" className={getLinkClasses('/search')}>
                <span className="material-symbols-outlined">search</span>
                <span>Search Talent</span>
            </Link>
            <Link to="/recruiter/saved" className={getLinkClasses('/saved')}>
                <span className="material-symbols-outlined">bookmark</span>
                <span>Saved Candidates</span>
            </Link>
            <Link to="/recruiter/connections" className={getLinkClasses('/connections')}>
                <span className="material-symbols-outlined">hub</span>
                <span>Connections</span>
            </Link>
            <Link to="/recruiter/chat" className={getLinkClasses('/chat')}>
                <span className="material-symbols-outlined">chat</span>
                <span>Chat</span>
            </Link>
        </nav>

        <div className="mt-auto px-2">
            <button onClick={logout} className="w-full bg-white/50 text-[#b31b25] font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-white transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">logout</span>
                Log Out
            </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className={`ml-64 flex-1 ${location.pathname.includes('/chat') ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
          {/* TopNavBar - only show if not on chat page */}
          {!location.pathname.includes('/chat') && (
            <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-[#f5f6f8]/70 backdrop-blur-xl flex justify-between items-center px-8">
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    {/* reserved slot */}
                </div>
                <Link to="/recruiter/profile" className="flex items-center gap-3 group">
                    <div className="text-right group-hover:opacity-80 transition-opacity">
                       <span className="block text-xs font-bold text-slate-800">{user?.name || 'Recruiter'}</span>
                       <span className="text-[10px] text-slate-400 uppercase tracking-widest">View Profile</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform shadow-lg shadow-blue-200/50">
                      {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'RR'}
                    </div>
                </Link>
            </header>
          )}

          <div className={!location.pathname.includes('/chat') ? 'pt-16' : ''}>
            <Outlet />
          </div>
      </main>
    </div>
  );
}
