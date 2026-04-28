import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import { FloatingInput, RoleToggle, AuthButton, AuthAlert } from '../../components/auth/AuthComponents';
import '../../components/auth/auth.css';

/* ── Icons ─────────────────────────────────────────────── */
const IconEmail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/* ── Page ───────────────────────────────────────────────── */
export default function StudentLogin() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailErr, setEmailErr] = useState('');
  const [pwdErr,   setPwdErr]   = useState('');

  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const validate = () => {
    let ok = true;
    setEmailErr(''); setPwdErr('');
    if (!email)                                    { setEmailErr('Email is required'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr('Enter a valid email'); ok = false; }
    if (!password)                                 { setPwdErr('Password is required'); ok = false; }
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setError(null); setLoading(true);
    try {
      const data = await login('student', email, password);
      navigate(data.isProfileComplete ? '/student/dashboard' : '/student/profile-builder');
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout role="student">
      <div className="auth-card-header">
        <RoleToggle role="student" onStudentPath="/student/login" onRecruiterPath="/recruiter/login" />
        <h1 className="auth-card-title">
          Welcome <span className="ac-highlight-student">Back</span>
        </h1>
        <p className="auth-card-subtitle">Sign in to your student portal and continue your journey.</p>
      </div>

      <AuthAlert type="error" message={error} />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FloatingInput
          id="sl-email" label="Email Address" type="email"
          value={email} onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
          required icon={<IconEmail />} autoComplete="email" error={emailErr}
        />
        <div>
          <FloatingInput
            id="sl-password" label="Password" type="password"
            value={password} onChange={(e) => { setPassword(e.target.value); setPwdErr(''); }}
            required icon={<IconLock />} autoComplete="current-password" error={pwdErr}
          />
          <div className="auth-forgot"><a href="#">Forgot password?</a></div>
        </div>
        <label className="auth-check-row">
          <input type="checkbox" id="sl-remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Keep me signed in</span>
        </label>
        <AuthButton loading={loading} disabled={loading}>Sign In as Student</AuthButton>
      </form>

      <p className="auth-link" style={{ marginTop: 24 }}>
        Don't have an account?{' '}<Link to="/student/register">Create account</Link>
      </p>
    </AuthLayout>
  );
}
