import React from 'react';
import { Sun, Moon } from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';

export const ThemeToggle = ({ className = '' }) => {
  const { resolvedTheme, setTheme } = useApp();

  const currentMode = resolvedTheme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'dark') || 'dark';
  const isDark = currentMode === 'dark';

  const handleToggle = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const nextTheme = isDark ? 'light' : 'dark';
    if (typeof setTheme === 'function') {
      setTheme(nextTheme);
    } else if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.body?.setAttribute('data-theme', nextTheme);
      try { localStorage.setItem('vh-theme', nextTheme); } catch (_) {}
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
