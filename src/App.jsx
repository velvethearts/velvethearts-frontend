import React, { useState, useEffect, Component, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Celebration } from './components/Celebration';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import velvetHeartLogo from './assets/velvet-heart-logo.png';

import { LoadingScreen } from './components/UI/LoadingScreen';
import { LandingPage } from './pages/Landing/LandingPage';
import { ToastContainer } from './components/UI/ToastContainer';
import { CookieConsentBanner } from './components/UI/CookieConsentBanner';
import { initGA } from './lib/analytics';
import { updateMetadata } from './lib/metadata';

// Route-based Code Splitting: Lazy-load authenticated & secondary sub-pages
const AuthFlow = lazy(() => import('./pages/Auth/AuthFlow').then(m => ({ default: m.AuthFlow })));
const DiscoverFeed = lazy(() => import('./pages/Discover/DiscoverFeed').then(m => ({ default: m.DiscoverFeed })));
const MatchesList = lazy(() => import('./pages/Matches/MatchesList').then(m => ({ default: m.MatchesList })));
const ChatView = lazy(() => import('./pages/Chat/ChatView').then(m => ({ default: m.ChatView })));
const YouProfile = lazy(() => import('./pages/Profile/YouProfile').then(m => ({ default: m.YouProfile })));
const ProfileDetail = lazy(() => import('./pages/ProfileDetail/ProfileDetail').then(m => ({ default: m.ProfileDetail })));
const FeatureTourGuide = lazy(() => import('./components/UI/FeatureTourGuide').then(m => ({ default: m.FeatureTourGuide })));
const OnboardingFlow = lazy(() => import('./pages/Onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));
const EditProfile = lazy(() => import('./pages/Profile/EditProfile').then(m => ({ default: m.EditProfile })));
const SavedProfilesPage = lazy(() => import('./pages/Profile/SavedProfilesPage').then(m => ({ default: m.SavedProfilesPage })));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SafetyCenter = lazy(() => import('./pages/Safety/SafetyCenter').then(m => ({ default: m.SafetyCenter })));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const VerificationPromptModal = lazy(() => import('./components/Safety/VerificationPromptModal').then(m => ({ default: m.VerificationPromptModal })));
const WarningAlertModal = lazy(() => import('./components/Safety/WarningAlertModal').then(m => ({ default: m.WarningAlertModal })));
const AdminPanel = lazy(() => import('./pages/Admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

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
            Reload Page 🔄️
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
  const [isNotFound, setIsNotFound] = useState(false);
  const [notFoundPath, setNotFoundPath] = useState('');

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
          setIsNotFound(false);
          setActiveTab(targetTab);
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    }
  }, [setActiveTab]);

  // Handle URL pathname and query parameter deep linking (e.g. /discover, /?tab=chat, or unknown 404 routes)
  React.useEffect(() => {
    const validTabs = ['discover', 'matches', 'chat', 'notifications', 'profile', 'settings', 'safety', 'admin'];
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');

    if (tabParam) {
      if (validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
        setIsNotFound(false);
      } else {
        setIsNotFound(true);
        setNotFoundPath(`?tab=${tabParam}`);
      }
    } else {
      const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (!cleanPath || cleanPath === '') {
        setIsNotFound(false);
      } else if (cleanPath === '404') {
        setIsNotFound(true);
        setNotFoundPath('/404');
      } else if (validTabs.includes(cleanPath)) {
        setActiveTab(cleanPath);
        setIsNotFound(false);
      } else {
        setIsNotFound(true);
        setNotFoundPath(`/${cleanPath}`);
      }
    }

    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (!path || path === '') {
        setIsNotFound(false);
      } else if (path === '404') {
        setIsNotFound(true);
        setNotFoundPath('/404');
      } else if (validTabs.includes(path)) {
        setActiveTab(path);
        setIsNotFound(false);
      } else {
        setIsNotFound(true);
        setNotFoundPath(`/${path}`);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveTab]);

  // Dynamic SEO & Social Sharing Metadata Management
  React.useEffect(() => {
    if (isNotFound) {
      updateMetadata({
        title: '404 — Page Not Found',
        description: "The page you're searching for doesn't exist on Velvet Hearts. Let's guide you back to where genuine connections happen.",
        robots: 'noindex, nofollow',
        canonicalPath: '/404',
      });
      return;
    }

    if (!isLoggedIn) {
      updateMetadata({
        title: 'Official Website — Intentional Dating & Verified Profiles',
        description: 'Velvet Hearts is the official intentional dating platform featuring 16-zone biometric face verification, 2-minute voice intros, interactive couple diaries, and real-time vibe matching across India.',
        robots: 'index, follow, max-image-preview:large',
        canonicalPath: '/',
      });
    } else if (!isOnboarded) {
      updateMetadata({
        title: 'Get Started & Complete Your Profile',
        description: 'Join Velvet Hearts and set up your authentic, intentional profile.',
        robots: 'noindex, nofollow',
        canonicalPath: '/onboarding',
      });
    } else {
      const TAB_META = {
        discover: {
          title: 'Discover Profiles',
          description: 'Browse verified profiles, 2-minute voice intros, and real-time vibe matches across India on Velvet Hearts.',
          path: '/discover',
        },
        matches: {
          title: 'Your Matches & Connections',
          description: 'View your mutual sparks, conversations, and interactive couple diaries on Velvet Hearts.',
          path: '/matches',
        },
        chat: {
          title: 'Direct Messages',
          description: 'Chat privately and securely with your intentional matches on Velvet Hearts.',
          path: '/chat',
        },
        notifications: {
          title: 'Notifications & Activity',
          description: 'Stay updated on new sparks, profile views, and message requests on Velvet Hearts.',
          path: '/notifications',
        },
        profile: {
          title: 'Your Profile',
          description: 'Manage your verified photos, voice intro, prompts, and relationship preferences on Velvet Hearts.',
          path: '/profile',
        },
        settings: {
          title: 'Settings & Privacy',
          description: 'Configure your privacy preferences, account safety, and notification controls on Velvet Hearts.',
          path: '/settings',
        },
        safety: {
          title: 'Safety Center & Guidelines',
          description: 'Biometric face verification guidelines, emergency contacts, and anti-catfish safety resources on Velvet Hearts.',
          path: '/safety',
        },
        admin: {
          title: 'Admin Moderation Console',
          description: 'Platform verification moderation, user reports, and administrative management on Velvet Hearts.',
          path: '/admin',
        },
      };

      const currentMeta = TAB_META[activeTab] || TAB_META.discover;
      updateMetadata({
        title: currentMeta.title,
        description: currentMeta.description,
        robots: 'noindex, nofollow',
        canonicalPath: currentMeta.path,
      });
    }
  }, [activeTab, isLoggedIn, isOnboarded, isNotFound]);

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
        if (selectedProfile) {
          return (
            <ProfileDetail
              profile={selectedProfile}
              onBack={handleBackToDiscover}
            />
          );
        }
        return (
          <ChatView
            preselectedConnectionId={preselectedChatPartnerId}
            onClearPreselected={() => setPreselectedChatPartnerId(null)}
            onSelectProfile={setSelectedProfile}
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

      case 'admin':
        if (selectedProfile) {
          return (
            <ProfileDetail
              profile={selectedProfile}
              onBack={() => setSelectedProfile(null)}
            />
          );
        }
        return <AdminPanel onSelectProfile={setSelectedProfile} />;

      case '404':
        return (
          <NotFoundPage
            path={notFoundPath || '/404'}
            isLoggedIn={isLoggedIn}
            onNavigate={(target) => {
              setIsNotFound(false);
              setActiveTab(target);
              try { window.history.pushState({}, '', `/${target}`); } catch (_) {}
            }}
          />
        );

      default:
        return <DiscoverFeed onSelectProfile={setSelectedProfile} />;
    }
  };

  // 0. Loading — session restoration in progress
  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  // 1. Dedicated 404 Route (renders for any invalid route, logged in or logged out)
  if (isNotFound) {
    return (
      <Suspense fallback={<AuthLoadingScreen />}>
        <NotFoundPage
          path={notFoundPath}
          isLoggedIn={isLoggedIn}
          onNavigate={(target) => {
            setIsNotFound(false);
            if (target === 'home') {
              try { window.history.pushState({}, '', '/'); } catch (_) {}
            } else {
              setActiveTab(target);
              try { window.history.pushState({}, '', `/${target}`); } catch (_) {}
            }
          }}
          onSignIn={() => {
            setIsNotFound(false);
            setAuthInitialMode('login');
            setShowAuth(true);
            try { window.history.pushState({}, '', '/'); } catch (_) {}
          }}
          onGetStarted={() => {
            setIsNotFound(false);
            setAuthInitialMode('signup');
            setShowAuth(true);
            try { window.history.pushState({}, '', '/'); } catch (_) {}
          }}
        />
      </Suspense>
    );
  }

  // 2. Logged Out State: Landing or Auth Screen
  if (!isLoggedIn) {
    if (showAuth) {
      return (
        <Suspense fallback={<AuthLoadingScreen />}>
          <AuthFlow onBack={() => setShowAuth(false)} initialMode={authInitialMode} />
        </Suspense>
      );
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
    <Navigation isChatViewActive={activeTab === 'chat' && !selectedProfile}>
      <Suspense fallback={<AuthLoadingScreen />}>
        {renderActivePage()}
      </Suspense>
      <FeatureTourGuide />
      <VerificationPromptModal />
      <WarningAlertModal />
    </Navigation>
  );
}

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
        <Celebration />
        <ToastContainer />
        <CookieConsentBanner />
        <Analytics />
        <SpeedInsights />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
