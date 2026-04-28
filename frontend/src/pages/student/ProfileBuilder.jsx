import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const STEPS = [
  { id: 1, icon: 'person', label: 'Personal Info', desc: 'Identity & Bio' },
  { id: 2, icon: 'psychology', label: 'Expertise', desc: 'Skills & Interests' },
  { id: 3, icon: 'school', label: 'Education', desc: 'Graduation Details' },
  { id: 4, icon: 'verified', label: 'Certifications', desc: 'Awards & Badges' },
  { id: 5, icon: 'palette', label: 'Projects', desc: 'Work & Research' },
];

function Avatar({ name, src, size = 'lg' }) {
  const sizes = { lg: 'w-24 h-24 text-3xl' };
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover border-4 border-white shadow-lg`} />;
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold border-4 border-white shadow-lg`}>
      {initials}
    </div>
  );
}

function ProjectForm({ project, onSave, onCancel }) {
  const [form, setForm] = useState(project || { title: '', description: '', tags: '', githubUrl: '', liveUrl: '', image: '' });

  const handleSave = () => {
    if (!form.title) { alert('Project title is required.'); return; }
    const data = {
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : (form.tags || []),
    };
    onSave(data);
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{project ? 'Edit Project' : 'New Project'}</h4>
      {[
        { label: 'Project Title *', key: 'title', placeholder: 'e.g. Portfolio Website' },
        { label: 'Description', key: 'description', placeholder: 'What did you build and why?', textarea: true },
        { label: 'Tags (comma-separated)', key: 'tags', placeholder: 'React, Node.js, MongoDB' },
        { label: 'GitHub URL', key: 'githubUrl', placeholder: 'https://github.com/...' },
        { label: 'Live URL', key: 'liveUrl', placeholder: 'https://your-project.com' },
        { label: 'Image URL (optional)', key: 'image', placeholder: 'https://...' },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{f.label}</label>
          {f.textarea ? (
            <textarea
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              rows={3}
              placeholder={f.placeholder}
              value={f.key === 'tags' && Array.isArray(form[f.key]) ? form[f.key].join(', ') : (form[f.key] || '')}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          ) : (
            <input
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              placeholder={f.placeholder}
              value={f.key === 'tags' && Array.isArray(form[f.key]) ? form[f.key].join(', ') : (form[f.key] || '')}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          )}
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition-colors">Save Project</button>
      </div>
    </div>
  );
}

function CertificationForm({ cert, onSave, onCancel }) {
  const [form, setForm] = useState(cert || { title: '', issuer: '', date: '', link: '', image: '' });

  const handleSave = () => {
    if (!form.title) { alert('Certification title is required.'); return; }
    onSave(form);
  };

  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{cert ? 'Edit Certification' : 'New Certification'}</h4>
      {[
        { label: 'Certification Title *', key: 'title', placeholder: 'e.g. AWS Certified Developer' },
        { label: 'Issuer', key: 'issuer', placeholder: 'e.g. Amazon Web Services' },
        { label: 'Date Issued', key: 'date', placeholder: 'e.g. Jan 2024' },
        { label: 'Credential URL', key: 'link', placeholder: 'https://...' },
        { label: 'Logo / Image URL (optional)', key: 'image', placeholder: 'https://...' },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{f.label}</label>
          <input
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            placeholder={f.placeholder}
            value={form[f.key] || ''}
            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
          />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition-colors">Save Certification</button>
      </div>
    </div>
  );
}

export default function StudentProfileBuilder() {
  const [step, setStep] = useState(1);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  // FIX: Track save success toast
  const [saveToast, setSaveToast] = useState('');
  const [addingProject, setAddingProject] = useState(false);
  const [editingProjectIdx, setEditingProjectIdx] = useState(null);
  const [addingCert, setAddingCert] = useState(false);
  const [editingCertIdx, setEditingCertIdx] = useState(null);
  const [addingEdu, setAddingEdu] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    major: '',
    location: '',
    phone: '',
    github: '',
    linkedin: '',
    websiteUrl: '',
    profilePicture: '',
    skills: [],
    projects: [],
    certifications: [],
    education: [],
  });

  const [newEdu, setNewEdu] = useState({ school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '', description: '' });

  // Load existing profile
  useEffect(() => {
    if (!token) return;
    axios.get('http://localhost:5000/api/students/profile/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const p = res.data;
        setFormData({
          headline: p.headline || '',
          bio: p.bio || '',
          major: p.major || '',
          location: p.location || '',
          phone: p.phone || '',
          github: p.github || '',
          linkedin: p.linkedin || '',
          websiteUrl: p.websiteUrl || '',
          profilePicture: p.profilePicture || '',
          skills: p.skills || [],
          projects: (p.projects || []).map(proj => ({
            ...proj,
            tags: proj.tags || [],
          })),
          // FIX: Ensure certifications are always loaded from server
          certifications: p.certifications || [],
          education: p.education || [],
        });
      })
      .catch(() => { }); // profile might not exist yet
  }, [token]);

  // FIX: saveProfile now accepts shouldNavigate flag
  // When shouldNavigate=true → save and go to /student/profile (was /student/dashboard — WRONG)
  // When shouldNavigate=false → save silently (used by Next → button between steps)
  const saveProfile = async (currentFormData, shouldNavigate = true) => {
    setSaving(true);
    try {
      // FIX: Strip base64 profilePicture from payload if it's a data URL.
      // Sending a base64 image in the JSON body causes huge payloads that can
      // silently fail and swallow ALL other fields (including certifications).
      // Profile picture upload should be handled separately via a dedicated
      // endpoint / multipart form. Here we just preserve the existing URL if
      // the user hasn't changed it via a proper URL string.
      const payload = { ...currentFormData };
      if (payload.profilePicture && payload.profilePicture.startsWith('data:')) {
        // Don't send base64 — keep whatever URL was loaded from the server
        delete payload.profilePicture;
      }

      await axios.post('http://localhost:5000/api/students/profile', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (shouldNavigate) {
        // FIX: Navigate to /student/profile so certifications are visible
        navigate('/student/profile');
      } else {
        // Show a brief "Saved" toast between steps
        setSaveToast('Saved ✓');
        setTimeout(() => setSaveToast(''), 2000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // FIX: handleComplete always saves with the latest formData and navigates to profile
  const handleComplete = () => saveProfile(formData, true);

  // FIX: handleNextStep saves silently then advances the step
  const handleNextStep = async () => {
    await saveProfile(formData, false);
    setStep(s => s + 1);
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData({ ...formData, skills: [...formData.skills, s] });
    }
  };

  const removeSkill = (idx) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== idx) });
  };

  const handleAddProject = (data) => {
    setFormData({ ...formData, projects: [data, ...formData.projects] });
    setAddingProject(false);
  };

  const handleEditProject = (idx, data) => {
    const updated = [...formData.projects];
    updated[idx] = { ...updated[idx], ...data };
    setFormData({ ...formData, projects: updated });
    setEditingProjectIdx(null);
  };

  const handleDeleteProject = (idx) => {
    if (!window.confirm('Delete this project?')) return;
    setFormData({ ...formData, projects: formData.projects.filter((_, i) => i !== idx) });
  };

  const handleAddCert = (data) => {
    setFormData({ ...formData, certifications: [data, ...formData.certifications] });
    setAddingCert(false);
  };

  const handleEditCert = (idx, data) => {
    const updated = [...formData.certifications];
    updated[idx] = { ...updated[idx], ...data };
    setFormData({ ...formData, certifications: updated });
    setEditingCertIdx(null);
  };

  const handleDeleteCert = (idx) => {
    if (!window.confirm('Delete this certification?')) return;
    setFormData({ ...formData, certifications: formData.certifications.filter((_, i) => i !== idx) });
  };

  const handleAddEdu = () => {
    if (!newEdu.school) { alert('School name is required.'); return; }
    setFormData({ ...formData, education: [newEdu, ...formData.education] });
    setNewEdu({ school: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '', description: '' });
    setAddingEdu(false);
  };

  const handleDeleteEdu = (idx) => {
    setFormData({ ...formData, education: formData.education.filter((_, i) => i !== idx) });
  };

  return (
    <div className="bg-slate-100 min-h-screen font-body">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Build Your Profile</h1>
          <p className="text-slate-500 mt-1">Your professional story — curated by you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Sidebar Stepper ── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="space-y-2 relative">
                <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-slate-100" />
                {STEPS.map(s => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 cursor-pointer relative"
                    onClick={() => setStep(s.id)}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 shrink-0 transition-all shadow-sm ${step >= s.id ? 'bg-blue-700 text-white shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                      {step > s.id
                        ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        : <span className="material-symbols-outlined text-sm">{s.icon}</span>
                      }
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${step >= s.id ? 'text-blue-700' : 'text-slate-400'}`}>{s.label}</p>
                      <p className="text-[10px] text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <span className="material-symbols-outlined text-blue-600 text-3xl mb-2 block">lightbulb</span>
              <h4 className="text-blue-700 font-bold text-sm mb-1">Curator's Tip</h4>
              <p className="text-blue-600/80 text-xs leading-relaxed">
                {[
                  'A focused bio of 3-4 sentences works better than a wall of text. Show your unique perspective.',
                  'List skills you actually know. Quality over quantity impresses recruiters.',
                  'Add your graduation year and GPA — recruiters look for this first.',
                  'Add credentials with a link so recruiters can verify them instantly.',
                  'Projects with GitHub links and live demos get 4x more recruiter clicks.',
                ][step - 1]}
              </p>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="lg:col-span-9 space-y-6">

            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-fade-in">
                <h2 className="text-xl font-extrabold text-slate-900 mb-6">Step 1: Personal Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                  <Avatar name={user?.name} src={formData.profilePicture && !formData.profilePicture.startsWith('data:') ? formData.profilePicture : undefined} size="lg" />
                  <div>
                    <h4 className="font-bold text-slate-800">Profile Photo URL</h4>
                    {/* FIX: Use a URL input instead of base64 file input to avoid
                        bloating the POST payload. Paste a direct image link
                        (e.g. from Cloudinary, Imgur, or your own upload endpoint). */}
                    <p className="text-xs text-slate-400 mb-2">Paste a direct image URL for your profile picture</p>
                    <input
                      type="url"
                      className="w-72 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="https://example.com/your-photo.jpg"
                      value={formData.profilePicture && !formData.profilePicture.startsWith('data:') ? formData.profilePicture : ''}
                      onChange={e => setFormData({ ...formData, profilePicture: e.target.value })}
                    />
                    {formData.profilePicture && !formData.profilePicture.startsWith('data:') && (
                      <img src={formData.profilePicture} alt="preview" className="w-16 h-16 rounded-full object-cover mt-2 border-2 border-white shadow" onError={e => e.target.style.display = 'none'} />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  {/* Headline — full width */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Professional Headline
                      <span className="ml-2 normal-case text-[9px] font-normal text-slate-300">Shown on your dashboard &amp; profile</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
                        style={{ background: 'linear-gradient(90deg,#FF7AF5,#7AF7FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        title
                      </span>
                      <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 font-semibold"
                        placeholder="e.g. Full Stack Developer & UI Enthusiast"
                        maxLength={100}
                        value={formData.headline}
                        onChange={e => setFormData({ ...formData, headline: e.target.value })}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">This appears below your name in aurora gradient. Make it memorable!</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed" value={user?.name || ''} disabled />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Major / Field of Study</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                      placeholder="e.g. Computer Science"
                      value={formData.major}
                      onChange={e => setFormData({ ...formData, major: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="e.g. Mumbai, India"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bio</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                    rows={4}
                    placeholder="Briefly describe your academic focus, interests, and career goals..."
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { label: 'GitHub URL', key: 'github', placeholder: 'https://github.com/username', icon: 'code' },
                    { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'https://linkedin.com/in/username', icon: 'work' },
                    { label: 'Portfolio / Website', key: 'websiteUrl', placeholder: 'https://yoursite.com', icon: 'language' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{f.label}</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">{f.icon}</span>
                        <input
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                          placeholder={f.placeholder}
                          value={formData[f.key]}
                          onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Skills */}
            {step === 2 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-fade-in">
                <h2 className="text-xl font-extrabold text-slate-900 mb-2">Step 2: Your Skills</h2>
                <p className="text-slate-400 text-sm mb-6">Add only the skills you actually know. You can add as many as you want.</p>

                {/* Skill input */}
                <div className="flex gap-3 mb-4">
                  <input
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Type a skill and press Enter or click Add..."
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newSkillInput.trim()) {
                        e.preventDefault();
                        addSkill(newSkillInput);
                        setNewSkillInput('');
                      }
                    }}
                  />
                  <button
                    onClick={() => { addSkill(newSkillInput); setNewSkillInput(''); }}
                    className="px-5 py-2.5 bg-blue-700 text-white font-bold text-sm rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Current skills */}
                <div className="min-h-[100px] bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-wrap gap-2 content-start mb-4">
                  {formData.skills.length === 0 ? (
                    <p className="text-slate-400 text-sm italic">No skills added yet. Start typing above.</p>
                  ) : (
                    formData.skills.map((skill, i) => (
                      <span key={i} className="flex items-center gap-2 bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full">
                        {skill}
                        <button onClick={() => removeSkill(i)} className="hover:opacity-70 transition-opacity">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Suggestions */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Common Skills — Click to Add</p>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Machine Learning', 'Java', 'C++', 'UI/UX Design', 'Figma', 'Data Analysis', 'AWS', 'Docker', 'TypeScript'].map(s => (
                      !formData.skills.includes(s) && (
                        <button
                          key={s}
                          onClick={() => addSkill(s)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-transparent text-slate-600 text-xs font-bold rounded-full transition-all"
                        >
                          + {s}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Education */}
            {step === 3 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Step 3: Education</h2>
                    <p className="text-slate-400 text-sm mt-0.5">LinkedIn-style graduation details</p>
                  </div>
                  <button
                    onClick={() => setAddingEdu(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-bold text-sm rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add Education
                  </button>
                </div>

                {/* Add Education Form */}
                {addingEdu && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 space-y-4">
                    <h4 className="font-bold text-slate-700 text-sm">New Education Entry</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'School / University *', key: 'school', placeholder: 'e.g. IIT Bombay', full: true },
                        { label: 'Degree', key: 'degree', placeholder: 'e.g. B.Tech' },
                        { label: 'Field of Study', key: 'fieldOfStudy', placeholder: 'e.g. Computer Science' },
                        { label: 'Grade / GPA', key: 'grade', placeholder: 'e.g. 8.9 / 10' },
                        { label: 'Start Year', key: 'startYear', placeholder: '2020' },
                        { label: 'End Year', key: 'endYear', placeholder: '2024 (or Present)' },
                      ].map(f => (
                        <div key={f.key} className={f.full ? 'md:col-span-2' : ''}>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{f.label}</label>
                          <input
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                            placeholder={f.placeholder}
                            value={newEdu[f.key] || ''}
                            onChange={e => setNewEdu({ ...newEdu, [f.key]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description (optional)</label>
                      <textarea
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                        rows={2}
                        placeholder="Key achievements, thesis, extracurriculars..."
                        value={newEdu.description || ''}
                        onChange={e => setNewEdu({ ...newEdu, description: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setAddingEdu(false)} className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50">Cancel</button>
                      <button onClick={handleAddEdu} className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white font-bold text-sm hover:bg-blue-800">Add Education</button>
                    </div>
                  </div>
                )}

                {/* Education List */}
                {formData.education.length > 0 ? (
                  <div className="space-y-4">
                    {formData.education.map((edu, i) => (
                      <div key={i} className="flex gap-4 group p-4 border border-slate-100 rounded-2xl hover:border-blue-200 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-blue-600">school</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-slate-900">{edu.school}</h3>
                              <p className="text-sm text-slate-600">{[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' · ')}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{[edu.startYear, edu.endYear].filter(Boolean).join(' — ')}</p>
                              {edu.grade && <p className="text-xs text-slate-500 mt-0.5">Grade: {edu.grade}</p>}
                              {edu.description && <p className="text-xs text-slate-500 mt-1">{edu.description}</p>}
                            </div>
                            <button
                              onClick={() => handleDeleteEdu(i)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !addingEdu ? (
                  <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-5xl mb-3 block">school</span>
                    <p className="font-semibold">No education added yet</p>
                    <button onClick={() => setAddingEdu(true)} className="text-blue-600 text-sm font-bold hover:underline mt-1">Add your education →</button>
                  </div>
                ) : null}
              </div>
            )}

            {/* STEP 4: Certifications */}
            {step === 4 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Step 4: Certifications & Awards</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Highlight your professional certifications and honors</p>
                  </div>
                  <button
                    onClick={() => setAddingCert(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-bold text-sm rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Certification
                  </button>
                </div>

                {addingCert && (
                  <div className="mb-5">
                    <CertificationForm onSave={handleAddCert} onCancel={() => setAddingCert(false)} />
                  </div>
                )}

                <div className="space-y-4">
                  {formData.certifications.map((cert, i) => (
                    <div key={i}>
                      {editingCertIdx === i ? (
                        <CertificationForm
                          cert={cert}
                          onSave={(data) => handleEditCert(i, data)}
                          onCancel={() => setEditingCertIdx(null)}
                        />
                      ) : (
                        <div className="flex gap-4 group p-4 border border-slate-100 rounded-2xl hover:border-blue-200 transition-colors">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center border border-slate-100">
                            {cert.image ? (
                              <img className="w-full h-full object-contain" src={cert.image} alt={cert.title} />
                            ) : (
                              <span className="material-symbols-outlined text-slate-300 text-3xl">verified</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="font-bold text-slate-900">{cert.title}</h3>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingCertIdx(i)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-500">
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button onClick={() => handleDeleteCert(i)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">{cert.issuer}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{cert.date}</p>
                            {cert.link && (
                              <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1 font-bold">
                                <span className="material-symbols-outlined text-[14px]">link</span>
                                View Credential
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {formData.certifications.length === 0 && !addingCert && (
                    <div className="text-center py-12 text-slate-400">
                      <span className="material-symbols-outlined text-5xl mb-3 block">verified</span>
                      <p className="font-semibold">No certifications yet</p>
                      <button onClick={() => setAddingCert(true)} className="text-blue-600 text-sm font-bold hover:underline mt-1">Add your first certification →</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: Projects */}
            {step === 5 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Step 5: Project Gallery</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Showcase your best work with GitHub and live links</p>
                  </div>
                  <button
                    onClick={() => setAddingProject(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white font-bold text-sm rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New Project
                  </button>
                </div>

                {addingProject && (
                  <div className="mb-5">
                    <ProjectForm onSave={handleAddProject} onCancel={() => setAddingProject(false)} />
                  </div>
                )}

                <div className="space-y-4">
                  {formData.projects.map((project, i) => (
                    <div key={i}>
                      {editingProjectIdx === i ? (
                        <ProjectForm
                          project={{ ...project, tags: Array.isArray(project.tags) ? project.tags.join(', ') : project.tags }}
                          onSave={(data) => handleEditProject(i, data)}
                          onCancel={() => setEditingProjectIdx(null)}
                        />
                      ) : (
                        <div className="flex gap-4 group p-4 border border-slate-100 rounded-2xl hover:border-blue-200 transition-colors">
                          <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            <img className="w-full h-full object-cover" src={project.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200'} alt={project.title} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="font-bold text-slate-900">{project.title}</h3>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingProjectIdx(i)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-500">
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button onClick={() => handleDeleteProject(i)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-red-400">
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1">{project.description}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(project.tags || []).map((t, j) => (
                                <span key={j} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">{t}</span>
                              ))}
                            </div>
                            <div className="flex gap-3 mt-1">
                              {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-blue-700 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">code</span>GitHub</a>}
                              {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-blue-700 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">open_in_new</span>Live</a>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {formData.projects.length === 0 && !addingProject && (
                    <div className="text-center py-12 text-slate-400">
                      <span className="material-symbols-outlined text-5xl mb-3 block">palette</span>
                      <p className="font-semibold">No projects yet</p>
                      <button onClick={() => setAddingProject(true)} className="text-blue-600 text-sm font-bold hover:underline mt-1">Add your first project →</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              {/* FIX: Save & Exit now properly saves and goes to /student/profile */}
              <button
                onClick={handleComplete}
                disabled={saving}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Exit'}
              </button>

              {/* FIX: Saved toast shown after intermediate saves */}
              {saveToast && (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {saveToast}
                </span>
              )}

              <div className="flex items-center gap-3">
                {/* Step dots */}
                <div className="flex gap-1 mr-2">
                  {STEPS.map(s => (
                    <button key={s.id} onClick={() => setStep(s.id)} className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'w-6 bg-blue-700' : step > s.id ? 'bg-blue-300' : 'bg-slate-200'}`} />
                  ))}
                </div>
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                {/* FIX: Next → now calls handleNextStep which saves to DB before advancing */}
                {step < STEPS.length ? (
                  <button
                    onClick={handleNextStep}
                    disabled={saving}
                    className="px-8 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-sm hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {saving ? 'Saving...' : 'Next →'}
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={saving}
                    className="px-8 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-sm hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {saving ? 'Saving...' : 'Save Profile ✓'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.25s ease-out forwards; }
      `}</style>
    </div>
  );
}