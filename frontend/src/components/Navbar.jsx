import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Keyboard, Trophy, User, LogIn, UserPlus, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemePanel from './ThemePanel';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide navbar on auth pages — the full-screen background needs the space
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  if (isAuthPage) return null;

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
        <Link
          to="/"
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          <Keyboard size={14} />
          type
        </Link>
        <Link
          to="/leaderboard"
          className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          <Trophy size={14} />
          leaderboard
        </Link>
        {user && (
          <Link
            to="/profile"
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <User size={14} />
            profile
          </Link>
        )}
        {!user ? (
          <>
            <Link to="/login" className="nav-link btn-ghost" onClick={() => setMenuOpen(false)}>
              <LogIn size={14} />
              login
            </Link>
            <Link to="/register" className="nav-link btn-accent" onClick={() => setMenuOpen(false)}>
              <UserPlus size={14} />
              register
            </Link>
          </>
        ) : (
          <div className="nav-user">
            <span className="nav-username">
              <User size={12} style={{display:'inline', marginRight:'4px'}}/>
              @{user.rollNumber.toLowerCase()}
            </span>
            <button className="btn-ghost small nav-logout" onClick={handleLogout}>
              <LogOut size={13} />
              logout
            </button>
          </div>
        )}
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <ThemePanel />
    </nav>
  );
};

export default Navbar;
