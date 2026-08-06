import React, { useState, Component } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Celebration } from './components/Celebration';
import { Clock, SpinnerGap } from '@phosphor-icons/react';
import velvetHeartLogo from './assets/velvet-heart-logo.png';

// Page Imports
import { LandingPage } from './pages/Landing/LandingPage';
import { AuthFlow } from './pages/Auth/AuthFlow';
import { OnboardingFlow } from './pages/Onboarding/OnboardingFlow';
import { DiscoverFeed } from './pages/Discover/DiscoverFeed';
import { ProfileDetail } from './pages/ProfileDetail/ProfileDetail';
import { MatchesList } from './pages/Matches/MatchesList';
import { ChatView } from './pages/Chat/ChatView';
import { YouProfile } from './pages/Profile/YouProfile';
import { EditProfile } from './pages/Profile/EditProfile';
import { SavedProfilesPage } from './pages/Profile/SavedProfilesPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { SafetyCenter } from './pages/Safety/SafetyCenter';
import { NotificationsPage } from './pages/Notifications/NotificationsPage';
import { ToastContainer } from './components/UI/ToastContainer';

const AuthLoadingScreen = () => {
  return (
    <div className="auth-loading-screen">
      <div className="auth-loading-inner">
        <SpinnerGap size={48} className="auth-spinner" />
        <img src={velvetHeartLogo} alt="Velvet Hearts" className="auth-loading-logo" />
      </div>

      <style>{`
        .auth-loading-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100dvh;
          background: linear-gradient(135deg, var(--burgundy-950) 0%, var(--charcoal-950) 60%, var(--burgundy-900) 100%);
        }

        .auth-loading-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }

        .auth-spinner {
          color: var(--burgundy-300);
          animation: spin 1s linear infinite;
        }

        .auth-loading-logo {
          width: clamp(68px, 12vw, 100px);
          height: auto;
          filter: drop-shadow(0 0 16px rgba(184, 67, 106, 0.35));
          animation: logoPulse 2s ease-in-out infinite;
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ERROR_BOUNDARY_CAUGHT:', error, info?.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'red', background: '#1a1517', minHeight: '100vh' }}>
          <h1>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ff6b6b' }}>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { authLoading, isLoggedIn, isOnboarded, activeTab, setActiveTab, approvalStatus, userRole, deepLinkConversationId, setDeepLinkConversationId } = useApp();

  const [authInitialMode, setAuthInitialMode] = useState('signup');

  console.log('APPCONTENT_RENDER:', { authLoading, isLoggedIn, isOnboarded, approvalStatus, userRole, activeTab });

  const [showAuth, setShowAuth] = useState(false);
  
  // Specific detail sub-page triggers
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [preselectedChatPartnerId, setPreselectedChatPartnerId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isViewingSavedProfiles, setIsViewingSavedProfiles] = useState(false);

  // Helper to clear profile details and return to discover feed
  const handleBackToDiscover = () => {
    setSelectedProfile(null);
  };

  // Helper when user selects a match connection to chat with
  const handleSelectConnection = (connection) => {
    setPreselectedChatPartnerId(connection.id);
    setActiveTab('chat');
  };

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  // Deep-link into chat if triggered by a notification
  React.useEffect(() => {
    if (deepLinkConversationId) {
      setPreselectedChatPartnerId(deepLinkConversationId);
      setActiveTab('chat');
      // Clear the deep link so subsequent navigations don't re-trigger automatically
      setDeepLinkConversationId(null);
    }
  }, [deepLinkConversationId, setActiveTab, setDeepLinkConversationId]);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'discover':
        if (selectedProfile) {
          return (
            <ProfileDetail 
              profile={selectedProfile} 
              onBack={handleBackToDiscover} 
            />
          );
        }
        return <DiscoverFeed onSelectProfile={setSelectedProfile} />;
        
      case 'matches':
        if (selectedProfile) {
          return (
            <ProfileDetail
              profile={selectedProfile}
              onBack={handleBackToDiscover}
            />
          );
        }
        return <MatchesList onSelectConnection={handleSelectConnection} onSelectProfile={setSelectedProfile} />;
        
      case 'chat':
        return (
          <ChatView 
            preselectedConnectionId={preselectedChatPartnerId} 
            onClearPreselected={() => setPreselectedChatPartnerId(null)}
          />
        );
        
      case 'notifications':
        return <NotificationsPage />;

      case 'profile':
        if (isEditingProfile) {
          return <EditProfile onBack={() => setIsEditingProfile(false)} />;
        }
        if (isViewingSavedProfiles) {
          return (
            <SavedProfilesPage
              onBack={() => setIsViewingSavedProfiles(false)}
              onSelectProfile={setSelectedProfile}
            />
          );
        }
        return (
          <YouProfile
            onEditProfile={() => setIsEditingProfile(true)}
            onOpenSavedProfiles={() => setIsViewingSavedProfiles(true)}
            onSelectProfile={setSelectedProfile}
          />
        );
        
      case 'settings':
        return <SettingsPage />;
        
      case 'safety':
        return <SafetyCenter />;

      default:
        return <DiscoverFeed onSelectProfile={setSelectedProfile} />;
    }
  };

  // 0. Loading — session restoration in progress
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  // 1. Logged Out State: Landing or Auth Screen
  if (!isLoggedIn) {
    if (showAuth) {
      return <AuthFlow onBack={() => setShowAuth(false)} initialMode={authInitialMode} />;
    }
    return (
      <LandingPage
        onGetStarted={() => {
          setAuthInitialMode('signup');
          setShowAuth(true);
        }}
        onSignIn={() => {
          setAuthInitialMode('login');
          setShowAuth(true);
        }}
      />
    );
  }

  // 2. Authenticated but Onboarding Incomplete
  if (!isOnboarded) {
    return <OnboardingFlow />;
  }

  // 3. Authenticated and Onboarded: Layout wrapping Main Navigation
  return (
    <Navigation>
      {renderActivePage()}
    </Navigation>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
        <Celebration />
        <ToastContainer />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
