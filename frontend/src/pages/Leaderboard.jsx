import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DURATIONS = [15, 30, 60, 120];
const MEDALS = ['🥇', '🥈', '🥉'];

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(60);
  const [department, setDepartment] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchLeaderboard(1);
  }, [duration, department]);

  useEffect(() => {
    fetchLeaderboard(page);
  }, [page]);

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get('/api/scores/departments');
      setDepartments(data.departments);
    } catch {}
  };

  const fetchLeaderboard = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/scores/leaderboard', {
        params: { duration, department, page: p, limit: 10 },
      });
      setLeaderboard(data.leaderboard);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const isCurrentUser = (entry) => user && entry.userId === user._id;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="leaderboard-page">
      <div className="lb-header">
        <h1>leaderboard</h1>
        <p>top typists at your college</p>
      </div>

      {/* Filters */}
      <div className="lb-filters">
        <div className="filter-group">
          <label>test duration</label>
          <div className="duration-tabs">
            {DURATIONS.map((d) => (
              <button
                key={d}
                className={`dur-btn ${duration === d ? 'active' : ''}`}
                onClick={() => setDuration(d)}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>department</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="dept-select">
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="lb-stats-bar">
        <span>{total} students ranked</span>
        <span>•</span>
        <span>{duration}s test</span>
        {department !== 'all' && <><span>•</span><span>{department}</span></>}
      </div>

      {/* Podium for top 3 */}
      {!loading && leaderboard.length >= 3 && page === 1 && (
        <div className="podium">
          {/* Silver - 2nd */}
          <div className="podium-item second">
            <div className="podium-avatar">{leaderboard[1]?.name?.[0]?.toUpperCase()}</div>
            <div className="podium-name">{leaderboard[1]?.name}</div>
            <div className="podium-wpm">{leaderboard[1]?.wpm} wpm</div>
            <div className="podium-stand silver">2</div>
          </div>
          {/* Gold - 1st */}
          <div className="podium-item first">
            <div className="crown">👑</div>
            <div className="podium-avatar gold">{leaderboard[0]?.name?.[0]?.toUpperCase()}</div>
            <div className="podium-name">{leaderboard[0]?.name}</div>
            <div className="podium-wpm accent">{leaderboard[0]?.wpm} wpm</div>
            <div className="podium-stand gold-stand">1</div>
          </div>
          {/* Bronze - 3rd */}
          <div className="podium-item third">
            <div className="podium-avatar">{leaderboard[2]?.name?.[0]?.toUpperCase()}</div>
            <div className="podium-name">{leaderboard[2]?.name}</div>
            <div className="podium-wpm">{leaderboard[2]?.wpm} wpm</div>
            <div className="podium-stand bronze">3</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lb-table-container">
        {loading ? (
          <div className="lb-loading">
            <div className="spinner large" />
            <p>Loading rankings...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="lb-empty">
            <p>No results yet for this filter. Be the first! 🚀</p>
          </div>
        ) : (
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>student</th>
                <th>roll no.</th>
                <th>department</th>
                <th>wpm</th>
                <th>accuracy</th>
                <th>date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr
                  key={entry.userId}
                  className={`${getRankClass(entry.rank)} ${isCurrentUser(entry) ? 'current-user-row' : ''}`}
                >
                  <td className="rank-cell">
                    {entry.rank <= 3 ? MEDALS[entry.rank - 1] : entry.rank}
                  </td>
                  <td className="name-cell">
                    <span className="entry-name">{entry.name}</span>
                    {isCurrentUser(entry) && <span className="you-badge">you</span>}
                  </td>
                  <td className="roll-cell">{entry.rollNumber}</td>
                  <td className="dept-cell">{entry.department}</td>
                  <td className="wpm-cell">
                    <span className={entry.rank <= 3 ? 'accent' : ''}>{entry.wpm}</span>
                  </td>
                  <td className="acc-cell">{entry.accuracy}%</td>
                  <td className="date-cell">{formatDate(entry.achievedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← prev</button>
          <span className="page-info">{page} / {totalPages}</span>
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>next →</button>
        </div>
      )}

      {!user && (
        <div className="lb-cta">
          <p>Want to appear on the leaderboard?</p>
          <a href="/register" className="btn-primary">Create an account →</a>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
