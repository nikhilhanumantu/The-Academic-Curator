import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import { FloatingInput, RoleToggle, AuthAlert, PasswordStrength, getStrength } from '../../components/auth/AuthComponents';
import '../../components/auth/auth.css';

const IconBuilding = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
  </svg>
);
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

export default function RecruiterRegister() {
  const [form, setForm] = useState({ companyName: '', name: '', email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [error,  setError]    = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 'Company name is required';
    if (!form.name.trim())        e.name = 'Your name is required';
    if (!form.email)              e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)           e.password = 'Password is required';
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
      await register({ ...form, role: 'recruiter' });
      navigate('/recruiter/search');
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout role="recruiter">
      <div className="auth-card-header">
        <RoleToggle role="recruiter" onStudentPath="/student/register" onRecruiterPath="/recruiter/register" />
        <h1 className="auth-card-title">
          Join as <span className="ac-highlight-recruiter">Recruiter</span>
        </h1>
        <p className="auth-card-subtitle">Access a curated pool of top student talent.</p>
      </div>

      <AuthAlert type="error" message={error} />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FloatingInput
          id="rr-company" label="Company Name" type="text"
          value={form.companyName} onChange={set('companyName')}
          required icon={<IconBuilding />} autoComplete="organization" error={errors.companyName}
        />
        <FloatingInput
          id="rr-name" label="Recruiter Name" type="text"
          value={form.name} onChange={set('name')}
          required icon={<IconUser />} autoComplete="name" error={errors.name}
        />
        <FloatingInput
          id="rr-email" label="Work Email" type="email"
          value={form.email} onChange={set('email')}
          required icon={<IconEmail />} autoComplete="email" error={errors.email}
        />
        <div>
          <FloatingInput
            id="rr-password" label="Password" type="password"
            value={form.password} onChange={set('password')}
            required icon={<IconLock />} autoComplete="new-password" error={errors.password}
          />
          <PasswordStrength password={form.password} />
        </div>

        <p style={{ fontSize: '0.77rem', color: 'var(--ac-subtle)', textAlign: 'center', margin: '-4px 0' }}>
          By creating an account you agree to our{' '}
          <a href="#" style={{ color: '#818cf8', textDecoration: 'none' }}>Terms</a>{' '}&amp;{' '}
          <a href="#" style={{ color: '#818cf8', textDecoration: 'none' }}>Privacy Policy</a>.
        </p>

        <button type="submit" disabled={loading} className="auth-btn auth-btn--recruiter">
          {loading ? <span className="auth-btn-spinner" /> : 'Create Recruiter Account'}
        </button>
      </form>

      <p className="auth-link" style={{ marginTop: 24 }}>
        Already have an account?{' '}
        <Link to="/recruiter/login" style={{ color: '#818cf8' }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
