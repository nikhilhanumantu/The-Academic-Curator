import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
    return url;
  }
  return `https://${url}`;
};

export default function RecruiterProfile() {
  const { user, token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ viewed: 0, saved: 0, chats: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/recruiters/profile', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/recruiters/stats', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setProfile(profileRes.data);
        setFormData({
          name: profileRes.data.userId?.name || '',
          companyName: profileRes.data.companyName || '',
          position: profileRes.data.position || '',
          bio: profileRes.data.bio || '',
          industry: profileRes.data.industry || '',
          size: profileRes.data.size || '',
          location: profileRes.data.location || '',
          status: profileRes.data.status || 'Hiring Active',
          mission: profileRes.data.mission || '',
          linkedin: profileRes.data.linkedin || '',
          websiteUrl: profileRes.data.websiteUrl || '',
        });
        setStats(statsRes.data);
      } catch (err) {
        console.error("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'RR';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.put('http://localhost:5000/api/recruiters/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedProfile = { ...res.data };
      if (!updatedProfile.userId && profile.userId) {
          updatedProfile.userId = { ...profile.userId, name: formData.name };
      }
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading your profile…</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-body selection:bg-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-10 pb-32">
        
        {/* Premium Banner Section */}
        <div className="relative group mb-12 md:mb-20">
            <div className="h-48 md:h-64 rounded-[2.5rem] bg-gradient-to-br from-[#0c1a2d] via-[#1a365d] to-[#04336c] overflow-hidden shadow-2xl relative">
                {/* Abstract Glass Elements */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-5%] w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                
                {/* Top Right Label */}
                <div className="absolute top-6 right-6 md:top-8 md:right-8 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                    <span className="text-white/80 text-[10px] uppercase font-bold tracking-[0.2em]">Validated Talent Partner</span>
                </div>
            </div>

            {/* Profile Avatar & Title Overlay */}
            <div className="px-4 md:px-10 -mt-16 md:-mt-20 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                    <div className="relative shrink-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-[2.2rem] blur opacity-30 group-hover:opacity-60 transition duration-700" />
                        {profile?.profilePicture ? (
                            <img src={profile.profilePicture} className="relative w-36 h-36 md:w-44 md:h-44 rounded-[2rem] object-cover border-[6px] border-white shadow-2xl bg-white" alt={profile?.userId?.name} />
                        ) : (
                            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-800 border-[6px] border-white flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-2xl shrink-0">
                                {initials(profile?.userId?.name)}
                            </div>
                        )}
                        {isEditing && (
                            <label className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-10 h-10 bg-blue-700 text-white rounded-xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>
                    
                    <div className="pb-2 md:pb-4">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                             <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100 shadow-sm">
                                {profile?.status || 'Hiring Active'}
                            </span>
                            {profile?.industry && (
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 shadow-sm">
                                    {profile.industry}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter drop-shadow-sm truncate max-w-md">
                            {profile?.userId?.name}
                        </h1>
                        <p className="text-slate-500 text-base md:text-lg font-semibold tracking-tight mt-1">
                            {profile?.position} at <span className="text-blue-700 font-black decoration-blue-200 underline decoration-4 underline-offset-4">{profile?.companyName}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 pb-2 md:pb-4">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="px-6 md:px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl text-sm shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">palette</span>
                            Edit Identity
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button onClick={() => setIsEditing(false)} className="px-4 md:px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl text-sm hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleSave} className="px-6 md:px-8 py-3 bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                Save Portfolio
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up mt-20">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-1 bg-blue-600 rounded-full" />
                            Core Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label><input name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" /></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Job Title</label><input name="position" value={formData.position} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" /></div>
                            <div className="md:col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Personal Bio</label><textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Share your professional mission..." /></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-8 h-1 bg-indigo-600 rounded-full" />
                            Presence & Links
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">LinkedIn URL</label><input name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="linkedin.com/in/..." /></div>
                            <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Corporate Website</label><input name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="https://..." /></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 h-fit space-y-8">
                     <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <span className="w-8 h-1 bg-cyan-500 rounded-full" />
                        Organization
                    </h3>
                    <div className="space-y-5">
                        <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Company Name</label><input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:border-cyan-500 outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Industry</label><input name="industry" value={formData.industry} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:border-cyan-500 outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Location</label><input name="location" value={formData.location} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:border-cyan-500 outline-none" /></div>
                        <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Organization Size</label><input name="size" value={formData.size} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold focus:border-cyan-500 outline-none" placeholder="e.g. 500+ Employees" /></div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-20">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* About Module */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                            <span className="w-10 h-1 bg-blue-700 rounded-full" />
                            About
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                            {profile?.bio || "No professional bio provided yet. Tell candidates about your goals and expectations."}
                        </p>
                        
                        {(profile?.linkedin || profile?.websiteUrl) && (
                            <div className="flex gap-6 mt-10">
                                {profile?.linkedin && (
                                    <a href={ensureAbsoluteUrl(profile.linkedin)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-700 hover:scale-105 transition-transform">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px]">link</span>
                                        </div>
                                        LinkedIn
                                    </a>
                                )}
                                {profile?.websiteUrl && (
                                    <a href={ensureAbsoluteUrl(profile.websiteUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:scale-105 transition-transform">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px]">public</span>
                                        </div>
                                        Website
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Organization Info Grid */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 flex flex-col gap-10">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <span className="w-10 h-1 bg-indigo-700 rounded-full" />
                            Organization Details
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { icon: 'corporate_fare', label: 'Company', value: profile?.companyName },
                                { icon: 'factory', label: 'Industry', value: profile?.industry },
                                { icon: 'groups', label: 'Scale', value: profile?.size },
                                { icon: 'location_on', label: 'Region', value: profile?.location },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-3">
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                                    <p className="text-sm font-black text-slate-800">{item.value || 'Not Disclosed'}</p>
                                </div>
                            ))}
                        </div>

                        {profile?.mission && (
                            <div className="pt-8 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Mission</p>
                                <blockquote className="text-xl font-bold text-slate-900 border-l-4 border-indigo-200 pl-6 italic">
                                    "{profile.mission}"
                                </blockquote>
                            </div>
                        )}
                    </div>
                </div>

                {/* Engagement Column */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                     <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 px-1">Performance Overview</h4>
                        <div className="space-y-8">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <span className="material-symbols-outlined text-white/50">visibility</span>
                                    </div>
                                    <span className="text-sm font-bold text-white/60">Candidates Viewed</span>
                                </div>
                                <span className="text-3xl font-black">{stats.viewed}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <span className="material-symbols-outlined text-white/50">bookmark</span>
                                    </div>
                                    <span className="text-sm font-bold text-white/60">Shortlisted Profiles</span>
                                </div>
                                <span className="text-3xl font-black">{stats.saved}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <span className="material-symbols-outlined text-white/50">mode_comment</span>
                                    </div>
                                    <span className="text-sm font-bold text-white/60">Active Discusion</span>
                                </div>
                                <span className="text-3xl font-black">{stats.chats}</span>
                             </div>
                        </div>
                        <div className="mt-12 pt-8 border-t border-white/10">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">Curator Intelligence Verified</p>
                        </div>
                    </div>
                    
                    <button className="bg-white border border-slate-200 p-8 rounded-[2.5rem] text-center group hover:border-blue-500 transition-all">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">share</span>
                        </div>
                        <h5 className="font-black text-slate-900 mb-1">Share Portal</h5>
                        <p className="text-xs font-bold text-slate-400">Manage your recruitment links</p>
                    </button>
                </div>
            </div>
        )}
      </div>

        <style>{`
            @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>
    </div>
  );
}
