import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
    return url;
  }
  return `https://${url}`;
};

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

export default function StudentProfileDetail() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    axios.get(`http://localhost:5000/api/students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => setProfile(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [token, id]);

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

  if (!profile) return <div className="p-20 text-center text-slate-500">Profile not found.</div>;

  const initials = profile.userId?.name
    ? profile.userId.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="bg-[#f8f9fb] text-slate-900 selection:bg-blue-100 font-body min-h-screen">
      <main className="pt-8 pb-20 px-6 max-w-7xl mx-auto">

        {/* ─────────────────── HERO HEADER ─────────────────────── */}
        <header className="relative mb-10">
          <div className="absolute inset-0 -z-10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(135deg,rgba(15,87,208,.1),rgba(95,78,186,.1))' }} />

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-[2.5rem] blur opacity-25" />
              {profile?.profilePicture ? (
                <img className="relative w-48 h-48 rounded-[2rem] object-cover shadow-xl bg-white"
                  src={profile.profilePicture} alt={profile.userId?.name} />
              ) : (
                <div className="relative w-48 h-48 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
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

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 mb-2">
                {profile.userId?.name || 'Student Name'}
              </h1>
              <p className="text-slate-500 font-bold mb-4">Currently open to opportunities and full-time roles.</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-500 font-medium mb-6">
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
                {profile.userId?.email && (
                  <a href={`mailto:${profile.userId.email}`} className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    {profile.userId.email}
                  </a>
                )}
                {profile?.location && (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                    {profile.location}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button onClick={() => setContactModalOpen(true)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">contact_page</span>
                  Contact Info
                </button>
                <button
                  onClick={() => navigate(`/recruiter/chat?student=${profile.userId?._id}`)}
                  className="px-6 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                  Message
                </button>
              </div>
            </div>

            <div className="flex gap-3 shrink-0 self-start md:self-end mb-4">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all border border-slate-200">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                Back
              </button>
            </div>
          </div>
        </header>

        {/* ─────────────────── MAIN GRID ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <section className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-slate-900">
                <span className="w-8 h-1 bg-blue-700 rounded-full shrink-0" />
                About
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed">
                {profile?.bio || 'No bio provided.'}
              </p>
            </section>

            <section className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-900">
                <span className="w-8 h-1 bg-blue-700 rounded-full shrink-0" />
                Education
              </h2>

              {profile?.education?.length > 0 ? (
                <div className="space-y-0">
                  {profile.education.map((edu, idx) => {
                    const isLast = idx === profile.education.length - 1;
                    return (
                      <div key={idx} className="flex gap-6 relative">
                        {!isLast && (
                          <div className="absolute left-[30px] top-[64px] bottom-0 w-[2px] bg-slate-100 z-0" />
                        )}
                        <div className="w-[60px] h-[60px] rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 z-10 shadow-sm mt-1">
                          <span className="material-symbols-outlined text-blue-700 text-[26px]">school</span>
                        </div>
                        <div className={`flex-1 min-w-0 ${!isLast ? 'pb-10' : 'pb-2'}`}>
                          <h3 className="text-xl font-bold text-slate-900 leading-snug">{edu.school}</h3>
                          <p className="text-base text-slate-600 font-medium mt-0.5">
                            {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' · ')}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            {[edu.startYear, edu.endYear || 'Present'].filter(Boolean).join(' – ')}
                            {edu.grade && <span className="ml-3 font-semibold text-slate-500">Grade: {edu.grade}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 italic">No education details provided.</p>
              )}
            </section>
          </div>

          <div className="lg:col-span-4">
            <section className="rounded-[2rem] p-10 bg-slate-50 border border-slate-100">
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
                <p className="text-sm text-slate-400">No skills listed.</p>
              )}
            </section>
          </div>
        </div>

        {/* ─────────────────── CERTIFICATIONS ─────────────────── */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Certifications</h2>
            <div className="h-px flex-1 mx-8 bg-slate-200 hidden md:block" />
          </div>

          {profile?.certifications?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.certifications.map((cert, idx) => (
                <CertificationCard key={idx} cert={cert} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-10 text-center text-slate-400 border border-dashed border-slate-200">
              <p className="font-semibold">No certifications listed.</p>
            </div>
          )}
        </section>

        {/* ─────────────────── PROJECTS ───────────────────────── */}
        <section className="mt-16 mb-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Projects</h2>
            <div className="h-px flex-1 mx-8 bg-slate-200 hidden md:block" />
          </div>

          {profile?.projects?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile.projects.map((project, idx) => (
                <ProjectCard key={idx} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-10 text-center text-slate-400 border border-dashed border-slate-200">
              <p className="font-semibold">No projects listed.</p>
            </div>
          )}
        </section>
      </main>

      {/* ─────────────────── CONTACT INFO MODAL ─────────────────── */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setContactModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-modal-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900">Contact info</h3>
              <button onClick={() => setContactModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 space-y-6">
              {[
                { icon: 'person', title: 'Profile', value: `academiccurator.com/in/${profile.userId?.name?.toLowerCase().replace(/\s+/g, '-')}`, href: '#' },
                { icon: 'language', title: 'Website', value: 'PORTFOLIO (Portfolio)', sub: '(Portfolio)', href: profile?.websiteUrl },
                { icon: 'mail', title: 'Email', value: profile.userId?.email, href: `mailto:${profile.userId?.email}` },
                { icon: 'call', title: 'Phone', value: profile?.phone || 'Not provided', href: null },
                { icon: 'code', title: 'GitHub', value: 'GITHUB', sub: '(GitHub)', href: profile?.github },
                { icon: 'share', title: 'LinkedIn', value: profile?.linkedin?.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '') || 'Not provided', href: profile?.linkedin },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <span className="material-symbols-outlined text-slate-400 text-[22px] mt-1 shrink-0">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    {item.href ? (
                      <a href={ensureAbsoluteUrl(item.href)} target="_blank" rel="noopener noreferrer" className="text-[15px] text-blue-600 hover:underline font-medium block truncate mt-0.5">
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
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}
