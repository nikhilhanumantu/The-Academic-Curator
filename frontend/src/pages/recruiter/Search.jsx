import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

function Avatar({ name, src, size = 'md' }) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-14 h-14 text-xl', lg: 'w-20 h-20 text-3xl' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

export default function RecruiterSearch() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savedIds, setSavedIds] = useState([]);

  const fetchStudents = async (q) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/students${q ? `?query=${encodeURIComponent(q)}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch { } finally { setLoading(false); }
  };

  const fetchSaved = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/recruiters/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedIds(res.data.map(s => s.userId?._id || s._id));
    } catch { }
  };

  useEffect(() => {
    if (token) { fetchStudents(''); fetchSaved(); }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSave = async (studentUserId) => {
    try {
      if (savedIds.includes(studentUserId)) {
        await axios.delete(`http://localhost:5000/api/recruiters/save/${studentUserId}`, { headers: { Authorization: `Bearer ${token}` } });
        setSavedIds(prev => prev.filter(id => id !== studentUserId));
      } else {
        await axios.post('http://localhost:5000/api/recruiters/save', { studentId: studentUserId }, { headers: { Authorization: `Bearer ${token}` } });
        setSavedIds(prev => [...prev, studentUserId]);
      }
    } catch { }
  };

  const handleChat = (studentUserId) => {
    navigate(`/recruiter/chat?student=${studentUserId}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-body">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Search Talent</h1>
            <p className="text-slate-500 mt-1">{loading ? 'Searching...' : `${students.length} student${students.length !== 1 ? 's' : ''} found`}</p>
          </div>
          <div className="relative group w-full md:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              placeholder="Search by name, skill, major, or bio..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-slate-50 rounded-xl" />
              </div>
            ))
          ) : students.map(student => (
            <div
              key={student._id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar name={student.userId?.name} src={student.profilePicture} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 leading-tight">{student.userId?.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{student.major || 'Student'}</p>
                        {student.location && <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[12px]">location_on</span>{student.location}</p>}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleSave(student.userId?._id); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: savedIds.includes(student.userId?._id) ? "'FILL' 1" : "'FILL' 0", color: savedIds.includes(student.userId?._id) ? '#4f46e5' : undefined }}>bookmark</span>
                      </button>
                    </div>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Available
                    </span>
                  </div>
                </div>

                {student.bio && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{student.bio}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(student.skills || []).slice(0, 4).map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-full border border-slate-100">{s}</span>
                  ))}
                  {student.skills?.length > 4 && (
                    <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-full border border-slate-100">+{student.skills.length - 4}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleChat(student.userId?._id); }}
                    className="flex-1 py-2 bg-blue-700 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => navigate(`/recruiter/student-profile/${student.userId._id}`)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && students.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">person_off</span>
            <h3 className="text-2xl font-extrabold text-slate-700 tracking-tight">No Talent Found</h3>
            <p className="text-slate-400 mt-2 max-w-sm">Try different search terms to discover exceptional candidates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
