import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

function StatCard({ icon, iconColor, bgColor, label, value, badge }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all">
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${bgColor} rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity`} />
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
        </div>
        {badge && <span className={`text-[10px] font-bold ${iconColor} px-2 py-1 ${bgColor} rounded-full`}>{badge}</span>}
      </div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{label}</p>
      <h3 className="text-4xl font-extrabold text-slate-900 mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
    </div>
  );
}

export default function RecruiterDashboard() {
  const { user } = useContext(AuthContext);
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState({ viewed: 0, saved: 0, chats: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentStudents, setRecentStudents] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/recruiters/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch { } finally { setLoadingStats(false); }
    };

    const fetchRecent = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/students/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentStudents(res.data.slice(0, 5));
      } catch { }
    };

    if (token) { fetchStats(); fetchRecent(); }
  }, [token]);

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="min-h-screen bg-slate-100 font-body">
      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg">
                {initials(user?.name)}
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Welcome back, {user?.name?.split(' ')[0] || 'Recruiter'}!
                </h2>
                <p className="text-slate-500 text-sm">Here's your live recruitment overview.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/recruiter/search"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white font-bold text-sm rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-200"
            >
              <span className="material-symbols-outlined text-[18px]">person_search</span>
              Search Talent
            </Link>
            <Link
              to="/recruiter/saved"
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
              Saved
            </Link>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon="visibility"
            iconColor="text-blue-700"
            bgColor="bg-blue-50"
            label="Candidates Viewed"
            value={loadingStats ? '—' : stats.viewed}
            badge="Live"
          />
          <StatCard
            icon="bookmark"
            iconColor="text-indigo-700"
            bgColor="bg-indigo-50"
            label="Saved Candidates"
            value={loadingStats ? '—' : stats.saved}
          />
          <StatCard
            icon="forum"
            iconColor="text-emerald-700"
            bgColor="bg-emerald-50"
            label="Active Conversations"
            value={loadingStats ? '—' : stats.chats}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Recent Talent */}
          <section className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">Recent Talent</h4>
              <Link to="/recruiter/search" className="text-blue-700 text-sm font-bold hover:underline flex items-center gap-1">
                View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>

            {recentStudents.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-3 block">group</span>
                <p className="font-medium text-sm">No students yet. <Link to="/recruiter/search" className="text-blue-600 hover:underline">Search talent →</Link></p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentStudents.map((student, i) => (
                  <div key={student._id} className="flex items-center gap-4 group cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {initials(student.userId?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{student.userId?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{student.major || 'Student'} {student.location ? `· ${student.location}` : ''}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            to={`/recruiter/chat?student=${student.userId?._id}`}
                            className="px-3 py-1.5 bg-blue-700 text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition-colors"
                          >
                            Message
                          </Link>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(student.skills || []).slice(0, 4).map((s, j) => (
                          <span key={j} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sidebar Tips */}
          <section className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <span className="material-symbols-outlined text-blue-400 text-3xl mb-3 block">tips_and_updates</span>
                <h5 className="text-lg font-extrabold mb-2">Recruiter Tip</h5>
                <p className="text-sm text-white/70 leading-relaxed mb-4">Use the search bar to filter by skills, major, or name. Save top candidates to your shortlist for quick access.</p>
                <Link to="/recruiter/search" className="block w-full py-2.5 border border-white/20 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors text-center uppercase tracking-widest">
                  Find Talent Now
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h5 className="text-sm font-extrabold text-slate-900 mb-4 uppercase tracking-widest">Quick Actions</h5>
              <div className="space-y-2">
                {[
                  { icon: 'search', label: 'Search by Skill', path: '/recruiter/search' },
                  { icon: 'bookmark', label: 'View Saved Candidates', path: '/recruiter/saved' },
                  { icon: 'chat', label: 'Open Messages', path: '/recruiter/chat' },
                ].map(a => (
                  <Link key={a.path} to={a.path} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors text-sm font-medium">
                    <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
