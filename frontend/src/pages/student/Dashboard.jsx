import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

/* ─── Aurora styles ──────────────────────────────────────────────────────── */
const auroraCSS = `
  .aurora-bg { background: linear-gradient(90deg,#FF7AF5 0%,#7AF7FF 50%,#B4FF9F 100%); }
  .aurora-text {
    background: linear-gradient(90deg,#FF7AF5,#7AF7FF,#B4FF9F);
    background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .glass-card { background: rgba(255,255,255,.7); backdrop-filter: blur(20px); }
  .pulse-teal { animation: pulseTeal 2s infinite; }
  @keyframes pulseTeal {
    0%   { box-shadow: 0 0 0 0 rgba(113,239,247,.7); }
    70%  { box-shadow: 0 0 0 10px rgba(113,239,247,0); }
    100% { box-shadow: 0 0 0 0 rgba(113,239,247,0); }
  }
`;

/* ─── Main Dashboard ────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);

  /* ── Data Fetching ── */
  useEffect(() => {
    if (!token) return;
    Promise.all([
      axios.get('http://localhost:5000/api/students/profile/me', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:5000/api/connections/my', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
      axios.get('http://localhost:5000/api/messages/conversations', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
    ]).then(([profileRes, connRes, msgRes]) => {
      setProfile(profileRes.data);
      setConnections(connRes.data || []);
      setMessages(msgRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  /* ── AI Suggestions ── */
  const fetchAISuggestions = async () => {
    if (loadingAI) return;
    setLoadingAI(true);
    try {
      const res = await axios.post('http://localhost:5000/api/ai/suggestions', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(res.data.suggestions || []);
    } catch {
      setSuggestions([
        { text: 'Add 2 more projects to enter the top 10% of developers in your region.' },
        { text: 'Link your GitHub to increase recruiter discovery by 30%.' },
        { text: 'Write a detailed bio to improve your keyword match score.' },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (token && !loading) fetchAISuggestions();
  }, [loading, token]);

  /* ── Profile Completion ── */
  const completionChecks = [
    !!profile?.bio,
    profile?.skills?.length > 0,
    profile?.projects?.length > 0,
    profile?.education?.length > 0,
    !!profile?.github,
    !!profile?.linkedin,
    !!profile?.profilePicture,
    !!profile?.headline,
  ];
  const completionPct = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f6f8]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-[#0253cd] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#595c5e]">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f5f6f8] font-['Manrope'] text-[#2c2f31] min-h-screen p-6 md:p-8 pb-24 md:pb-8">
      <style>{auroraCSS}</style>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── BENTO HERO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── Profile Snapshot Card (8/12) ── */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-white/60 hover:shadow-lg transition-shadow">
            {/* Card inner: Avatar | Info | EditBtn */}
            <div className="flex gap-5 items-start">

              {/* Avatar */}
              <div className="relative shrink-0">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={user?.name}
                    className="w-28 h-28 rounded-3xl object-cover shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#0253cd] to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl">
                    {initials}
                  </div>
                )}
                {/* Pulse bolt badge */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#71eff7] rounded-full border-4 border-white pulse-teal flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-[#004346]"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>bolt</span>
                </div>
              </div>

              {/* Info — stacked exactly like pic 2 */}
              <div className="flex-grow min-w-0">
                {/* Name */}
                <h1 className="text-2xl font-extrabold tracking-tight text-[#2c2f31] leading-tight mb-1">
                  {user?.name || 'Your Name'}
                </h1>

                {/* Headline (blue, bold, wraps) */}
                {profile?.headline ? (
                  <p className="text-[#0253cd] font-bold text-sm leading-snug mb-4">
                    {profile.headline}
                  </p>
                ) : (
                  <p className="text-[#abadaf] text-sm italic mb-4">
                    No headline yet —{' '}
                    <Link to="/student/profile-builder" className="text-[#0253cd] not-italic font-bold hover:underline">add one</Link>
                  </p>
                )}

                {/* Social pills (flex-wrap, compact) */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {profile?.github && (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#f0f2f4] hover:bg-[#e4e7ea] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-[#e4e7ea]">
                      <span className="material-symbols-outlined text-[15px]">link</span> GitHub
                    </a>
                  )}
                  {profile?.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#f0f2f4] hover:bg-[#e4e7ea] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-[#e4e7ea]">
                      <span className="material-symbols-outlined text-[15px]">work</span> LinkedIn
                    </a>
                  )}
                  {profile?.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#f0f2f4] hover:bg-[#e4e7ea] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-[#e4e7ea]">
                      <span className="material-symbols-outlined text-[15px]">language</span> Portfolio
                    </a>
                  )}
                  {!profile?.github && !profile?.linkedin && !profile?.websiteUrl && (
                    <Link to="/student/profile-builder"
                      className="flex items-center gap-1.5 bg-[#f0f2f4] px-3 py-1.5 rounded-xl text-xs font-semibold border border-dashed border-[#abadaf] text-[#595c5e]">
                      <span className="material-symbols-outlined text-[15px]">add_link</span> Add links
                    </Link>
                  )}
                </div>

                {/* Profile Completion */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#595c5e] uppercase tracking-widest">Profile Completion</span>
                    <span className="text-sm font-black text-[#0253cd]">{completionPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#e6e8eb] rounded-full overflow-hidden">
                    <div
                      className="h-full aurora-bg rounded-full transition-all duration-700"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Edit Profile — top-right */}
              <div className="shrink-0">
                <Link
                  to="/student/profile-builder"
                  className="bg-[#e8eaec] text-[#2c2f31] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#dde0e3] transition-colors whitespace-nowrap block"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* ── Curator Insights (4/12) ── */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 relative overflow-hidden group border border-white/60 min-h-[200px]">
            <div className="absolute inset-0 aurora-bg opacity-[0.07] blur-3xl group-hover:opacity-[0.12] transition-opacity pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-pink-50 rounded-xl">
                  <span className="material-symbols-outlined text-[#9e1e9b] text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <h3 className="text-sm font-extrabold">Curator Insights</h3>
                {loadingAI && (
                  <div className="ml-auto w-4 h-4 border-2 border-[#0253cd] border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Suggestions */}
              <ul className="space-y-2.5 flex-grow">
                {suggestions.length > 0 ? suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2.5 p-3 bg-[#f4f5f7] rounded-2xl">
                    <span className="material-symbols-outlined text-[#0253cd] text-[16px] mt-0.5 shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <p className="text-[11.5px] font-medium text-[#595c5e] leading-relaxed">{s.text}</p>
                  </li>
                )) : !loadingAI ? (
                  <li className="flex gap-2.5 p-3 bg-[#f4f5f7] rounded-2xl">
                    <span className="material-symbols-outlined text-[#0253cd] text-[16px] mt-0.5">auto_awesome</span>
                    <p className="text-[11.5px] font-medium text-[#595c5e]">Analysing your profile...</p>
                  </li>
                ) : null}
              </ul>

              {/* View all / Refresh */}
              <button
                onClick={fetchAISuggestions}
                disabled={loadingAI}
                className="mt-4 w-full text-center py-1.5 text-xs font-bold text-[#0253cd] hover:underline disabled:opacity-50"
              >
                {loadingAI ? 'Generating...' : 'View all suggestions'}
              </button>
            </div>
          </div>
        </div>

        {/* ── ANALYTICS STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: 'group',          label: 'Connections', value: connections.length,          badge: `${connections.length > 0 ? '+' + connections.length : '0'}`,        badgeCls: 'text-emerald-600 bg-emerald-50', iconCls: 'bg-blue-50 text-blue-600' },
            { icon: 'folder_shared',  label: 'Projects',    value: profile?.projects?.length||0, badge: `${profile?.projects?.length||0} total`,                             badgeCls: 'text-purple-600 bg-purple-50',  iconCls: 'bg-purple-50 text-purple-600' },
            { icon: 'school',         label: 'Education',   value: profile?.education?.length||0,badge: `${profile?.education?.length||0} entries`,                          badgeCls: 'text-amber-600 bg-amber-50',    iconCls: 'bg-amber-50 text-amber-600' },
            { icon: 'chat',           label: 'Messages',    value: messages.length,              badge: messages.length > 0 ? `${messages.length} chats` : '0 new',          badgeCls: 'text-pink-600 bg-pink-50',      iconCls: 'bg-pink-50 text-pink-600' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.iconCls}`}>
                  <span className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${stat.badgeCls}`}>{stat.badge}</span>
              </div>
              <p className="text-2xl font-black mb-0.5">{stat.value}</p>
              <p className="text-[10px] font-bold text-[#595c5e] uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── BOTTOM SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Recent Activity (8/12) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Recent Activity</h2>
              <Link to="/student/connections" className="text-xs font-bold text-[#0253cd] hover:underline">See All</Link>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-white/60 space-y-5">
              {connections.length > 0 ? connections.slice(0, 3).map((conn, i) => {
                const other = conn.requester?._id === user?._id ? conn.recipient : conn.requester;
                const dots = ['bg-[#0253cd]', 'bg-[#9e1e9b]', 'bg-[#00666b]'];
                return (
                  <div key={conn._id || i} className="flex gap-3 items-start">
                    <div className={`mt-1.5 w-2.5 h-2.5 ${dots[i % 3]} rounded-full shrink-0`} />
                    <div>
                      <p className="text-sm font-bold mb-0.5">Connected with {other?.name || 'a student'}</p>
                      <p className="text-xs text-[#595c5e]">Your network is growing — keep connecting!</p>
                    </div>
                  </div>
                );
              }) : (
                <>
                  <div className="flex gap-3 items-start">
                    <div className="mt-1.5 w-2.5 h-2.5 bg-[#0253cd] rounded-full shrink-0" />
                    <div>
                      <p className="text-sm font-bold mb-0.5">Profile Created</p>
                      <p className="text-xs text-[#595c5e]">Welcome! Complete your profile to boost visibility.</p>
                    </div>
                  </div>
                  {profile?.projects?.length > 0 && (
                    <div className="flex gap-3 items-start">
                      <div className="mt-1.5 w-2.5 h-2.5 bg-[#9e1e9b] rounded-full shrink-0" />
                      <div>
                        <p className="text-sm font-bold mb-0.5">Project Added: "{profile.projects[0].title}"</p>
                        <p className="text-xs text-[#595c5e]">Portfolio strength increased. Keep adding projects!</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 items-start">
                    <div className="mt-1.5 w-2.5 h-2.5 bg-[#00666b] rounded-full shrink-0" />
                    <div>
                      <p className="text-sm font-bold mb-0.5">AI Insights Generated</p>
                      <p className="text-xs text-[#595c5e]">Curator AI analysed your profile and generated suggestions.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: 'edit',         label: 'Edit Profile',      path: '/student/profile-builder', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { icon: 'description',  label: 'Generate Resume',   path: '/student/resume',          color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { icon: 'group',        label: 'Connections',       path: '/student/connections',     color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
              ].map(a => (
                <Link key={a.path} to={a.path}
                  className={`${a.color} p-4 rounded-2xl flex flex-col items-center gap-2 transition-colors text-center`}>
                  <span className="material-symbols-outlined text-[26px]">{a.icon}</span>
                  <span className="text-[11px] font-bold">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Chats (4/12) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold">Active Chats</h2>
              {messages.length > 0 && (
                <span className="px-2 py-0.5 bg-[#0253cd]/10 text-[#0253cd] text-[10px] font-black rounded-full">
                  {messages.length} CHATS
                </span>
              )}
            </div>
            <div className="bg-white rounded-3xl border border-white/60 flex-grow flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 flex flex-col gap-0.5 flex-grow">
                {messages.length > 0 ? messages.slice(0, 4).map((conv, i) => {
                  const other = conv.participant || {};
                  const oi = other?.name ? other.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
                  return (
                    <div key={conv._id || i} onClick={() => navigate('/student/chat')}
                      className="cursor-pointer hover:bg-[#f4f5f7] p-3 rounded-2xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {other?.profilePicture
                            ? <img src={other.profilePicture} alt={other.name} className="w-9 h-9 rounded-full object-cover" />
                            : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0253cd] to-indigo-600 flex items-center justify-center text-white text-xs font-black">{oi}</div>
                          }
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex-grow overflow-hidden">
                          <div className="flex justify-between">
                            <p className="text-xs font-extrabold truncate">{other?.name || 'User'}</p>
                            <span className="text-[9px] font-bold text-[#595c5e] shrink-0 ml-1">
                              {conv.lastMessage?.createdAt
                                ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Recent'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#595c5e] truncate">
                            {conv.lastMessage?.text || 'Start a conversation'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-6 text-[#595c5e]">
                    <span className="material-symbols-outlined text-4xl mb-2 text-[#abadaf]">chat_bubble</span>
                    <p className="text-sm font-semibold">No messages yet</p>
                    <p className="text-xs mt-1">Connect with students to start chatting</p>
                    <Link to="/student/connections" className="mt-3 text-xs font-bold text-[#0253cd] hover:underline">
                      Find people →
                    </Link>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-[#abadaf]/10">
                <Link to="/student/chat"
                  className="w-full py-2.5 bg-[#e8eaec] text-[#2c2f31] text-xs font-bold rounded-xl hover:bg-[#dde0e3] transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                  Open All Messages
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
