import React, { useState } from 'react';

/* ─── Password strength helpers ───────────────────────────── */
export function getStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8)      s++;
  if (/[A-Z]/.test(pwd))   s++;
  if (/[0-9]/.test(pwd))   s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s; // 0-4
}

const STR_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STR_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

export function PasswordStrength({ password }) {
  const score = getStrength(password);
  if (!password) return null;
  return (
    <div className="pwd-strength">
      <div className="pwd-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="pwd-strength-bar"
            style={{ background: i <= score ? STR_COLORS[score] : 'rgba(255,255,255,0.10)' }}
          />
        ))}
      </div>
      <span className="pwd-strength-label" style={{ color: STR_COLORS[score] }}>
        {STR_LABELS[score]}
      </span>
    </div>
  );
}

/* ─── Floating-label input ────────────────────────────────── */
export function FloatingInput({ id, label, type = 'text', value, onChange, required, icon, autoComplete, error }) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const isPwd    = type === 'password';
  const inputType = isPwd ? (showPwd ? 'text' : 'password') : type;
  const isActive = focused || Boolean(value);

  return (
    <div className={`fi-wrap${error ? ' fi-wrap--error' : ''}`}>
      {icon && <span className={`fi-icon${isActive ? ' fi-icon--active' : ''}`}>{icon}</span>}

      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=" "
        className={[
          'fi-input',
          icon   ? 'fi-input--icon' : '',
          isPwd  ? 'fi-input--pwd'  : '',
        ].filter(Boolean).join(' ')}
      />

      <label
        htmlFor={id}
        className={[
          'fi-label',
          icon     ? 'fi-label--icon'  : '',
          isActive ? 'fi-label--float' : '',
        ].filter(Boolean).join(' ')}
      >
        {label}
      </label>

      {isPwd && (
        <button
          type="button"
          className="fi-pwd-toggle"
          onClick={() => setShowPwd((v) => !v)}
          tabIndex={-1}
          aria-label={showPwd ? 'Hide password' : 'Show password'}
        >
          {showPwd ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      )}

      {error && <p className="fi-error">{error}</p>}
    </div>
  );
}

/* ─── Role Toggle (Student | Recruiter) ───────────────────── */
export function RoleToggle({ role, onStudentPath, onRecruiterPath }) {
  return (
    <div className="role-toggle" role="tablist" aria-label="Select portal">
      <a
        href={onStudentPath}
        role="tab"
        aria-selected={role === 'student'}
        className={`role-tab${role === 'student' ? ' role-tab--active' : ''}`}
      >
        {/* Graduation cap */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        Student
      </a>
      <a
        href={onRecruiterPath}
        role="tab"
        aria-selected={role === 'recruiter'}
        className={`role-tab${role === 'recruiter' ? ' role-tab--active' : ''}`}
      >
        {/* Briefcase */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
        Recruiter
      </a>
    </div>
  );
}

/* ─── Submit Button ───────────────────────────────────────── */
export function AuthButton({ loading, children, disabled, recruiter }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`auth-btn${recruiter ? ' auth-btn--recruiter' : ''}`}
    >
      {loading ? <span className="auth-btn-spinner" /> : children}
    </button>
  );
}

/* ─── Alert ───────────────────────────────────────────────── */
export function AuthAlert({ type = 'error', message }) {
  if (!message) return null;
  return (
    <div className={`auth-alert auth-alert--${type}`} role="alert">
      {type === 'error' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
}
