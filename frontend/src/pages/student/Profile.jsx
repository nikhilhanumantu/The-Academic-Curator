import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
    return url;
  }
  return `https://${url}`;
};

/* ─── Contact Info Modal ─────────────────────────────────────────────────── */
function ContactInfoModal({ isOpen, onClose, profile, user }) {
  if (!isOpen) return null;
  const slug = user?.name?.toLowerCase().replace(/\s+/g, '-') || 'user';

  const items = [
    { icon: 'person', title: 'profile', display: `academiccurator.com/in/${slug}`, href: '#' },
    profile?.websiteUrl && { icon: 'link', title: 'Website', display: profile.websiteUrl, href: ensureAbsoluteUrl(profile.websiteUrl), suffix: '(Portfolio)' },
    user?.email && { icon: 'mail', title: 'Email', display: user.email, href: `mailto:${user.email}` },
    profile?.phone && { icon: 'call', title: 'Phone', display: profile.phone },
    profile?.github && { icon: 'code', title: 'GitHub', display: profile.github.replace(/https?:\/\/(www\.)?/, ''), href: ensureAbsoluteUrl(profile.github) },
    profile?.linkedin && { icon: 'share', title: 'LinkedIn', display: profile.linkedin.replace(/https?:\/\/(www\.)?/, ''), href: ensureAbsoluteUrl(profile.linkedin) },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'slideUp .25s cubic-bezier(0.16,1,0.3,1) both' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Contact info</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[22px] text-slate-600 mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 0,'wght' 400" }}>{item.icon}</span>
              <div>
                <p className="font-bold text-slate-900 text-sm mb-0.5">{item.title}</p>
                {item.href
                  ? <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline break-all">
                      {item.display}
                      {item.suffix && <span className="text-slate-400 text-xs ml-1">{item.suffix}</span>}
                    </a>
                  : <p className="text-slate-600 text-sm">{item.display}</p>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

/* ─── 3-Dot Dropdown ─────────────────────────────────────────────────────── */
function DotsMenu({ onContact, onEdit }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center w-10 h-10 bg-white text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 transition-colors border border-slate-200"
        title="More options">
        <span className="material-symbols-outlined text-[22px]">more_horiz</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
          style={{ animation: 'drop .16s ease-out both' }}>
          <button onClick={() => { onContact(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
            <span className="material-symbols-outlined text-[18px]">contacts</span>Contact info
          </button>
          <button onClick={() => { onEdit(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-t border-slate-50">
            <span className="material-symbols-outlined text-[18px]">edit</span>Edit profile
          </button>
        </div>
      )}
      <style>{`@keyframes drop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

/* ─── Profile Strength Widget ────────────────────────────────────────────── */
function ProfileStrength({ profile }) {
  const checks = [
    { label: 'Bio added', done: !!(profile?.bio) },
    { label: 'Skills added', done: !!(profile?.skills?.length > 0) },
    { label: 'Project added', done: !!(profile?.projects?.length > 0) },
    { label: 'Certification added', done: !!(profile?.certifications?.length > 0) },
    { label: 'Education added', done: !!(profile?.education?.length > 0) },
    { label: 'GitHub linked', done: !!(profile?.github) },
    { label: 'LinkedIn linked', done: !!(profile?.linkedin) },
    { label: 'Profile Picture added', done: !!(profile?.profilePicture) },
    { label: 'Headline added', done: !!(profile?.headline) },
  ];

  const completed = checks.filter(c => c.done).length;
  const pct = Math.round((completed / checks.length) * 100);
  const level = pct <= 25 ? 'Beginner' : pct <= 50 ? 'Intermediate' : pct <= 75 ? 'Advanced' : 'Expert';

  return (
    <div className="bg-white rounded-[1.5rem] p-6 mt-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Profile Strength</h3>
      {/* Bar + labels */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-700">{pct}% complete</span>
        <span className="text-sm font-bold text-blue-600">{level}</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-slate-100 mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct < 50 ? '#3b82f6' : pct < 75 ? '#6366f1' : '#22c55e',
          }}
        />
      </div>
      {/* Checklist */}
      <ul className="space-y-2.5">
        {checks.map((c, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span
              className={`material-symbols-outlined text-[20px] shrink-0 ${c.done ? 'text-blue-600' : 'text-slate-300'}`}
              style={{ fontVariationSettings: c.done ? "'FILL' 1" : "'FILL' 0" }}
            >
              check_circle
            </span>
            <span className={`text-sm font-medium ${c.done ? 'text-slate-700' : 'text-slate-400'}`}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Certification Card ────────────────────────────────────────────────── */
function CertificationCard({ cert }) {
  return (
    <div className="group bg-white rounded-[1.5rem] p-6 border border-slate-100 transition-all duration-300 hover:shadow-xl hover:border-blue-200">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
          {cert.image ? (
            <img src={cert.image} alt={cert.title} className="w-10 h-10 object-contain" />
          ) : (
            <span className="material-symbols-outlined text-blue-600 text-[32px]">verified</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{cert.title}</h3>
          <p className="text-sm font-semibold text-slate-600 truncate">{cert.issuer}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400 font-medium">{cert.date}</span>
            {cert.link && (
              <a href={ensureAbsoluteUrl(cert.link)} target="_blank" rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                <span className="material-symbols-outlined text-[18px]">link</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Project Card ───────────────────────────────────────────────────────── */
function ProjectCard({ project }) {
  const tagColors = [
    { bg: '#e8f0fe', color: '#1a56db' },
    { bg: '#fdf2f8', color: '#9e1e9b' },
    { bg: '#e6f7f7', color: '#005565' },
    { bg: '#fef3c7', color: '#92400e' },
    { bg: '#f0fdf4', color: '#166534' },
  ];
  const c = tagColors[Math.abs((project.title || '').charCodeAt(0)) % tagColors.length];

  return (
    <div className="group relative bg-white rounded-[2rem] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={project.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500'}
          alt={project.title}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500'; }}
        />
      </div>
      <div className="p-8">
        {project.tags?.[0] && (
          <div className="mb-4">
            <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider"
              style={{ backgroundColor: c.bg, color: c.color }}>
              {project.tags[0]}
            </span>
          </div>
        )}
        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-700 transition-colors">{project.title}</h3>
        <p className="text-slate-500 text-sm mb-6 line-clamp-2">{project.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {(project.tags || []).slice(1, 3).map((t, i) => (
              <span key={i} className="text-slate-400 text-xs font-medium">{t}</span>
            ))}
          </div>
          {(project.githubUrl || project.liveUrl) && (
            <a href={ensureAbsoluteUrl(project.liveUrl || project.githubUrl)} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-blue-700 hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px]">arrow_outward</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Profile Page ─────────────────────────────────────────────────── */
export default function Profile() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    axios.get(`http://localhost:5000/api/students/profile/me?t=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        // Ensure all array fields have defaults to prevent rendering issues
        const data = r.data || {};
        setProfile({
          ...data,
          skills: data.skills || [],
          projects: data.projects || [],
          certifications: data.certifications || [],
          education: data.education || []
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="bg-[#f8f9fb] text-slate-900 selection:bg-blue-100 font-body">
      <ContactInfoModal isOpen={contactOpen} onClose={() => setContactOpen(false)} profile={profile} user={user} />

      <main className="pt-8 pb-20 px-6 max-w-7xl mx-auto">

        {/* ─────────────────── HERO HEADER ─────────────────────── */}
        <header className="relative mb-10">
          {/* Ambient blur */}
          <div className="absolute inset-0 -z-10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(135deg,rgba(15,87,208,.1),rgba(95,78,186,.1))' }} />

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Avatar with glow — exactly like profile.html */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-700" />
              {profile?.profilePicture ? (
                <img className="relative w-48 h-48 rounded-[2rem] object-cover shadow-xl bg-white"
                  src={profile.profilePicture} alt={user?.name} />
              ) : (
                <div className="relative w-48 h-48 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                  {initials}
                </div>
              )}
            </div>

            {/* Name + badges + social */}
            <div className="flex-1 text-center md:text-left">
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full"
                  style={{ backgroundColor: '#e5deff', color: '#3f2b98' }}>
                  Available for Hire
                </span>
                {profile?.major && (
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full"
                    style={{ backgroundColor: '#50dcff', color: '#003641' }}>
                    {profile.major}
                  </span>
                )}
              </div>

              {/* Big name */}
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 mb-4">
                {user?.name || 'Your Name'}
              </h1>

              {/* Social links row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-500 font-medium">
                {profile?.github && (
                  <a href={ensureAbsoluteUrl(profile.github)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">link</span>
                    {profile.github.replace(/https?:\/\/(www\.)?/, '')}
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={ensureAbsoluteUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                    {profile.linkedin.replace(/https?:\/\/(www\.)?/, '')}
                  </a>
                )}
                {user?.email && (
                  <a href={`mailto:${user.email}`} className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    {user.email}
                  </a>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                    {profile.location}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons: Share + Copy + 3-dots */}
            <div className="flex gap-3 shrink-0">
              <button onClick={copyLink}
                className="flex items-center gap-2 px-5 py-3 bg-white text-blue-700 rounded-xl font-bold shadow-sm hover:scale-105 transition-transform border border-slate-100">
                <span className="material-symbols-outlined text-[20px]">ios_share</span>
                {copied ? 'Copied!' : 'Share'}
              </button>
              <button onClick={copyLink}
                className="flex items-center justify-center w-12 h-12 bg-blue-700 text-white rounded-xl shadow-sm hover:scale-105 transition-transform"
                title="Copy link">
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
              </button>
              <DotsMenu onContact={() => setContactOpen(true)} onEdit={() => navigate('/student/profile-builder')} />
            </div>
          </div>
        </header>

        {/* ─────────────────── MAIN GRID ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: About + Education stacked */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* About — white card with blue dash */}
            <section className="bg-white p-10 rounded-[2rem]">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-900">
                <span className="w-8 h-1 bg-blue-700 rounded-full shrink-0" />
                About
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed">
                {profile?.bio
                  ? profile.bio
                  : <span className="text-slate-400">No bio yet. <button onClick={() => navigate('/student/profile-builder')} className="text-blue-600 hover:underline font-bold">Add one →</button></span>
                }
              </p>
            </section>

            {/* Education — same white card style as About */}
            <section className="bg-white p-10 rounded-[2rem]">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                <span className="w-8 h-1 bg-blue-700 rounded-full shrink-0" />
                Education
              </h2>

              {profile?.education?.length > 0 ? (
                <div className="space-y-0">
                  {profile.education.map((edu, idx) => {
                    const isLast = idx === profile.education.length - 1;
                    const isUni = edu.degree &&
                      !edu.degree.toLowerCase().includes('school') &&
                      !edu.degree.toLowerCase().includes('ssc') &&
                      !edu.degree.toLowerCase().includes('hsc') &&
                      !edu.degree.toLowerCase().includes('10th') &&
                      !edu.degree.toLowerCase().includes('12th');
                    return (
                      <div key={idx} className="flex gap-6 relative">
                        {/* Timeline line */}
                        {!isLast && (
                          <div className="absolute left-[30px] top-[64px] bottom-0 w-[2px] bg-slate-100 z-0" />
                        )}
                        {/* Icon */}
                        <div className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-sm mt-1 border"
                          style={{ backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }}>
                          <span className="material-symbols-outlined text-[26px]"
                            style={{ color: '#4338ca', fontVariationSettings: "'FILL' 0,'wght' 300" }}>
                            {isUni ? 'account_balance' : 'school'}
                          </span>
                        </div>
                        {/* Content */}
                        <div className={`flex-1 min-w-0 ${!isLast ? 'pb-10' : 'pb-2'}`}>
                          <h3 className="text-xl font-bold text-slate-900 leading-snug">{edu.school}</h3>
                          {(edu.degree || edu.fieldOfStudy) && (
                            <p className="text-base text-slate-600 font-medium mt-0.5">
                              {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <p className="text-sm text-slate-400 mt-1">
                            {[edu.startYear, edu.endYear || 'Present'].filter(Boolean).join(' – ')}
                            {edu.grade && (
                              <span className="ml-3 font-semibold text-slate-500">Grade: {edu.grade}</span>
                            )}
                          </p>
                          {edu.description && (
                            <p className="text-sm text-slate-500 mt-3 leading-relaxed max-w-2xl">{edu.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-slate-300">
                  <span className="material-symbols-outlined text-5xl mb-3">school</span>
                  <p className="font-semibold text-slate-400">No education added yet</p>
                  <button onClick={() => navigate('/student/profile-builder')}
                    className="mt-2 text-blue-600 font-bold text-sm hover:underline">
                    Add education →
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: Expertise + Profile Strength stacked */}
          <div className="lg:col-span-4 flex flex-col gap-0">

            {/* Expertise */}
            <section className="rounded-[2rem] p-10" style={{ backgroundColor: '#f2f4f6' }}>
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Expertise</h2>
              {profile?.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-4 py-2 bg-white text-slate-800 font-semibold rounded-full shadow-sm text-sm border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No skills added yet.{' '}
                  <button onClick={() => navigate('/student/profile-builder')} className="text-blue-600 hover:underline font-bold">Add skills →</button>
                </p>
              )}
            </section>

            {/* Profile Strength — directly below Expertise */}
            <ProfileStrength profile={profile} />
          </div>
        </div>

        {/* ─────────────────── CERTIFICATIONS ─────────────────── */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Certifications</h2>
            <div className="h-px flex-1 mx-8 bg-slate-200 hidden md:block" />
            <button onClick={() => navigate('/student/profile-builder')}
              className="text-blue-700 font-bold hover:underline flex items-center gap-1 text-sm shrink-0">
              Add More
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          {profile?.certifications && profile.certifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.certifications.map((cert, idx) => (
                <CertificationCard key={idx} cert={cert} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-10 text-center text-slate-400 border border-dashed border-slate-200">
              <span className="material-symbols-outlined text-5xl mb-3 block">verified</span>
              <p className="font-semibold">No certifications added yet</p>
              <button onClick={() => navigate('/student/profile-builder')}
                className="mt-2 text-blue-600 font-bold text-sm hover:underline">
                Add your first certification →
              </button>
            </div>
          )}
        </section>

        {/* ─────────────────── FEATURED PROJECTS ───────────────── */}
        <section className="mt-16 mb-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Featured Projects</h2>
            <div className="h-px flex-1 mx-8 bg-slate-200 hidden md:block" />
            <button onClick={() => navigate('/student/profile-builder')}
              className="text-blue-700 font-bold hover:underline flex items-center gap-1 text-sm shrink-0">
              Add Project
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          {profile?.projects?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile.projects.map((project, idx) => (
                <ProjectCard key={idx} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3 block">palette</span>
              <p className="font-semibold">No projects yet</p>
              <button onClick={() => navigate('/student/profile-builder')}
                className="mt-2 text-blue-600 font-bold text-sm hover:underline">
                Add your first project →
              </button>
            </div>
          )}
        </section>

        {/* ─────────────────── CTA ─────────────────────────────── */}
        <section className="rounded-[3rem] p-12 text-center relative overflow-hidden"
          style={{ backgroundColor: 'rgba(15,87,208,0.06)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
            style={{ background: 'rgba(95,78,186,.12)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"
            style={{ background: 'rgba(0,104,107,.1)' }} />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Let's build something together.</h2>
            <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto">
              Currently open to opportunities and full-time roles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setContactOpen(true)}
                className="bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Contact Me
              </button>
              <button onClick={() => navigate('/student/resume')}
                className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all">
                Download Resume
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
