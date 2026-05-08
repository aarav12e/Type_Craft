import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, Keyboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthBackground from '../components/AuthBackground';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated canvas background */}
      <AuthBackground />

      {/* Overlay gradient for readability */}
      <div className="auth-overlay" />

      {/* Glassmorphism card */}
      <div className="auth-card glass-card">
        <div className="auth-brand">
          <Keyboard size={20} className="auth-brand-icon" />
          <span className="auth-brand-name">[TypeCraft]</span>
        </div>

        <div className="auth-header">
          <div className="auth-icon-ring">
            <LogIn size={26} />
          </div>
          <h1>welcome back</h1>
          <p>sign in to track your progress</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>
              <Mail size={12} style={{ display: 'inline', marginRight: '5px' }} />
              email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@college.edu"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              <Lock size={12} style={{ display: 'inline', marginRight: '5px' }} />
              password
            </label>
            <div className="input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary full auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <LogIn size={15} style={{ display: 'inline', marginRight: '6px' }} />
                login
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          new here? <Link to="/register">create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
