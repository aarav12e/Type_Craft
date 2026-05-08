import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Hash, Mail, BookOpen, Lock, Eye, EyeOff, UserPlus, Keyboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthBackground from '../components/AuthBackground';
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
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
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
      <AuthBackground />
      <div className="auth-overlay" />

      <div className="auth-card wide glass-card">
        <div className="auth-brand">
          <Keyboard size={20} className="auth-brand-icon" />
          <span className="auth-brand-name">[TypeCraft]</span>
        </div>

        <div className="auth-header">
          <div className="auth-icon-ring">
            <UserPlus size={26} />
          </div>
          <h1>join typecraft</h1>
          <p>create your college typing account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label><User size={12} style={{ display:'inline', marginRight:'5px' }}/>full name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <label><Hash size={12} style={{ display:'inline', marginRight:'5px' }}/>roll number</label>
              <input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="CS2021001" required />
            </div>
          </div>

          <div className="form-group">
            <label><Mail size={12} style={{ display:'inline', marginRight:'5px' }}/>email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="roll@college.edu" required />
          </div>

          <div className="form-group">
            <label><BookOpen size={12} style={{ display:'inline', marginRight:'5px' }}/>department</label>
            <select name="department" value={form.department} onChange={handleChange} required>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><Lock size={12} style={{ display:'inline', marginRight:'5px' }}/>password</label>
              <div className="input-wrapper">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="min 6 chars" required />
                <button type="button" className="input-eye-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label><Lock size={12} style={{ display:'inline', marginRight:'5px' }}/>confirm password</label>
              <div className="input-wrapper">
                <input type={showConfirm ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} placeholder="••••••••" required />
                <button type="button" className="input-eye-btn" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary full auth-submit-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : (
              <><UserPlus size={15} style={{ display:'inline', marginRight:'6px' }}/>create account</>
            )}
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
