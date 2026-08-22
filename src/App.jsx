import React, { useState, Component, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Celebration } from './components/Celebration';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import velvetHeartLogo from './assets/velvet-heart-logo.png';

import { LoadingScreen } from './components/UI/LoadingScreen';

// Critical Route Imports
import { LandingPage } from './pages/Landing/LandingPage';
import { AuthFlow } from './pages/Auth/AuthFlow';
import { DiscoverFeed } from './pages/Discover/DiscoverFeed';
import { MatchesList } from './pages/Matches/MatchesList';
import { ChatView } from './pages/Chat/ChatView';
import { YouProfile } from './pages/Profile/YouProfile';
import { ProfileDetail } from './pages/ProfileDetail/ProfileDetail';
import { ToastContainer } from './components/UI/ToastContainer';
import { PWAInstallModal } from './components/UI/PWAInstallModal';
import { FeatureTourGuide } from './components/UI/FeatureTourGuide';

// Lazy-loaded Secondary Routes for Performance Optimization
const OnboardingFlow = lazy(() => import('./pages/Onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));
const EditProfile = lazy(() => import('./pages/Profile/EditProfile').then(m => ({ default: m.EditProfile })));
const SavedProfilesPage = lazy(() => import('./pages/Profile/SavedProfilesPage').then(m => ({ default: m.SavedProfilesPage })));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SafetyCenter = lazy(() => import('./pages/Safety/SafetyCenter').then(m => ({ default: m.SafetyCenter })));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

const AuthLoadingScreen = () => {
  return (
    <LoadingScreen
      logoSrc={velvetHeartLogo}
      heartSize={84}
      fullscreen={true}
      messageInterval={2200}
      longWaitThreshold={10000}
    />
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
        <div style={{ padding: 40, color: '#fce7f3', background: '#1a1517', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', marginBottom: 16, color: '#ffffff' }}>Something went wrong</h1>
          <p style={{ color: '#e2b3b8', maxWidth: 480, marginBottom: 24, fontSize: '1rem', lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected render error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 28px', background: '#b8436a', color: '#ffffff', border: 'none', borderRadius: '24px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(184,67,106,0.3)' }}
          >
            Reload Page ✨
          </button>
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

  // Handle Service Worker postMessage navigation when app is already open
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleSwMessage = (e) => {
        const targetTab = e.data?.tab || (e.data?.url?.includes('notifications') ? 'notifications' : e.data?.url?.includes('chat') ? 'chat' : null);
        if (e.data?.type === 'NAVIGATE' && targetTab) {
          setActiveTab(targetTab);
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    }
  }, [setActiveTab]);

  // Handle URL pathname and query parameter deep linking (e.g. /discover or /?tab=chat)
  React.useEffect(() => {
    const validTabs = ['discover', 'matches', 'chat', 'notifications', 'profile', 'settings', 'safety'];
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
      try {
        window.history.replaceState({}, '', '/');
      } catch (_) {}
    } else {
      const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (cleanPath && validTabs.includes(cleanPath)) {
        setActiveTab(cleanPath);
        try {
          window.history.replaceState({}, '', '/');
        } catch (_) {}
      }
    }
  }, [setActiveTab]);

  // SEO: Dynamic page title based on current state
  React.useEffect(() => {
    const BASE_TITLE = 'Velvet Hearts';
    const TAB_TITLES = {
      discover: 'Discover',
      matches: 'Matches',
      chat: 'Chat',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
      safety: 'Safety Center',
    };

    if (!isLoggedIn) {
      document.title = `${BASE_TITLE} | Intentional Dating & Inclusive Relationship Platform`;
    } else if (!isOnboarded) {
      document.title = `Get Started | ${BASE_TITLE}`;
    } else {
      const tabLabel = TAB_TITLES[activeTab] || 'Discover';
      document.title = `${tabLabel} | ${BASE_TITLE}`;
    }
  }, [activeTab, isLoggedIn, isOnboarded]);

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
    return (
      <Suspense fallback={<AuthLoadingScreen />}>
        <OnboardingFlow />
      </Suspense>
    );
  }

  // 3. Authenticated and Onboarded: Layout wrapping Main Navigation
  return (
    <Navigation>
      <Suspense fallback={<AuthLoadingScreen />}>
        {renderActivePage()}
      </Suspense>
      <PWAInstallModal isLoggedIn={isLoggedIn} isOnboarded={isOnboarded} />
      <FeatureTourGuide />
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
        <Analytics />
        <SpeedInsights />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
