import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Sun, Moon, Eye, TextT, Warning, Bell } from '@phosphor-icons/react';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';
import { ThemeToggle } from '../../components/UI/ThemeToggle';

export const SettingsPage = () => {
  const { 
    theme, 
    setTheme, 
    accessibility, 
    setAccessibility,
    updateAccessibilitySettings,
    notifications, 
    setNotifications,
    updateNotificationSettings,
    setActiveTab,
    logout,
    showConfirm,
    showAlert
  } = useApp();

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [localNotifs, setLocalNotifs] = useState({ ...notifications });
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleAccessibilityChange = (key, value) => {
    const updated = { ...accessibility, [key]: value };
    if (updateAccessibilitySettings) {
      updateAccessibilitySettings(updated);
    } else {
      setAccessibility(updated);
    }
  };

  const handleNotifToggle = (key) => {
    setLocalNotifs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDirectNotifToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    if (updateNotificationSettings) {
      updateNotificationSettings(updated);
    } else {
      setNotifications(updated);
    }
  };

  const handleSaveNotifs = async () => {
    if (updateNotificationSettings) {
      await updateNotificationSettings(localNotifs);
    } else {
      setNotifications(localNotifs);
    }
    setShowNotifModal(false);
    await showAlert({ title: 'Settings Saved', message: 'Notification preferences updated successfully!' });
  };

  const handleDeleteAccount = async () => {
    const confirmed = await showConfirm({
      title: 'Delete Account',
      message: 'CRITICAL: Are you sure you want to delete your profile? This deletes all connection histories, chat logs, and photos permanently. This action is irreversible.',
      okText: 'Delete Account',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      if (api.isConfigured) {
        await api.deleteAccount();
      }
      await logout();
      window.location.reload();
    } catch (err) {
      await showAlert({ title: 'Delete Account Failed', message: err.message || 'Failed to delete account. Please try again.' });
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="settings-page page-enter">
      <PageHeader
        title="Settings"
        subtitle="Personalize your Velvet Hearts experience."
        onBack={() => setActiveTab('profile')}
      />

      <div className="settings-container font-ui">
        {/* Visual Theme Section */}
        <section className="settings-section" aria-labelledby="theme-heading">
          <h2 id="theme-heading" className="section-title">
            <Sun size={20} className="section-title-icon" />
            <span>Theme Preferences</span>
          </h2>
          <div className="settings-theme-switch-row">
            <div className="theme-switch-info">
              <span className="theme-switch-title">Quick Toggle Theme</span>
              <span className="theme-switch-desc">Switch directly between light and dark modes</span>
            </div>
            <ThemeToggle />
          </div>

          <div className="theme-toggle-row">
            {['light', 'dark', 'system'].map(t => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`theme-card ${theme === t ? 'active' : ''}`}
                aria-label={`Select ${t} theme`}
              >
                {t === 'light' && <Sun size={24} />}
                {t === 'dark' && <Moon size={24} />}
                {t === 'system' && <Eye size={24} />}
                <span style={{ textTransform: 'capitalize' }}>{t}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Accessibility Panel */}
        <section className="settings-section border-top" aria-labelledby="access-heading">
          <h2 id="access-heading" className="section-title">
            <Eye size={20} className="section-title-icon" />
            <span>Accessibility Settings</span>
          </h2>
          <div className="settings-options-list">
            
            {/* Reduce Motion */}
            <div className="option-item">
              <div className="option-text">
                <span className="option-label">Reduce Motion</span>
                <span className="option-desc">Minimize screen transitions and scrolling animations</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={accessibility.reduceMotion}
                  onChange={(e) => handleAccessibilityChange('reduceMotion', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* High Contrast */}
            <div className="option-item">
              <div className="option-text">
                <span className="option-label">High Contrast Mode</span>
                <span className="option-desc">Increase color contrast for enhanced text legibility</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={accessibility.highContrast}
                  onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Text Scale */}
            <div className="option-item-vertical">
              <div className="option-text">
                <div className="vertical-label-row">
                  <TextT size={18} />
                  <span className="option-label">Text Scale Size</span>
                </div>
                <span className="option-desc">Scale the relative font size of the application text layout</span>
              </div>
              <div className="scale-selectors-row">
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => handleAccessibilityChange('textSize', size)}
                    className={`scale-selector-btn ${accessibility.textSize === size ? 'active' : ''}`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Notification Toggles */}
        <section className="settings-section border-top" aria-labelledby="notif-heading">
          <h2 id="notif-heading" className="section-title">
            <Bell size={20} className="section-title-icon" />
            <span>Notification Preferences</span>
          </h2>
          <div className="settings-options-list">
            
            {/* New Connections */}
            <div className="option-item">
              <div className="option-text">
                <span className="option-label">New Connections</span>
                <span className="option-desc">Alert when someone sends mutual interest</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={Boolean(notifications?.matchNotifs)}
                  onChange={() => handleDirectNotifToggle('matchNotifs')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Chat Messages */}
            <div className="option-item">
              <div className="option-text">
                <span className="option-label">Chat Messages</span>
                <span className="option-desc">Alert when you receive a new chat message</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={Boolean(notifications?.chatNotifs)}
                  onChange={() => handleDirectNotifToggle('chatNotifs')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Incoming Interests */}
            <div className="option-item">
              <div className="option-text">
                <span className="option-label">Incoming Interests</span>
                <span className="option-desc">Alert when someone likes your story or profile</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={Boolean(notifications?.interestNotifs)}
                  onChange={() => handleDirectNotifToggle('interestNotifs')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            {/* Email digests */}
            <div className="option-item">
              <div className="option-text">
                <span className="option-label">Email Digests</span>
                <span className="option-desc">Receive periodic email digests on active matches</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={Boolean(notifications?.emailNotifs)}
                  onChange={() => handleDirectNotifToggle('emailNotifs')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

          </div>
        </section>

        {/* Account Safety Settings */}
        <section className="settings-section border-top" aria-labelledby="account-heading">
          <h2 id="account-heading" className="section-title text-danger">
            <Warning size={20} className="section-title-icon font-error" />
            <span>Account Operations</span>
          </h2>
          <div className="danger-actions-list">
            <button 
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="option-action-row danger"
            >
              <span>{deletingAccount ? 'Deleting...' : 'Delete Profile Account'}</span>
              <span className="arrow-indicator">&rarr;</span>
            </button>
          </div>
        </section>
      </div>

      {/* Real Notification Preference Modal */}
      <Modal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        title="Notifications Settings"
      >
        <div className="notif-pref-body font-ui">
          <p className="notif-pref-desc font-body">Select when you want to receive alerts from Velvet Hearts.</p>
          
          <div className="notif-options-list">
            <label className="notif-option-item">
              <input
                type="checkbox"
                checked={localNotifs.matchNotifs}
                onChange={() => handleNotifToggle('matchNotifs')}
              />
              <div className="notif-label-text">
                <span className="notif-opt-title">New Connections</span>
                <span className="notif-opt-desc font-body">Alert when someone sends mutual interest</span>
              </div>
            </label>

            <label className="notif-option-item">
              <input
                type="checkbox"
                checked={localNotifs.chatNotifs}
                onChange={() => handleNotifToggle('chatNotifs')}
              />
              <div className="notif-label-text">
                <span className="notif-opt-title">Chat Messages</span>
                <span className="notif-opt-desc font-body">Alert when you receive a message</span>
              </div>
            </label>

            <label className="notif-option-item">
              <input
                type="checkbox"
                checked={localNotifs.interestNotifs}
                onChange={() => handleNotifToggle('interestNotifs')}
              />
              <div className="notif-label-text">
                <span className="notif-opt-title">Incoming Interests</span>
                <span className="notif-opt-desc font-body">Alert when someone likes your story</span>
              </div>
            </label>

            <label className="notif-option-item">
              <input
                type="checkbox"
                checked={localNotifs.emailNotifs}
                onChange={() => handleNotifToggle('emailNotifs')}
              />
              <div className="notif-label-text">
                <span className="notif-opt-title">Email digests</span>
                <span className="notif-opt-desc font-body">Receive weekly emails on active members</span>
              </div>
            </label>
          </div>

          <div className="notif-modal-actions">
            <Button variant="secondary" onClick={() => setShowNotifModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveNotifs}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>

      <style>{`
        .settings-page {
          max-width: 600px;
          margin: 0 auto;
          padding: var(--space-6) var(--space-4) var(--space-12);
        }

        .settings-theme-switch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--bg-surface);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-5);
          margin-bottom: var(--space-2);
        }

        .theme-switch-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .theme-switch-title {
          font-weight: 600;
          font-size: var(--text-body-sm);
          color: var(--text-primary);
        }

        .theme-switch-desc {
          font-size: var(--text-caption);
          color: var(--text-secondary);
        }

        .settings-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-body);
          font-weight: 600;
          color: var(--text-primary);
        }

        .section-title-icon {
          color: var(--text-accent);
        }

        .border-top {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-6);
        }

        /* Themes */
        .theme-toggle-row {
          display: flex;
          gap: var(--space-4);
        }

        .theme-card {
          flex: 1;
          background-color: var(--bg-surface);
          border: 1.5px solid var(--border-default);
          border-radius: var(--radius-lg);
          padding: var(--space-5) var(--space-4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          font-weight: 600;
          transition: all var(--duration-fast);
        }

        .theme-card.active {
          border-color: var(--border-focus);
          background-color: var(--bg-accent-subtle);
          color: var(--text-accent);
        }

        .theme-card:hover:not(.active) {
          background-color: var(--bg-surface-warm);
        }

        /* Options list */
        .settings-options-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .option-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-4);
        }

        .option-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-width: 80%;
        }

        .option-label {
          font-size: var(--text-body);
          font-weight: 600;
          color: var(--text-primary);
        }

        .option-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        /* Toggle slider */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 28px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: var(--charcoal-300);
          border-radius: var(--radius-full);
          transition: .3s;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          border-radius: 50%;
          transition: .3s;
        }

        input:checked + .toggle-slider {
          background-color: var(--burgundy-500);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(22px);
        }

        /* Vertical option item for text scaling */
        .option-item-vertical {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .vertical-label-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .scale-selectors-row {
          display: flex;
          gap: var(--space-2);
        }

        .scale-selector-btn {
          flex: 1;
          background-color: var(--bg-surface-warm);
          border: 1px solid var(--border-default);
          color: var(--text-secondary);
          padding: var(--space-2) 0;
          border-radius: var(--radius-full);
          font-weight: 500;
          transition: all var(--duration-fast);
        }

        .scale-selector-btn:hover {
          border-color: var(--text-primary);
          color: var(--text-primary);
        }

        .scale-selector-btn.active {
          background-color: var(--burgundy-500);
          border-color: var(--burgundy-500);
          color: #FFFFFF;
        }

        /* Toggles */
        .danger-actions-list {
          display: flex;
          flex-direction: column;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .option-action-row {
          display: flex;
          justify-content: space-between;
          padding: var(--space-4);
          border-bottom: 1px solid var(--border-subtle);
          width: 100%;
          text-align: left;
          font-size: var(--text-body-sm);
          color: var(--text-primary);
          font-weight: 500;
          transition: background-color var(--duration-fast);
        }

        .option-action-row:last-child {
          border-bottom: none;
        }

        .option-action-row:hover {
          background-color: var(--bg-surface-warm);
        }

        .option-action-row.danger {
          color: var(--error);
        }

        .option-action-row.danger:hover {
          background-color: var(--error-light);
        }

        .arrow-indicator {
          color: var(--text-muted);
        }

        /* Notif Modal */
        .notif-pref-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .notif-pref-desc {
          font-size: var(--text-body-sm);
          color: var(--text-secondary);
        }

        .notif-options-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .notif-option-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background-color: var(--bg-surface-warm);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
        }

        .notif-option-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--burgundy-500);
          flex-shrink: 0;
        }

        .notif-label-text {
          display: flex;
          flex-direction: column;
        }

        .notif-opt-title {
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .notif-opt-desc {
          font-size: 11px;
          color: var(--text-secondary);
        }

        .notif-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-4);
        }
      `}</style>
    </div>
  );
};
