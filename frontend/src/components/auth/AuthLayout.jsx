import React from 'react';
import { Link } from 'react-router-dom';
import AuthBackground from './AuthBackground';

/**
 * Shared layout for all auth pages.
 * role: 'student' | 'recruiter'
 */
export default function AuthLayout({ children, role = 'student' }) {
  const isRecruiter = role === 'recruiter';

  return (
    <div className="auth-root">
      <AuthBackground />

      {/* ── Brand logo / Back Button ────────────────────────────── */}
      <Link to="/" className="auth-brand" title="Return to Homepage">
        <span className="material-symbols-outlined text-white/60 hover:text-white transition-colors">arrow_back</span>
        <span className={`auth-brand-icon${isRecruiter ? ' auth-brand-icon--recruiter' : ''}`}>
          {/* Graduation cap icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </span>
        <span className="auth-brand-name">
          The Academic <em>Curator</em>
        </span>
      </Link>

      {/* ── Centered card ─────────────────────────── */}
      <main className="auth-main">
        <div className={`auth-card auth-card--enter${isRecruiter ? ' auth-card--recruiter' : ''}`}>
          {children}
        </div>
      </main>

      {/* ── Footer ────────────────────────────────── */}
      <footer className="auth-footer">
        <span>© 2026 The Academic Curator</span>
        <a href="#" className="auth-footer-link">Privacy</a>
        <a href="#" className="auth-footer-link">Terms</a>
        <a href="#" className="auth-footer-link">Help</a>
      </footer>
    </div>
  );
}
