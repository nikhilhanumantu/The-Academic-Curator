import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ─── Animated Counter Hook ───────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Intersection Observer Hook ──────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Resources Mega Menu ──────────────────────────────────────────────────────
function ResourcesMegaMenu() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const enter = () => { clearTimeout(timerRef.current); setOpen(true); };
  const leave = () => { timerRef.current = setTimeout(() => setOpen(false), 150); };

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors uppercase font-semibold tracking-tight text-sm">
        Resources
        <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[680px] bg-white rounded-2xl shadow-2xl border border-slate-100 transition-all duration-200 z-50 overflow-hidden ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-8 py-5">
          <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">The Academic Curator</p>
          <h3 className="text-white text-lg font-bold">Resources & Support</h3>
        </div>

        <div className="grid grid-cols-2 gap-0 p-6">
          {/* For Students */}
          <div className="pr-6 border-r border-slate-100">
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4">FOR STUDENTS</p>
            <div className="space-y-3">
              {[
                { icon: 'school', label: 'Getting Started Guide', desc: 'Build your first profile in minutes' },
                { icon: 'psychology', label: 'AI Resume Tips', desc: 'Make your resume stand out' },
                { icon: 'palette', label: 'Portfolio Best Practices', desc: 'Showcase your work effectively' },
                { icon: 'groups', label: 'Student Community', desc: 'Connect with peers globally' },
              ].map(item => (
                <a key={item.label} href="#" className="flex items-start gap-3 p-2 rounded-xl hover:bg-blue-50 transition-colors group">
                  <span className="material-symbols-outlined text-blue-600 mt-0.5 text-[20px]">{item.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* For Recruiters + Support */}
          <div className="pl-6 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4">FOR RECRUITERS</p>
              <div className="space-y-3">
                {[
                  { icon: 'person_search', label: 'Talent Search Guide', desc: 'Filter and find the right candidates' },
                  { icon: 'analytics', label: 'Hiring Analytics', desc: 'Track your pipeline performance' },
                ].map(item => (
                  <a key={item.label} href="#" className="flex items-start gap-3 p-2 rounded-xl hover:bg-indigo-50 transition-colors group">
                    <span className="material-symbols-outlined text-indigo-500 mt-0.5 text-[20px]">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700">{item.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-3">SUPPORT</p>
              <div className="grid grid-cols-2 gap-2">
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Use'].map(item => (
                  <a key={item} href="#" className="text-xs text-slate-500 hover:text-blue-600 font-medium py-1 transition-colors">{item}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Floating Particle ────────────────────────────────────────────────────────
function FloatingParticle({ style }) {
  return <div className="absolute rounded-full pointer-events-none animate-float-random" style={style} />;
}

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [scrollY, setScrollY] = useState(0);
  const [statsRef, statsInView] = useInView(0.3);

  const s1 = useCounter(10000, 2000, statsInView);
  const s2 = useCounter(500, 2000, statsInView);
  const s3 = useCounter(98, 2000, statsInView);

  // Cursor spotlight
  useEffect(() => {
    const handler = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const particles = [
    { width: 60, height: 60, background: 'rgba(59,130,246,0.12)', top: '10%', left: '5%', animationDelay: '0s', animationDuration: '6s' },
    { width: 40, height: 40, background: 'rgba(99,102,241,0.15)', top: '20%', right: '8%', animationDelay: '1s', animationDuration: '8s' },
    { width: 80, height: 80, background: 'rgba(139,92,246,0.1)', top: '60%', left: '3%', animationDelay: '2s', animationDuration: '7s' },
    { width: 30, height: 30, background: 'rgba(59,130,246,0.2)', top: '45%', right: '12%', animationDelay: '0.5s', animationDuration: '5s' },
    { width: 50, height: 50, background: 'rgba(16,185,129,0.12)', bottom: '20%', left: '15%', animationDelay: '1.5s', animationDuration: '9s' },
  ];

  return (
    <div className="bg-white text-slate-900 selection:bg-blue-100 font-body overflow-x-hidden">
      {/* ── Cursor Spotlight ── */}
      <div
        className="fixed pointer-events-none z-0 transition-opacity duration-300"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* ── Top Nav ── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100">
        <div className="text-xl font-extrabold tracking-tighter text-blue-700 uppercase">The Academic Curator</div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors uppercase font-semibold tracking-tight text-sm">Discover</a>
          <a href="#showcase" className="text-slate-600 hover:text-blue-600 transition-colors uppercase font-semibold tracking-tight text-sm">Showcase</a>
          <ResourcesMegaMenu />
        </div>
        <div className="flex items-center gap-3">
          <Link to="/student/login" className="px-5 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 rounded-lg transition-colors uppercase">Sign In</Link>
          <a href="#get-started" onClick={(e) => { e.preventDefault(); document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-5 py-2 text-sm font-bold bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors uppercase shadow-md shadow-blue-200 cursor-pointer">Get Started</a>
        </div>
      </nav>

      <main className="pt-16">

        {/* ── Hero Section ── */}
        <section className="relative min-h-screen flex items-center px-8 overflow-hidden">
          {/* Animated background blobs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          </div>

          {/* Floating Particles */}
          {particles.map((p, i) => <FloatingParticle key={i} style={p} />)}

          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center py-20">
            <div className="space-y-8 animate-hero-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Empowering Student Creators • 2026
              </div>

              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] text-slate-900">
                Discover Talent.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Showcase Skills.</span><br />
                Build Your Future.
              </h1>

              <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
                The premium gallery for emerging academics and creative minds. Connect with top recruiters through high-end portfolio experiences.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/student/register"
                  className="group relative px-8 py-4 bg-blue-700 text-white rounded-xl font-bold text-lg overflow-hidden shadow-xl shadow-blue-200 hover:-translate-y-1 transition-all duration-300">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    Create Portfolio
                  </span>
                </Link>
                <Link to="/recruiter/login"
                  className="group px-8 py-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 flex items-center gap-2">
                  <span className="material-symbols-outlined">person_search</span>
                  Explore Talent
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500"><span className="font-bold text-slate-800">10,000+</span> students already joined</p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative animate-float" style={{ animationDuration: '6s' }}>
                {/* Main card */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 hover:shadow-3xl transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">A</div>
                    <div>
                      <h3 className="font-bold text-slate-900">Alex Jordan</h3>
                      <p className="text-xs text-slate-500">Computer Science • MIT</p>
                    </div>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">Open to Work</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['React', 'Python', 'AI/ML', 'Node.js'].map(s => (
                      <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">{s}</span>
                    ))}
                  </div>
                  <div className="h-24 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200">
                    <span className="material-symbols-outlined mr-2 text-[18px]">palette</span>
                    Portfolio Preview
                  </div>
                </div>

                {/* Floating mini cards */}
                <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 text-center w-32 animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }}>
                  <span className="material-symbols-outlined text-blue-600 text-3xl">stars</span>
                  <p className="text-xs font-bold text-slate-700 mt-1">98% Match</p>
                  <p className="text-[10px] text-slate-400">Recruiter Score</p>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-float w-40" style={{ animationDelay: '2s', animationDuration: '7s' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-bold text-green-600">RECRUITER ONLINE</p>
                  </div>
                  <p className="text-xs font-bold text-slate-700">Google is interested</p>
                  <p className="text-[10px] text-slate-400 mt-1">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Section ── */}
        <section ref={statsRef} className="py-16 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-indigo-900/50" />
          <div className="max-w-5xl mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { value: s1, suffix: '+', label: 'Students Enrolled', icon: 'school' },
                { value: s2, suffix: '+', label: 'Recruiters Active', icon: 'business_center' },
                { value: s3, suffix: '%', label: 'Profile Match Rate', icon: 'analytics' },
              ].map((stat, i) => (
                <div key={i} className="group">
                  <span className={`material-symbols-outlined text-blue-400 text-4xl mb-3 block`}>{stat.icon}</span>
                  <div className="text-5xl font-extrabold text-white tracking-tighter mb-1">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <p className="text-slate-400 font-medium text-sm uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Bento Grid ── */}
        <section id="features" className="py-24 px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <span className="text-xs font-bold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">Platform Features</span>
              <h2 className="text-5xl font-extrabold tracking-tighter mt-6 mb-4">Professional Tools for the New Era</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">Designed to help students stand out in a crowded digital landscape.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[620px]">
              {/* AI Resume — spans 2 cols */}
              <div className="md:col-span-2 bg-white rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center mb-5 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-white text-3xl">psychology</span>
                  </div>
                  <h3 className="text-2xl font-extrabold mb-2 tracking-tight">AI Resume Generator</h3>
                  <p className="text-slate-500 max-w-md">Transform your experiences into a compelling narrative with our intelligent curation engine. ATS-optimized and tailored to your target role.</p>
                </div>
                <div className="mt-6 flex gap-2 relative z-10">
                  <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">Smart Mapping</span>
                  <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">ATS Optimized</span>
                  <span className="px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-bold border border-violet-100">1-Click Export</span>
                </div>
              </div>

              {/* Portfolio Showcase — spans 2 rows */}
              <div className="md:row-span-2 bg-gradient-to-b from-blue-700 to-indigo-800 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-5 border border-white/20 group-hover:bg-white/20 transition-colors">
                    <span className="material-symbols-outlined text-white text-3xl">palette</span>
                  </div>
                  <h3 className="text-2xl font-extrabold mb-3 tracking-tight">Portfolio Showcase</h3>
                  <p className="text-blue-100 leading-relaxed">Gallery-grade presentation for your best work. No templates, pure creativity. Let your projects tell your story.</p>
                </div>
                <div className="relative z-10 space-y-3 mt-8">
                  {['Projects & Case Studies', 'GitHub Integration', 'Live Demo Links', 'Recruiter Analytics'].map(f => (
                    <div key={f} className="flex items-center gap-3 text-sm text-blue-100">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[12px]">check</span>
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Search */}
              <div className="bg-white rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-slate-100 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-700 flex items-center justify-center mb-5 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-white text-3xl">person_search</span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-2 tracking-tight">Smart Recruiter Search</h3>
                  <p className="text-slate-500 text-sm">Let top companies find you through semantic skill matching and real-time profile discovery.</p>
                </div>
              </div>

              {/* Real-time Chat */}
              <div className="bg-white rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 border border-slate-100 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-2xl translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-white text-3xl">forum</span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-2 tracking-tight">Real-time Chat</h3>
                  <p className="text-slate-500 text-sm">Direct, frictionless communication between talent and opportunity. WhatsApp-style split-screen messaging.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Showcase Resources Section ── */}
        <section id="showcase" className="py-24 px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">Showcase Resources</span>
                <h2 className="text-5xl font-extrabold tracking-tighter mt-6 mb-6">Everything you need to stand out</h2>
                <div className="space-y-6">
                  {[
                    { icon: 'workspace_premium', color: 'text-blue-600 bg-blue-50', title: 'LinkedIn-style Profile', desc: 'Education history, skills, projects — all in one professional profile that recruiters love.' },
                    { icon: 'link', color: 'text-indigo-600 bg-indigo-50', title: 'Integrated Social Links', desc: 'Connect your GitHub, LinkedIn, and personal website directly on your profile.' },
                    { icon: 'handshake', color: 'text-violet-600 bg-violet-50', title: 'Student Connections', desc: 'Build your network. Connect with fellow students and grow your professional circle.' },
                    { icon: 'description', color: 'text-emerald-600 bg-emerald-50', title: 'One-Click Resume', desc: 'Generate a polished, ATS-ready resume from your profile data in seconds.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual mockup */}
              <div className="relative">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 shadow-xl">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-50 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">S</div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Sneha Patel</p>
                        <p className="text-xs text-slate-400">B.Tech Computer Science • IIT Bombay</p>
                      </div>
                      <div className="ml-auto flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px] text-slate-500">link</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px] text-slate-500">code</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['React', 'Python', 'ML', 'AWS'].map(s => (
                        <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['Projects', 'Education', 'Connections'].map((label, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-50">
                        <p className="text-2xl font-extrabold text-blue-700">{[4, 2, 127][i]}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-24 px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-extrabold tracking-tighter mb-4">Built for the Next Generation</h2>
              <p className="text-slate-500 text-lg">Hear from students and recruiters shaping the platform.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { quote: "The AI Resume Generator saved me weeks of work. I went from a generic bullet list to a narrative that recruiters actually commented on during interviews.", name: "Alex Rivers", role: "Graduate Designer", initials: "AR", color: "from-blue-500 to-blue-700" },
                { quote: "Finding talent used to be a filtered mess. With Curator, I can see projects and passion instantly. It's the visual LinkedIn I've always wanted.", name: "Marcus Chen", role: "Tech Recruiter @ InnovateUI", initials: "MC", color: "from-indigo-500 to-violet-700" },
              ].map((t, i) => (
                <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="material-symbols-outlined text-yellow-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <p className="text-xl font-medium leading-snug italic text-slate-700 mb-10">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xl font-extrabold shadow-lg`}>{t.initials}</div>
                    <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section id="get-started" className="py-20 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-900 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-transparent to-indigo-900/40 pointer-events-none" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter mb-6">Ready to curate your path?</h2>
                <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">Join 10,000+ students already building their professional identities on The Academic Curator.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/student/register" className="group px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-xl hover:bg-blue-500 transition-colors shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">school</span>
                    I'm a Student
                  </Link>
                  <Link to="/recruiter/register" className="px-10 py-5 bg-white/10 text-white backdrop-blur-md rounded-2xl font-bold text-xl hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">business_center</span>
                    I'm a Recruiter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-50 border-t border-slate-100 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="text-lg font-extrabold text-slate-900 uppercase tracking-tighter">The Academic Curator</div>
            <p className="text-xs text-slate-400 mt-1">© 2026 The Academic Curator. Built for the next generation of talent.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
            {['Privacy Policy', 'Terms of Service', 'Contact', 'FAQ'].map(l => (
              <a key={l} href="#" className="hover:text-blue-600 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-random {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.6; }
          33% { transform: translateY(-30px) translateX(15px) scale(1.1); opacity: 0.8; }
          66% { transform: translateY(10px) translateX(-10px) scale(0.9); opacity: 0.4; }
        }
        @keyframes hero-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-random { animation: float-random 8s ease-in-out infinite; }
        .animate-hero-in { animation: hero-in 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
