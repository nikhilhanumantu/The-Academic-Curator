import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

export default function ResumeGenerator() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [latexCode, setLatexCode] = useState('');

  // Curo Chat State
  const [curoChat, setCuroChat] = useState([
    { role: 'curo', text: "Hi! I'm Curo, your AI Resume assistant. I've drafted a LaTeX resume based on your profile. Review it on the left, and let me know if you need help polishing the bullet points!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/students/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setLatexCode(generateLaTeX(res.data));
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [curoChat]);

  const generateLaTeX = (profileData) => {
    const esc = (str) => {
      if (!str) return '';
      return String(str).replace(/[&%$#_{}~^\\]/g, (match) => {
        if (match === '\\') return '\\textbackslash{}';
        if (match === '~') return '\\textasciitilde{}';
        if (match === '^') return '\\textasciicircum{}';
        return '\\' + match;
      });
    };

    const name = esc(profileData?.userId?.name || 'Your Name');
    const email = esc(profileData?.userId?.email || 'email@example.com');
    const phone = esc(profileData?.phone || '555.555.5555');
    const github = esc(profileData?.github || 'github');

    let experienceLatex = `% [Curo]: I see you haven't listed any professional experience! You can add some manually here.\n  % \\resumeSubheading{Company}{Date}{Role}{Location}\n  % \\resumeItemListStart\\resumeItem{Action 1}\\resumeItemListEnd`;

    let projectsLatex = '';
    if (profileData?.projects?.length > 0) {
      projectsLatex = profileData.projects.map(p => `
      \\resumeProjectHeading
          {\\textbf{${esc(p.title)}}} {Date}
          \\resumeItemListStart
            \\resumeItem{${esc(p.description)}}
            ${p.technologies?.length ? `\\resumeItem{Technologies: ${esc(p.technologies.join(', '))}}` : ''}
          \\resumeItemListEnd
      `).join('\n');
    } else {
      projectsLatex = `      % [Curo]: I noticed you haven't listed any projects. Build some to show off your skills!`;
    }

    let eduLatex = '';
    if (profileData?.education?.length > 0) {
      eduLatex = profileData.education.map(e => `
    \\resumeSubheading
      {${esc(e.school)}}{${esc(e.startYear)} -- ${esc(e.endYear) || 'Present'}}
      {${esc(e.degree || '')} in ${esc(e.fieldOfStudy || '')}}{Location}
      \\resumeItemListStart
        \\resumeItem{Grade: ${esc(e.grade || '')}}
      \\resumeItemListEnd
      `).join('\n');
    } else {
      eduLatex = `    % [Curo]: Add your education background here!`;
    }

    let skillsLatex = '';
    if (profileData?.skills?.length > 0) {
      skillsLatex = `\\textbf{Skills} {: ${esc(profileData.skills.join(', '))}}`;
    } else {
      skillsLatex = `% [Curo]: What are your skills? List them out!`;
    }

    return `%-------------------------
% Resume in Latex
% Author : ${name}
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage[scale=0.90,lf]{FiraMono}

\\definecolor{light-grey}{gray}{0.83}
\\definecolor{dark-grey}{gray}{0.3}
\\definecolor{text-grey}{gray}{.08}

\\DeclareRobustCommand{\\ebseries}{\\fontseries{eb}\\selectfont}
\\DeclareTextFontCommand{\\texteb}{\\ebseries}

\\usepackage{contour}
\\usepackage[normalem]{ulem}
\\renewcommand{\\ULdepth}{1.8pt}
\\contourlength{0.8pt}
\\newcommand{\\myuline}[1]{%
  \\uline{\\phantom{#1}}%
  \\llap{\\contour{white}{#1}}%
}

\\usepackage{tgheros}
\\renewcommand*\\familydefault{\\sfdefault} 
\\usepackage[T1]{fontenc}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{0in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat {\\section}{
    \\bfseries \\vspace{2pt} \\raggedright \\large 
}{}{0em}{}[\\color{light-grey} {\\titlerule[2pt]} \\vspace{-4pt}]

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-1pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & {\\color{dark-grey}\\small #2}\\vspace{1pt}\\\\
      \\textit{#3} & {\\color{dark-grey} \\small #4}\\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
      #1 & {\\color{dark-grey}} \\\\
    \\end{tabular*}\\vspace{-4pt}
}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{0pt}}

\\color{text-grey}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${name}} \\\\ \\vspace{1pt}
    \\small \\faPhone* \\texttt{${phone}} $|$ \\faEnvelope \\hspace{2pt} \\texttt{${email}} $|$ 
    \\faLinkedin \\hspace{2pt} \\href{https://linkedin.com/in/${github}}{\\underline{linkedin.com/in/${github}}} $|$
    \\faGithub \\hspace{2pt} \\href{https://github.com/${github}}{\\underline{github.com/${github}}}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
${eduLatex}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
    ${experienceLatex}
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
${projectsLatex}
    \\resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     ${skillsLatex}
    }}
 \\end{itemize}

\\end{document}
`;
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/resume/generate', { template: 'professional' }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Technical_Resume.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Check if backend is running Puppeteer.');
    }
  };

  const downloadLatex = () => {
    const blob = new Blob([latexCode], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resume.tex');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCuroChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setCuroChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/ai/curo', {
        message: userMsg,
        context: latexCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCuroChat(prev => [...prev, { role: 'curo', text: res.data.reply }]);
    } catch (err) {
      setCuroChat(prev => [...prev, { role: 'curo', text: "Error connecting to AI backend." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatChatMessage = (text) => {
    // 1. Split by code blocks first
    const blockParts = text.split(/(```[\s\S]*?```)/g);

    return blockParts.map((blockPart, blockIdx) => {
      // Handle Code Blocks
      if (blockPart.startsWith('```') && blockPart.endsWith('```')) {
        const lines = blockPart.slice(3, -3).trim().split('\n');
        let codeText = blockPart.slice(3, -3).trim();
        let lang = 'CODE';

        // Extract optional language identifier (e.g. ```latex)
        if (lines.length > 0 && lines[0].trim().match(/^[a-z]+$/i)) {
          lang = lines[0].trim();
          codeText = lines.slice(1).join('\n');
        }

        return (
          <div key={blockIdx} className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-[#1e1e1e] shadow-md !whitespace-normal w-full max-w-full">
            <div className="flex justify-between items-center bg-[#2d2d2d] px-3 py-1.5 border-b border-slate-700">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">{lang}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  // Quick visual feedback could go here
                }}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold tracking-wide bg-transparent border-none cursor-pointer"
                title="Copy code"
              >
                <span className="material-symbols-outlined text-[13px]">content_copy</span> COPY
              </button>
            </div>
            <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed m-0">
              {codeText}
            </pre>
          </div>
        );
      }

      // Handle normal text (with bold support)
      const inlineParts = blockPart.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={blockIdx}>
          {inlineParts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </span>
      );
    });
  };

  if (loading) return null;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Back button top-left */}
      <div className="flex justify-start px-8 pt-6 pb-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white border border-[#e0e3e5] px-4 py-2 rounded-xl text-sm font-bold text-[#2c2f31] shadow-sm hover:shadow-md hover:bg-[#f5f6f8] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
      </div>

      <main className="flex-1 p-8 lg:p-12 h-[calc(100vh-80px)] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-bottom-4">

          {/* Left Panel: Editor */}
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="flex justify-between items-end shrink-0">
              <div>
                <h1 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface uppercase tracking-tight">
                  Technical Resume Editor
                </h1>
                <p className="text-on-surface-variant normal-case">
                  Specialized for Top-Tier Tech (FAANG). Edit the LaTeX source below.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadLatex}
                  className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-700 font-bold shadow-sm hover:shadow-md transition-all uppercase text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">code</span> .tex
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-blue-700 px-4 py-2 rounded-xl text-white font-bold shadow-sm hover:shadow-md transition-all uppercase text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span> PDF
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className={`bg-white rounded-xl shadow-xl flex-1 relative overflow-hidden border border-outline-variant/10`}>
              <textarea
                value={latexCode}
                onChange={(e) => setLatexCode(e.target.value)}
                className="w-full h-full p-6 text-sm font-mono bg-[#1e1e1e] text-[#d4d4d4] outline-none resize-none leading-relaxed"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Right Panel: Curo AI */}
          <div className="w-full lg:w-96 flex flex-col h-full shrink-0">
            <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col flex-1 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-5 py-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md shadow-inner">
                    <span className="material-symbols-outlined text-[20px]">robot_2</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-black leading-tight uppercase tracking-tight">Curo AI</p>
                    <p className="text-blue-100 text-[9px] uppercase font-black tracking-[0.2em] opacity-80">Tech Career Expert</p>
                  </div>
                </div>
              </div>

              {/* Chat Message Box */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {curoChat.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                    <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm'}`}>
                      {formatChatMessage(msg.text)}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleCuroChat} className="p-3 bg-white border-t border-slate-100 shrink-0 flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Curo to write an experience bullet..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
