import React, { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemePanel = () => {
  const { themeId, setThemeId, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="theme-panel-wrapper" ref={panelRef}>
      <button
        className={`theme-toggle-btn ${open ? 'active' : ''}`}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        title="Change theme"
      >
        <Palette size={16} />
      </button>

      {open && (
        <div className="theme-dropdown">
          <p className="theme-dropdown-label">theme</p>
          <div className="theme-list">
            {themes.map((t) => (
              <button
                key={t.id}
                className={`theme-item ${themeId === t.id ? 'selected' : ''}`}
                onClick={() => { setThemeId(t.id); setOpen(false); }}
              >
                {/* Mini preview swatches */}
                <span className="theme-swatches">
                  {t.preview.map((c, i) => (
                    <span key={i} className="swatch" style={{ background: c }} />
                  ))}
                </span>
                <span className="theme-name">{t.label}</span>
                {themeId === t.id && <span className="theme-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePanel;
