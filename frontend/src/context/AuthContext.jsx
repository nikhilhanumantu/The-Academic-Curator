import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to authenticate token', err);
        logout();
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (role, email, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    if (res.data.role !== role) {
      throw new Error(`Please login via the ${res.data.role} portal.`);
    }
    sessionStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post('http://localhost:5000/api/auth/register', userData);
    sessionStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    return res.data;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
