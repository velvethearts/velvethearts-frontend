import React from 'react';
import { Sun, Moon } from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';

export const ThemeToggle = ({ className = '' }) => {
  const { resolvedTheme, setTheme } = useApp();

  const handleToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={resolvedTheme === 'dark'}
      onClick={handleToggle}
      className={`vh-theme-switch ${className}`}
      aria-label="Toggle dark mode theme"
    >
      <div className="vh-theme-switch-track">
        <Sun className="track-icon sun" weight="fill" size={14} />
        <Moon className="track-icon moon" weight="fill" size={14} />
        <div className="vh-theme-switch-thumb">
          {resolvedTheme === 'dark' ? (
            <Moon className="thumb-icon" weight="fill" size={12} />
          ) : (
            <Sun className="thumb-icon" weight="fill" size={12} />
          )}
        </div>
      </div>
    </button>
  );
};
