import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Hash, Mail, BookOpen, Zap, Target, Activity, Award, LogOut, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(60);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [scoresRes, statsRes] = await Promise.all([
        axios.get('/api/scores/my-scores'),
        axios.get('/api/scores/stats'),
      ]);
      setScores(scoresRes.data.scores);
      setStats(statsRes.data.stats);
    } catch {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const chartData = scores
    .filter((s) => s.duration === selectedDuration)
    .slice(0, 20)
    .reverse()
    .map((s, i) => ({ test: i + 1, wpm: s.wpm, accuracy: s.accuracy }));

  const currentStats = stats.find((s) => s._id === selectedDuration);

  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="profile-page">
      {/* Profile Card */}
      <div className="profile-header-card">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="profile-roll">
            <Hash size={13} style={{display:'inline', marginRight:'4px'}}/>
            {user.rollNumber}
            <span className="profile-sep">•</span>
            <BookOpen size={13} style={{display:'inline', marginRight:'4px'}}/>
            {user.department}
          </p>
          <p className="profile-email">
            <Mail size={12} style={{display:'inline', marginRight:'4px'}}/>
            {user.email}
          </p>
        </div>
        <button className="btn-ghost small profile-logout-btn" onClick={handleLogout}>
          <LogOut size={14} style={{display:'inline', marginRight:'5px'}}/>
          logout
        </button>
      </div>

      {/* Overall Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <Zap size={20} className="stat-icon accent-icon" />
          <span className="stat-big accent">{user.bestWpm}</span>
          <span className="stat-label">best wpm</span>
        </div>
        <div className="stat-card">
          <Target size={20} className="stat-icon" />
          <span className="stat-big">{user.bestAccuracy}%</span>
          <span className="stat-label">best accuracy</span>
        </div>
        <div className="stat-card">
          <Activity size={20} className="stat-icon" />
          <span className="stat-big">{user.averageWpm}</span>
          <span className="stat-label">avg wpm</span>
        </div>
        <div className="stat-card">
          <Award size={20} className="stat-icon" />
          <span className="stat-big">{user.totalTests}</span>
          <span className="stat-label">total tests</span>
        </div>
      </div>

      {/* Duration filter */}
      <div className="profile-section-header">
        <Clock size={16} />
        <span>stats by duration</span>
        <div className="profile-duration-tabs">
          {[15, 30, 60, 120].map((d) => (
            <button
              key={d}
              className={`dur-btn ${selectedDuration === d ? 'active' : ''}`}
              onClick={() => setSelectedDuration(d)}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Per-duration stats */}
      {currentStats && (
        <div className="duration-stats">
          <div className="dur-stat">
            <span>{Math.round(currentStats.bestWpm)}</span>
            <small>best wpm</small>
          </div>
          <div className="dur-stat">
            <span>{Math.round(currentStats.avgWpm)}</span>
            <small>avg wpm</small>
          </div>
          <div className="dur-stat">
            <span>{Math.round(currentStats.bestAccuracy)}%</span>
            <small>best acc</small>
          </div>
          <div className="dur-stat">
            <span>{currentStats.count}</span>
            <small>tests</small>
          </div>
        </div>
      )}

      {/* WPM Chart */}
      {chartData.length > 1 && (
        <div className="chart-card">
          <h3>
            <Activity size={14} style={{display:'inline', marginRight:'6px'}}/>
            wpm over time ({selectedDuration}s)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="test"
                stroke="#555570"
                tick={{ fill: '#555570', fontSize: 11 }}
                label={{ value: 'Test #', fill: '#555570', fontSize: 11, position: 'insideBottom', offset: -2 }}
              />
              <YAxis stroke="#555570" tick={{ fill: '#555570', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#151521', border: '1px solid #2a2a42', borderRadius: 8, color: '#d1d1e0' }}
                labelStyle={{ color: '#e2b714' }}
              />
              <Line type="monotone" dataKey="wpm" stroke="#e2b714" strokeWidth={2.5} dot={{ fill: '#e2b714', r: 3 }} name="WPM" />
              <Line type="monotone" dataKey="accuracy" stroke="#64ffda" strokeWidth={1.5} dot={false} name="Accuracy" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent scores */}
      <div className="recent-scores">
        <h3>
          <Activity size={14} style={{display:'inline', marginRight:'6px'}}/>
          recent tests
        </h3>
        {loading ? (
          <div className="full-spinner"><div className="spinner large" /></div>
        ) : scores.length === 0 ? (
          <p className="empty-msg">No tests yet. <a href="/">Start typing!</a></p>
        ) : (
          <div className="scores-list">
            {scores.filter(s => s.duration === selectedDuration).slice(0, 10).map((s, i) => (
              <div key={s._id} className="score-row">
                <span className="score-idx">#{i + 1}</span>
                <span className="score-wpm accent">
                  {s.wpm} <small>wpm</small>
                </span>
                <span className="score-acc">
                  <Target size={12} style={{display:'inline', marginRight:'3px'}}/>
                  {s.accuracy}%
                </span>
                <span className="score-chars">{s.correctChars}/{s.totalChars} chars</span>
                <span className="score-date">
                  {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
