import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="logo-bracket">[</span>
        TypeCraft
        <span className="logo-bracket">]</span>
      </Link>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
          type
        </Link>
        <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
          leaderboard
        </Link>
        {user && (
          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            profile
          </Link>
        )}
        {!user ? (
          <>
            <Link to="/login" className="nav-link btn-ghost" onClick={() => setMenuOpen(false)}>login</Link>
            <Link to="/register" className="nav-link btn-accent" onClick={() => setMenuOpen(false)}>register</Link>
          </>
        ) : (
          <div className="nav-user">
            <span className="nav-username">@{user.rollNumber.toLowerCase()}</span>
            <button className="btn-ghost small" onClick={handleLogout}>logout</button>
          </div>
        )}
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </button>
    </nav>
  );
};

export default Navbar;
