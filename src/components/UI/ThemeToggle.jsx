import React, { useState, useEffect } from 'react';
import { Sun, Moon } from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';
import BlindPullToggle from '@/components/ui/blind-pull-toggle';

export const ThemeToggle = ({ className = '', variant = 'auto' }) => {
  const { resolvedTheme, setTheme } = useApp();
  const [toggleStyle, setToggleStyle] = useState(() => {
    try {
      return localStorage.getItem('vh-theme-toggle-style') || 'pill';
    } catch {
      return 'pill';
    }
  });

  useEffect(() => {
    const handleStyleChange = (e) => {
      if (e.detail) setToggleStyle(e.detail);
    };
    window.addEventListener('vh-theme-toggle-style-changed', handleStyleChange);
    return () => window.removeEventListener('vh-theme-toggle-style-changed', handleStyleChange);
  }, []);

  const currentMode = resolvedTheme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'dark') || 'dark';
  const isDark = currentMode === 'dark';

  const activeVariant = variant === 'auto' ? toggleStyle : variant;

  if (activeVariant === 'blind-pull') {
    return (
      <div className={`vh-blind-pull-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <BlindPullToggle
          isDark={isDark}
          onToggle={(nextDark) => {
            const nextTheme = nextDark ? 'dark' : 'light';
            if (typeof setTheme === 'function') {
              setTheme(nextTheme);
            } else if (typeof document !== 'undefined') {
              document.documentElement.setAttribute('data-theme', nextTheme);
              document.body?.setAttribute('data-theme', nextTheme);
              try { localStorage.setItem('vh-theme', nextTheme); } catch (_) { }
            }
          }}
          size={36}
          showPreviewBg={false}
        />
      </div>
    );
  }

  const handleToggle = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const nextTheme = isDark ? 'light' : 'dark';
    if (typeof setTheme === 'function') {
      setTheme(nextTheme);
    } else if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.body?.setAttribute('data-theme', nextTheme);
      try { localStorage.setItem('vh-theme', nextTheme); } catch (_) { }
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={handleToggle}
      className={`vh-theme-switch ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="vh-theme-switch-track">
        <Sun className="track-icon sun" weight="fill" size={14} />
        <Moon className="track-icon moon" weight="fill" size={14} />
        <div className="vh-theme-switch-thumb">
          {isDark ? (
            <Moon className="thumb-icon" weight="fill" size={12} />
          ) : (
            <Sun className="thumb-icon" weight="fill" size={12} />
          )}
        </div>
      </div>
    </button>
  );
};
