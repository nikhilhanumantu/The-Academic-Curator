import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function Avatar({ name, src, size = 'md' }) {
  const sizes = { sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-xl' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover shrink-0`} />;
  return <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0`}>{initials}</div>;
}

export default function RecruiterSaved() {
  const { token } = useContext(AuthContext);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/recruiters/saved', { headers: { Authorization: `Bearer ${token}` } });
      setSaved(res.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchSaved(); }, [token]);

  const handleUnsave = async (studentUserId) => {
    try {
      await axios.delete(`http://localhost:5000/api/recruiters/save/${studentUserId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSaved(prev => prev.filter(s => s.userId?._id !== studentUserId));
    } catch { }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-body">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Candidates</h1>
          <p className="text-slate-500 mt-1">{saved.length} candidate{saved.length !== 1 ? 's' : ''} in your shortlist</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : saved.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">bookmark</span>
            <h3 className="text-xl font-extrabold text-slate-700">No saved candidates yet</h3>
            <p className="text-slate-400 mt-2 mb-6">Search talent and save candidates to your shortlist.</p>
            <Link to="/recruiter/search" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors">
              <span className="material-symbols-outlined">search</span>
              Search Talent
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
            {saved.map(student => (
              <div key={student._id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group">
                <Avatar name={student.userId?.name} src={student.profilePicture} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{student.userId?.name}</h3>
                  <p className="text-sm text-slate-400">{student.major || 'Student'}{student.location ? ` · ${student.location}` : ''}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(student.skills || []).slice(0, 5).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/recruiter/chat?student=${student.userId?._id}`}
                    className="px-4 py-2 bg-blue-700 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    Message
                  </Link>
                  <button
                    onClick={() => handleUnsave(student.userId?._id)}
                    className="px-4 py-2 bg-red-50 text-red-500 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">bookmark_remove</span>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
