import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AuthPage({ role, isLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    university: '',
  });
  const [error, setError] = useState(null);
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(role, formData.email, formData.password);
      } else {
        await register({ ...formData, role });
      }
      navigate(`/${role}/dashboard`); // or search
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'An error occurred');
    }
  };

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5 -z-10"></div>
      <div className="absolute inset-0 aurora-gradient opacity-10 blur-3xl -z-10"></div>
      
      <div className="bg-surface-container-lowest p-10 rounded-2xl shadow-xl w-full max-w-md z-10 glass-card">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-blue-700 mx-auto block mb-2">The Curator</Link>
          <h2 className="text-2xl font-extrabold text-on-surface">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-sm font-medium text-on-surface-variant uppercase tracking-widest mt-1">
             {role} Portal
          </p>
        </div>

        {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-xl mb-6 text-sm font-bold">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Full Name</label>
              <input type="text" name="name" onChange={handleChange} required className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 ring-primary/20" />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 ring-primary/20" />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 ring-primary/20" />
          </div>

          {!isLogin && role === 'student' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">University</label>
              <input type="text" name="university" onChange={handleChange} required className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 ring-primary/20" />
            </div>
          )}

          {!isLogin && role === 'recruiter' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Company Name</label>
              <input type="text" name="companyName" onChange={handleChange} required className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 ring-primary/20" />
            </div>
          )}

          <button type="submit" className="w-full mt-6 bg-primary text-on-primary font-bold py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-on-surface-variant">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link to={`/${role}/${isLogin ? 'register' : 'login'}`} className="text-primary hover:underline">
                {isLogin ? 'Sign up' : 'Log in'}
            </Link>
        </div>
      </div>
    </div>
  );
}
