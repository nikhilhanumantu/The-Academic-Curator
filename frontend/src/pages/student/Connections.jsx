import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Avatar({ name, src, size = 'md', className = '' }) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover shrink-0 ${className}`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

function ConnectionButton({ targetId, currentUserId, token, onConnect }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!targetId || targetId?.toString() === currentUserId?.toString()) {
      setStatus('self');
      return;
    }
    axios.get(`http://localhost:5000/api/connections/status/${targetId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => setStatus(r.data.status || 'none'))
      .catch(() => setStatus('none'));
  }, [targetId, currentUserId, token]);

  const handleClick = async () => {
    if (status === 'none') {
      try {
        await axios.post(
          `http://localhost:5000/api/connections/request/${targetId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatus('pending');
        onConnect && onConnect();
      } catch { }
    }
  };

  if (status === 'loading' || status === 'self') return null;

  const configs = {
    none:     { label: 'Connect',   icon: 'person_add',  cls: 'bg-blue-700 text-white hover:bg-blue-800' },
    pending:  { label: 'Pending',   icon: 'schedule',    cls: 'bg-slate-100 text-slate-400 cursor-default' },
    accepted: { label: 'Connected', icon: 'how_to_reg',  cls: 'bg-green-50 text-green-700 border border-green-200' },
    rejected: { label: 'Connect',   icon: 'person_add',  cls: 'bg-blue-700 text-white hover:bg-blue-800' },
  };
  const c = configs[status] || configs.none;

  return (
    <button
      onClick={handleClick}
      disabled={status === 'pending' || status === 'accepted'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${c.cls}`}
    >
      <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
      {c.label}
    </button>
  );
}

/* ── Role badge ───────────────────────────────────────────────────── */
function RoleBadge({ role }) {
  return role === 'recruiter' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
      <span className="material-symbols-outlined text-[11px]">business_center</span>
      Recruiter
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
      <span className="material-symbols-outlined text-[11px]">school</span>
      Student
    </span>
  );
}

export default function StudentConnections() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tab, setTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'student' | 'recruiter'
  const [loading, setLoading] = useState(true);

  const currentUserId = user?._id?.toString() || user?.id?.toString();

  /* ── Fetch everything ──────────────────────────────────────────── */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [myRes, pendingRes, studentsRes, recruitersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/connections/my',      { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/connections/pending', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/students/',           { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/recruiters/all',      { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setConnections(myRes.data);
      setPending(pendingRes.data);

      /* — IDs already connected — */
      const getConnectedUserId = (conn) => {
        const requesterId =
          conn.requester?._id?.toString() ||
          conn.requester?.id?.toString()   ||
          conn.requester?.toString();
        const isRequester = requesterId === currentUserId;
        return isRequester
          ? (conn.recipient?._id || conn.recipient)
          : (conn.requester?._id || conn.requester);
      };

      const myConnIds   = myRes.data
        .map(c => { const id = getConnectedUserId(c); return id ? id.toString() : null; })
        .filter(Boolean);

      const pendingIds  = pendingRes.data
        .map(c => c.requester?._id ? c.requester._id.toString() : null)
        .filter(Boolean);

      /* — Normalize students — */
      const normalizedStudents = (studentsRes.data || [])
        .filter(s => s.userId?._id)
        .map(s => ({ ...s, _profileRole: 'student' }));

      /* — Normalize recruiters — */
      const normalizedRecruiters = (recruitersRes.data || [])
        .filter(r => r.userId?._id)
        .map(r => ({
          ...r,
          _profileRole: 'recruiter',
          // Build a subtitle field used in search & display
          _subtitle: [r.position, r.companyName].filter(Boolean).join(' at ') || 'Recruiter',
          // Recruiter tags to display instead of skills
          _tags: [r.industry, r.location, r.status].filter(Boolean),
        }));

      const combined = [...normalizedStudents, ...normalizedRecruiters];
      setAllProfiles(combined);

      /* — Fetch sent-request statuses to exclude them from discover — */
      let sentIds = [];
      try {
        const statusResults = await Promise.all(
          combined.map(p =>
            axios
              .get(`http://localhost:5000/api/connections/status/${p.userId._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .catch(() => ({ data: { status: 'none' } }))
          )
        );
        sentIds = statusResults
          .map((r, i) =>
            r.data.status !== 'none' ? combined[i].userId._id.toString() : null
          )
          .filter(Boolean);
      } catch { }

      const excluded = new Set([...myConnIds, ...pendingIds, ...sentIds, currentUserId].filter(Boolean));

      setDiscover(combined.filter(p => {
        const uid = p.userId?._id?.toString();
        return uid && !excluded.has(uid);
      }));
    } catch (err) {
      console.error('fetchAll error:', err);
      alert('Error loading connections: ' + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchAll(); }, [token]);

  /* ── Respond to pending request ─────────────────────────────────── */
  const handleRespond = async (connId, action) => {
    try {
      await axios.put(
        `http://localhost:5000/api/connections/respond/${connId}`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAll();
    } catch { }
  };

  /* ── Get connected partner from a connection object ─────────────── */
  const getConnectedUser = (conn) => {
    if (!conn) return null;
    const requesterId =
      conn.requester?._id?.toString() ||
      conn.requester?.id?.toString();
    const partner = requesterId === currentUserId ? conn.recipient : conn.requester;
    // Safety: if partner resolves to self (stale self-connection in DB), return null
    const partnerId = partner?._id?.toString() || partner?.id?.toString();
    if (!partnerId || partnerId === currentUserId) return null;
    return partner;
  };

  /* ── Navigate to the right profile page ─────────────────────────── */
  const viewProfile = (profile) => {
    const uid = profile.userId?._id?.toString() || profile.userId?.toString();
    if (!uid) return;
    if (profile._profileRole === 'recruiter') {
      navigate(`/${user?.role || 'student'}/recruiter-profile/${uid}`);
    } else {
      navigate(`/${user?.role || 'student'}/student-profile/${uid}`);
    }
  };

  /* ── Filtered discover list ──────────────────────────────────────── */
  const filteredDiscover = discover.filter(p => {
    const matchRole =
      filter === 'all' ||
      p._profileRole === filter;

    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      p.userId?.name?.toLowerCase().includes(q) ||
      (p.major || '').toLowerCase().includes(q) ||
      (p._subtitle || '').toLowerCase().includes(q) ||
      (p.companyName || '').toLowerCase().includes(q) ||
      (p.industry || '').toLowerCase().includes(q) ||
      (p.skills || []).some(s => s.toLowerCase().includes(q));

    return matchRole && matchSearch;
  });

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="bg-slate-100 min-h-screen font-body">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Connections</h1>
          <p className="text-slate-500 mt-1">Grow your professional network — students & recruiters</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="flex border-b border-slate-100">
            {[
              { key: 'connections', label: `My Connections (${connections.length})` },
              { key: 'pending',     label: `Requests (${pending.length})`,           badge: pending.length },
              { key: 'discover',    label: 'Discover People' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
                  tab === t.key ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-t-full" />
                )}
                {t.badge > 0 && tab !== t.key && (
                  <span className="ml-1 text-[10px] bg-blue-700 text-white px-1.5 py-0.5 rounded-full">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* ── My Connections ── */}
                {tab === 'connections' && (
                  <div>
                    {connections.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3 block">group</span>
                        <p className="font-semibold">No connections yet</p>
                        <button
                          onClick={() => setTab('discover')}
                          className="mt-3 text-blue-600 font-bold text-sm hover:underline"
                        >
                          Discover people to connect with →
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {connections.map(conn => {
                          const partner = getConnectedUser(conn);
                          // Skip self-connections (stale DB entries)
                          if (!partner) return null;
                          const fullProfile = allProfiles.find(
                            p => p.userId?._id?.toString() === partner?._id?.toString()
                          );
                          return (
                            <div
                              key={conn._id}
                              className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all"
                            >
                              <Avatar
                                name={partner?.name}
                                src={fullProfile?.profilePicture}
                                size="md"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate">{partner?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{partner?.email}</p>
                                {fullProfile && (
                                  <RoleBadge role={fullProfile._profileRole} />
                                )}
                              </div>
                              <button
                                onClick={() => fullProfile && viewProfile(fullProfile)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors mr-1"
                                title="View profile"
                              >
                                <span className="material-symbols-outlined text-[18px]">person</span>
                              </button>
                              <Link
                                to={`/${user?.role || 'student'}/chat?student=${partner?._id}`}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Chat"
                              >
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Pending Requests ── */}
                {tab === 'pending' && (
                  <div>
                    {pending.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3 block">mail</span>
                        <p className="font-semibold">No pending requests</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pending.map(req => {
                          const fullProfile = allProfiles.find(
                            p => p.userId?._id?.toString() === req.requester?._id?.toString()
                          );
                          return (
                            <div
                              key={req._id}
                              className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl"
                            >
                              <Avatar
                                name={req.requester?.name}
                                src={fullProfile?.profilePicture}
                                size="md"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900">{req.requester?.name}</p>
                                <p className="text-xs text-slate-400">{req.requester?.email}</p>
                                {fullProfile && <RoleBadge role={fullProfile._profileRole} />}
                              </div>
                              <div className="flex gap-2 shrink-0 items-center">
                                {fullProfile && (
                                  <button
                                    onClick={() => viewProfile(fullProfile)}
                                    className="px-3 py-2 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
                                  >
                                    View Profile
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRespond(req._id, 'accept')}
                                  className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRespond(req._id, 'reject')}
                                  className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                  Ignore
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Discover People ── */}
                {tab === 'discover' && (
                  <div>
                    {/* Search + Filter row */}
                    <div className="flex gap-3 mb-5">
                      <div className="relative flex-1">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          search
                        </span>
                        <input
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder="Search by name, major, company, skill…"
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                        />
                      </div>
                      {/* Role filter pills */}
                      <div className="flex gap-2 items-center">
                        {[
                          { key: 'all',       label: 'All' },
                          { key: 'student',   label: 'Students' },
                          { key: 'recruiter', label: 'Recruiters' },
                        ].map(f => (
                          <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                              filter === f.key
                                ? 'bg-blue-700 text-white border-blue-700'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Count label */}
                    <p className="text-xs text-slate-400 mb-4">
                      Showing <span className="font-bold text-slate-600">{filteredDiscover.length}</span> people
                      {filter !== 'all' && ` (${filter}s only)`}
                    </p>

                    {filteredDiscover.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3 block">person_off</span>
                        <p className="font-semibold">No people found</p>
                        {search && (
                          <button
                            onClick={() => setSearch('')}
                            className="mt-2 text-blue-600 text-sm font-bold hover:underline"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredDiscover.map(p => {
                          const isRecruiter = p._profileRole === 'recruiter';
                          return (
                            <div
                              key={p._id}
                              className={`p-4 border rounded-2xl hover:shadow-sm transition-all ${
                                isRecruiter
                                  ? 'border-purple-100 hover:border-purple-300 bg-white'
                                  : 'border-slate-100 hover:border-blue-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <Avatar name={p.userId?.name} src={p.profilePicture} size="md" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <p className="font-bold text-slate-900 text-sm truncate">{p.userId?.name}</p>
                                    <RoleBadge role={p._profileRole} />
                                  </div>
                                  <p className="text-xs text-slate-400 truncate">
                                    {isRecruiter ? p._subtitle : (p.major || p.headline || 'Student')}
                                  </p>
                                </div>
                              </div>

                              {/* Tags: skills for students, industry/location for recruiters */}
                              {isRecruiter ? (
                                p._tags?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {p._tags.map((tag, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )
                              ) : (
                                p.skills?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {p.skills.slice(0, 3).map((skill, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                    {p.skills.length > 3 && (
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">
                                        +{p.skills.length - 3}
                                      </span>
                                    )}
                                  </div>
                                )
                              )}

                              <div className="flex flex-wrap gap-2">
                                <ConnectionButton
                                  targetId={p.userId?._id}
                                  currentUserId={currentUserId}
                                  token={token}
                                  onConnect={fetchAll}
                                />
                                <button
                                  onClick={() => viewProfile(p)}
                                  className="px-3 py-1.5 rounded-full text-xs font-bold transition-all bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                                >
                                  View Profile
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
