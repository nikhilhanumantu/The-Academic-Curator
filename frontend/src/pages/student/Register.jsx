import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import { FloatingInput, RoleToggle, AuthButton, AuthAlert, PasswordStrength, getStrength } from '../../components/auth/AuthComponents';
import '../../components/auth/auth.css';

/* ── Icons ─────────────────────────────────────────────── */
const IconUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconEmail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/* ── Page ───────────────────────────────────────────────── */
export default function StudentRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name = 'Full name is required';
    if (!form.email)        e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)     e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    else if (getStrength(form.password) < 2) e.password = 'Please choose a stronger password';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setError(null); setLoading(true);
    try {
      await register({ ...form, role: 'student' });
      navigate('/student/profile-builder');
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout role="student">
      <div className="auth-card-header">
        <RoleToggle role="student" onStudentPath="/student/register" onRecruiterPath="/recruiter/register" />
        <h1 className="auth-card-title">
          Create <span className="ac-highlight-student">Account</span>
        </h1>
        <p className="auth-card-subtitle">Join thousands of students showcasing their talent.</p>
      </div>

      <AuthAlert type="error" message={error} />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FloatingInput
          id="sr-name" label="Full Name" type="text"
          value={form.name} onChange={set('name')}
          required icon={<IconUser />} autoComplete="name" error={errors.name}
        />
        <FloatingInput
          id="sr-email" label="Email Address" type="email"
          value={form.email} onChange={set('email')}
          required icon={<IconEmail />} autoComplete="email" error={errors.email}
        />
        <div>
          <FloatingInput
            id="sr-password" label="Password" type="password"
            value={form.password} onChange={set('password')}
            required icon={<IconLock />} autoComplete="new-password" error={errors.password}
          />
          <PasswordStrength password={form.password} />
        </div>

        <p style={{ fontSize: '0.77rem', color: 'var(--ac-subtle)', textAlign: 'center', margin: '-4px 0' }}>
          By creating an account you agree to our{' '}
          <a href="#" style={{ color: '#a78bfa', textDecoration: 'none' }}>Terms</a>{' '}&amp;{' '}
          <a href="#" style={{ color: '#a78bfa', textDecoration: 'none' }}>Privacy Policy</a>.
        </p>

        <AuthButton loading={loading} disabled={loading}>Create Student Account</AuthButton>
      </form>

      <p className="auth-link" style={{ marginTop: 24 }}>
        Already have an account?{' '}<Link to="/student/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
