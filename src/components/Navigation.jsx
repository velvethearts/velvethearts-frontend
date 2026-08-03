import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Heart, Chats, User, ShieldCheck, Sliders, Crown, Bell } from '@phosphor-icons/react';
import { ThemeToggle } from './UI/ThemeToggle';
import logo from "../assets/velvet-heart-logo.png";

export const Navigation = ({ children }) => {
  const { activeTab, setActiveTab, userProfile, userRole, notificationUnreadCount } = useApp();

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  const navItems = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'matches', label: 'Matches', icon: Heart },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'chat', label: 'Chat', icon: Chats },
  { id: 'profile', label: 'You', icon: User },
  ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Crown }] : []),
  ];

  return (
    <div className="app-container">
      {/* Desktop Left Sidebar */}
      <aside className="desktop-sidebar">
      <div className="sidebar-logo">
      <img src={logo} alt="Velvet Hearts" className="logo-image" />
      </div>
        
        <nav className="sidebar-nav">
          <ul>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button 
                    onClick={() => setActiveTab(item.id)}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    aria-label={`Go to ${item.label}`}
                  >
                    <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                    <span>{item.label}</span>
                    {item.id === 'notifications' && notificationUnreadCount > 0 && (
                      <span className="nav-notif-badge">{notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}</span>
                    )}
                    {isActive && <span className="active-dot-sidebar" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`sidebar-link-footer ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Sliders size={20} />
            <span>Settings</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('safety')}
            className={`sidebar-link-footer ${activeTab === 'safety' ? 'active' : ''}`}
          >
            <ShieldCheck size={20} />
            <span>Safety Center</span>
          </button>

          <div className="sidebar-theme-toggle-wrap">
            <span className="theme-toggle-label">Theme</span>
            <ThemeToggle />
          </div>

          <div className="sidebar-credits">
            Made with care. © 2026
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`main-content-layout ${activeTab === 'chat' ? 'chat-active-layout' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <ul>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveTab(item.id)}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  aria-label={item.label}
                >
                  <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                  <span className="mobile-nav-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Styles inline for container layout, matching our design token specifications */}
      <style>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        .desktop-sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-surface);
          border-right: 1px solid var(--border-subtle);
          display: none;
          flex-direction: column;
          padding: var(--space-6) var(--space-4);
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 100;
        }

       .sidebar-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: var(--space-4);

          font-family: var(--font-display);
          font-size: var(--text-heading);
          color: var(--text-accent);
          font-weight: bold;
        }

        .sidebar-logo-image {
          width: 10px !important;
          height: 10px !important;
          object-fit: contain;
        }

        .sidebar-nav ul {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          transition: all var(--duration-fast) var(--ease-out-smooth);
          font-family: var(--font-ui);
          font-weight: 500;
          position: relative;
        }

        .sidebar-link:hover {
          background-color: var(--bg-muted);
          color: var(--text-primary);
        }

        .sidebar-link.active {
          background-color: var(--bg-accent-subtle);
          color: var(--text-accent);
        }

        .active-dot-sidebar {
          position: absolute;
          right: var(--space-4);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--text-accent);
        }

        .nav-notif-badge {
          position: absolute;
          top: 6px;
          right: 8px;
          min-width: 18px;
          height: 18px;
          padding: 0 6px;
          border-radius: 999px;
          background-color: var(--text-accent);
          color: var(--bg-surface);
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          border: 2px solid var(--bg-surface);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-4);
        }

        .sidebar-link-footer {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          width: 100%;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-sm);
          color: var(--text-tertiary);
          font-size: var(--text-body-sm);
          transition: all var(--duration-fast);
        }

        .sidebar-link-footer:hover, .sidebar-link-footer.active {
          color: var(--text-primary);
          background-color: var(--bg-muted);
        }

        .sidebar-theme-toggle-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--space-4);
          margin-top: var(--space-2);
          color: var(--text-tertiary);
          font-size: var(--text-body-sm);
        }

        .theme-toggle-label {
          font-weight: 500;
          font-family: var(--font-ui);
        }

        .sidebar-credits {
          font-size: var(--text-caption);
          color: var(--text-muted);
          padding: var(--space-4) var(--space-4) 0;
          text-align: center;
        }

        .main-content-layout {
          flex: 1;
          width: 100%;
          min-height: 100vh;
          padding-bottom: calc(var(--bottom-nav-height) + var(--space-6));
        }

        .main-content-layout.chat-active-layout {
          height: 100vh;
          min-height: 100vh;
          padding-bottom: var(--bottom-nav-height);
          overflow: hidden;
        }

        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--bottom-nav-height);
          background-color: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          z-index: 100;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding-bottom: env(safe-area-inset-bottom);
        }

        .mobile-bottom-nav ul {
          display: flex;
          width: 100%;
          height: 100%;
          justify-content: space-around;
          align-items: center;
        }

        .mobile-bottom-nav li {
          flex: 1;
          display: flex;
          justify-content: center;
          height: 100%;
        }

        .mobile-nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: var(--text-muted);
          font-family: var(--font-ui);
          gap: 2px;
          transition: color var(--duration-fast) var(--ease-out-smooth);
        }

        .mobile-nav-link.active {
          color: var(--text-accent);
        }

        .mobile-nav-label {
          font-size: 10px;
          font-weight: 500;
        }

        @media (min-width: 768px) {
          .desktop-sidebar {
            display: flex;
          }
          
          .main-content-layout {
            padding-left: var(--sidebar-width);
            padding-bottom: var(--space-6);
          }

          .main-content-layout.chat-active-layout {
            padding-bottom: 0;
            height: 100vh;
            overflow: hidden;
          }

          .mobile-bottom-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
