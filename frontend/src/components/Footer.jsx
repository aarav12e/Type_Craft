import React from 'react';
import { Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="global-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-brand">&lt;TypeCraft/&gt;</span>
        </div>
        <div className="footer-center">
          <p>
            Built with <Heart size={12} className="heart-icon" /> for the community.
          </p>
        </div>
        <div className="footer-right">
          <a href="/leaderboard" className="footer-link">Leaderboard</a>
          <span className="footer-sep">•</span>
          <a href="/practice" className="footer-link">Practice</a>
          <span className="footer-sep">•</span>
          <a href="/profile" className="footer-link">Profile</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
