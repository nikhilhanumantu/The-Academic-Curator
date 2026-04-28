import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
  return `https://${url}`;
};

const initials = (name) =>
  name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'RR';

export default function RecruiterProfileDetail() {
  const { id } = useParams(); // recruiter's userId
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    axios
      .get(`http://localhost:5000/api/recruiters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, id]);

  /* ── Loading ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profile)
    return (
      <div className="p-20 text-center text-slate-500 font-semibold">
        Recruiter profile not found.
      </div>
    );

  const recruiterName = profile.userId?.name || 'Recruiter';
  const recruiterEmail = profile.userId?.email || '';

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f8fafc] font-body selection:bg-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-10 pb-32">

        {/* ────────────────── BANNER HERO ────────────────────────── */}
        <div className="relative group mb-12 md:mb-20">
          {/* Dark gradient banner */}
          <div className="h-48 md:h-64 rounded-[2.5rem] bg-gradient-to-br from-[#0c1a2d] via-[#1a365d] to-[#04336c] overflow-hidden shadow-2xl relative">
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-5%] w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            />
            {/* Hiring status badge top-right */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <span className="text-white/80 text-[10px] uppercase font-bold tracking-[0.2em]">
                {profile.status || 'Hiring Active'}
              </span>
            </div>
          </div>

          {/* ── Avatar row: only the avatar overlaps the banner via -mt ── */}
          <div className="px-4 md:px-10 -mt-16 md:-mt-20 relative flex items-start justify-between gap-4">
            {/* Avatar only – pulls up over banner */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-[2.2rem] blur opacity-30 group-hover:opacity-60 transition duration-700" />
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  className="relative w-36 h-36 md:w-44 md:h-44 rounded-[2rem] object-cover border-[6px] border-white shadow-2xl bg-white"
                  alt={recruiterName}
                />
              ) : (
                <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-800 border-[6px] border-white flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-2xl shrink-0">
                  {initials(recruiterName)}
                </div>
              )}
            </div>

            {/* Back button – top-right, same row as avatar */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all border border-slate-200 shrink-0 mt-2"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Back
            </button>
          </div>

          {/* ── Info block: sits naturally BELOW the banner, beside/below the avatar ── */}
          <div className="px-4 md:px-10 mt-5 text-center md:text-left">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100 shadow-sm">
                {profile?.status || 'Hiring Active'}
              </span>
              {profile?.industry && (
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 shadow-sm">
                  {profile.industry}
                </span>
              )}
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-100 shadow-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[11px]">business_center</span>
                Recruiter
              </span>
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
              {recruiterName}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-500 text-base md:text-lg font-semibold tracking-tight mt-1">
              {profile?.position && <>{profile.position} at{' '}</>}
              <span className="text-blue-700 font-black">{profile?.companyName}</span>
            </p>

            {/* Links row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 mt-3 text-slate-500 text-sm font-medium">
              {profile?.linkedin && (
                <a href={ensureAbsoluteUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-700 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  LinkedIn
                </a>
              )}
              {profile?.websiteUrl && (
                <a href={ensureAbsoluteUrl(profile.websiteUrl)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-700 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">public</span>
                  Website
                </a>
              )}
              {profile?.location && (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {profile.location}
                </span>
              )}
              {recruiterEmail && (
                <a href={`mailto:${recruiterEmail}`}
                  className="flex items-center gap-1.5 hover:text-blue-700 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  {recruiterEmail}
                </a>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-5 justify-center md:justify-start">
              <button
                onClick={() => setContactOpen(true)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">contact_page</span>
                Contact Info
              </button>
              <button
                onClick={() => navigate(`/${user?.role || 'student'}/chat?student=${id}`)}
                className="px-6 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                Message
              </button>
            </div>
          </div>
        </div>

        {/* ────────────────── MAIN GRID ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left col: About + Organization Details */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* About */}
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-1 bg-blue-700 rounded-full" />
                About
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                {profile?.bio || 'No professional bio provided.'}
              </p>
              {(profile?.linkedin || profile?.websiteUrl) && (
                <div className="flex gap-6 mt-8 pt-6 border-t border-slate-50">
                  {profile?.linkedin && (
                    <a href={ensureAbsoluteUrl(profile.linkedin)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-bold text-blue-700 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">link</span>
                      </div>
                      LinkedIn
                    </a>
                  )}
                  {profile?.websiteUrl && (
                    <a href={ensureAbsoluteUrl(profile.websiteUrl)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:scale-105 transition-transform">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">public</span>
                      </div>
                      Website
                    </a>
                  )}
                </div>
              )}
            </section>

            {/* Organization Details */}
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-10 h-1 bg-indigo-700 rounded-full" />
                Organization Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {[
                  { icon: 'corporate_fare', label: 'Company',  value: profile?.companyName },
                  { icon: 'factory',        label: 'Industry', value: profile?.industry },
                  { icon: 'groups',         label: 'Scale',    value: profile?.size },
                  { icon: 'location_on',    label: 'Region',   value: profile?.location },
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
                <div className="mt-10 pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Mission</p>
                  <blockquote className="text-xl font-bold text-slate-900 border-l-4 border-indigo-200 pl-6 italic">
                    "{profile.mission}"
                  </blockquote>
                </div>
              )}
            </section>
          </div>

          {/* Right col: Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8">

            {/* Hiring Info card */}
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-8 px-1">
                Hiring Overview
              </h4>
              <div className="space-y-8">
                {[
                  { icon: 'business_center', label: 'Company',  value: profile?.companyName || '—' },
                  { icon: 'location_on',     label: 'Location', value: profile?.location    || 'Remote / Flexible' },
                  { icon: 'work_history',    label: 'Status',   value: profile?.status      || 'Hiring Active' },
                  { icon: 'factory',         label: 'Industry', value: profile?.industry    || '—' },
                  { icon: 'groups',          label: 'Team Size', value: profile?.size       || 'Not disclosed' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
                        <span className="material-symbols-outlined text-white/50">{row.icon}</span>
                      </div>
                      <span className="text-sm font-bold text-white/60">{row.label}</span>
                    </div>
                    <span className="text-sm font-black text-white text-right max-w-[120px] truncate">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">
                  Curator Intelligence Verified
                </p>
              </div>
            </div>

            {/* Contact quick-card */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-5">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">contacts</span>
                Quick Contact
              </h4>
              {[
                recruiterEmail && { icon: 'mail',   label: 'Email',    href: `mailto:${recruiterEmail}`,            value: recruiterEmail },
                profile?.linkedin && { icon: 'share',  label: 'LinkedIn', href: ensureAbsoluteUrl(profile.linkedin), value: 'View on LinkedIn' },
                profile?.websiteUrl && { icon: 'public', label: 'Website',  href: ensureAbsoluteUrl(profile.websiteUrl), value: 'Visit Website' },
              ].filter(Boolean).map((item, i) => (
                <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]">{item.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-xs font-bold text-slate-700 truncate">{item.value}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-[16px] shrink-0">arrow_outward</span>
                </a>
              ))}
              {!recruiterEmail && !profile?.linkedin && !profile?.websiteUrl && (
                <p className="text-sm text-slate-400 italic">No contact info provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────── CONTACT INFO MODAL ──────────────────── */}
      {contactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setContactOpen(false)}
          />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-modal-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900">Contact info</h3>
              <button
                onClick={() => setContactOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 space-y-6">
              {[
                { icon: 'person',        title: 'Name',       value: recruiterName, href: null },
                { icon: 'business',      title: 'Company',    value: profile?.companyName || '—', href: null },
                { icon: 'work',          title: 'Position',   value: profile?.position || '—', href: null },
                { icon: 'mail',          title: 'Email',      value: recruiterEmail, href: `mailto:${recruiterEmail}` },
                { icon: 'location_on',   title: 'Location',   value: profile?.location || 'Not provided', href: null },
                { icon: 'share',         title: 'LinkedIn',   value: profile?.linkedin ? profile.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '') : 'Not provided', href: profile?.linkedin },
                { icon: 'public',        title: 'Website',    value: profile?.websiteUrl || 'Not provided', href: profile?.websiteUrl },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <span className="material-symbols-outlined text-slate-400 text-[22px] mt-1 shrink-0">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    {item.href ? (
                      <a
                        href={ensureAbsoluteUrl(item.href)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[15px] text-blue-600 hover:underline font-medium block truncate mt-0.5"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-[15px] text-slate-600 font-medium mt-0.5">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
