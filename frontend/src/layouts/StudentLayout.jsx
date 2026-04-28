import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/* Only 3 links in the sidebar */
const NAV_LINKS = [
  { icon: 'dashboard',   label: 'Home',        path: '/student/dashboard' },
  { icon: 'group',       label: 'Connections', path: '/student/connections' },
  { icon: 'chat_bubble', label: 'Messages',    path: '/student/chat' },
];

/* Pages that show the sidebar (including Profile now) */
const SIDEBAR_PAGES = [
  '/student/dashboard',
  '/student/connections',
  '/student/chat',
  '/student/profile',
];

const styles = `
  /* ── Sidebar link styles ── */
  .sl-link {
    display:flex; align-items:center; gap:12px; padding:11px 14px;
    border-radius:12px; font-size:13.5px; font-weight:600;
    color:#595c5e; transition:all .18s; text-decoration:none;
  }
  .sl-link:hover  { color:#2c2f31; background:#e8eaec; transform:translateX(3px); }
  .sl-link.sl-active { color:#0253cd; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.08); }

  /* ── Sidebar slide animations ── */
  .sidebar-panel {
    transform: translateX(-100%);
    transition: transform 320ms cubic-bezier(.4,0,.2,1),
                box-shadow 320ms ease;
    box-shadow: none;
  }
  .sidebar-panel.sidebar-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0,0,0,.08);
  }

  /* ── Main content shift ── */
  .main-content {
    transition: margin-left 320ms cubic-bezier(.4,0,.2,1);
  }

  /* ── Bottom nav slide ── */
  .bottom-nav {
    transform: translateY(100%);
    transition: transform 320ms cubic-bezier(.4,0,.2,1);
  }
  .bottom-nav.bottom-nav-open {
    transform: translateY(0);
  }
`;

export default function StudentLayout() {
  const location = useLocation();
  const { user, token, loading, logout } = useContext(AuthContext);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#f5f6f8]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#0253cd] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#595c5e] text-xs font-bold uppercase tracking-widest">Loading...</p>
      </div>
    </div>
  );

  if (!token || (user && user.role !== 'student')) {
    return <Navigate to="/student/login" />;
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'S';

  const showSidebar = SIDEBAR_PAGES.some(p => location.pathname.startsWith(p));
  const isChat      = location.pathname.includes('/chat');

  return (
    <div className="flex min-h-screen bg-[#f5f6f8] font-['Manrope']">
      <style>{styles}</style>

      {/* ── Left Sidebar — always mounted, slides in/out via CSS ── */}
      <aside
        className={`sidebar-panel fixed left-0 top-0 h-full w-64 bg-[#eff1f3] flex-col p-4 z-50 rounded-r-3xl hidden md:flex ${showSidebar ? 'sidebar-open' : ''}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-3 pt-3 pb-7">
          <div className="w-9 h-9 bg-[#0253cd] rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-[20px]">gallery_thumbnail</span>
          </div>
          <div>
            <p className="text-[15px] font-black text-[#2c2f31] leading-tight">The Curator</p>
            <p className="text-[9px] uppercase tracking-widest text-[#595c5e] font-bold">Talent Gallery</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-grow space-y-0.5">
          {NAV_LINKS.map(link => {
            const active = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`sl-link ${active ? 'sl-active' : ''}`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="pt-3 border-t border-[#abadaf]/20">
          <button onClick={logout} className="sl-link w-full text-left">
            <span className="material-symbols-outlined text-[22px]">logout</span>
            Sign Out
          </button>
        </div>

        {/* Avatar row → Profile page */}
        <Link
          to="/student/profile"
          className="mt-3 flex items-center gap-3 px-3 py-3 bg-white/60 hover:bg-white/90 rounded-2xl transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0253cd] to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0 group-hover:ring-2 group-hover:ring-[#0253cd]/30 transition-all">
            {initials}
          </div>
          <div className="overflow-hidden flex-grow">
            <p className="text-xs font-bold text-[#2c2f31] truncate">{user?.name}</p>
            <p className="text-[10px] text-[#595c5e] truncate">{user?.email}</p>
          </div>
          <span className="material-symbols-outlined text-[16px] text-[#595c5e] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">chevron_right</span>
        </Link>
      </aside>

      {/* ── Main Content — margin shifts with sidebar ── */}
      <main
        className={`main-content flex-1 ${showSidebar ? 'md:ml-64' : 'md:ml-0'} ${isChat ? 'h-screen overflow-hidden' : 'min-h-screen'}`}
      >
        <Outlet />
      </main>

      {/* ── Mobile Bottom Nav — slides up/down ── */}
      <nav
        className={`bottom-nav md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-[#abadaf]/20 z-50 px-6 py-2 flex justify-around items-center ${showSidebar ? 'bottom-nav-open' : ''}`}
      >
        {NAV_LINKS.map(link => {
          const active = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${active ? 'text-[#0253cd]' : 'text-[#595c5e]'}`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {link.icon}
              </span>
              <span className="text-[9px] font-bold">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
