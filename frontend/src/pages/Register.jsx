import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Biotechnology', 'MBA', 'MCA', 'Other'
];

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', rollNumber: '', department: '', password: '', confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirm, ...payload } = form;
      await register(payload);
      toast.success('Account created! Start typing 🚀');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <div className="auth-header">
          <h1>join typecraft</h1>
          <p>create your college typing account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>full name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <label>roll number</label>
              <input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="CS2021001" required />
            </div>
          </div>

          <div className="form-group">
            <label>email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="roll@college.edu" required />
          </div>

          <div className="form-group">
            <label>department</label>
            <select name="department" value={form.department} onChange={handleChange} required>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="min 6 chars" required />
            </div>
            <div className="form-group">
              <label>confirm password</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handleChange} placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? <span className="spinner" /> : 'create account'}
          </button>
        </form>

        <p className="auth-switch">
          already have an account? <Link to="/login">sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
