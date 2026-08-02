import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef
} from 'react';

import { onAuthStateChanged, signOut } from 'firebase/auth';

import { auth } from '../lib/firebase';
import { api } from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';
const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- Persistent Settings & Themes ---
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('vh-theme') || 'system';
    });

    const [resolvedTheme, setResolvedTheme] = useState(() => {
        const saved = localStorage.getItem('vh-theme') || 'system';
        if (saved === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return saved;
    });

    const [accessibility, setAccessibility] = useState(() => {
        try {
            const saved = localStorage.getItem('vh-accessibility');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) { }

        // Check system reduced motion
        const systemReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        return {
            reduceMotion: systemReduceMotion,
            highContrast: false,
            textSize: 'medium' // 'small' | 'medium' | 'large'
        };
    });

    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem('vh-notifications');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) { }
        return {
            matchNotifs: true,
            chatNotifs: true,
            interestNotifs: true,
            emailNotifs: false
        };
    });

    // --- Auth & Onboarding ---
    const [authLoading, setAuthLoading] = useState(true); // true until session restoration completes
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [phone, setPhone] = useState('');
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [userRole, setUserRole] = useState('USER');
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [userProfile, setUserProfile] = useState({
        name: '',
        dobDay: '',
        dobMonth: '',
        dobYear: '',
        city: '',
        gender: 'Woman',
        showGender: true,
        orientation: 'Straight',
        showOrientation: true,
        relationshipIntent: 'Long-term Relationship',
        relationshipStatus: 'Single',
        interests: [],
        story: '',
        hasDisability: false,
        disabilityInfo: '',
        showDisability: false,
        photos: []
    });

    // --- Discover ---
    const [profiles, setProfiles] = useState([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    const [errorProfiles, setErrorProfiles] = useState(null);

    // --- Interaction States ---
    const [savedProfiles, setSavedProfiles] = useState(() => {
        try {
            const saved = localStorage.getItem('vh-saved-profiles');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return [];
    });

    const [interestsSent, setInterestsSent] = useState([]);
    const [interestStatuses, setInterestStatuses] = useState({});

    const [connections, setConnections] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [reportedUsers, setReportedUsers] = useState([]);

    const [supportTickets, setSupportTickets] = useState(() => {
        try {
            const saved = localStorage.getItem('vh-support-tickets');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return [];
    });

    const [showCelebration, setShowCelebration] = useState(null);

    const [chats, setChats] = useState({});
    const [conversations, setConversations] = useState([]);

    // UI state
    const [activeTab, setActiveTab] = useState('discover');
    const [filters, setFilters] = useState({
        gender: 'All',
        relationshipIntent: 'All',
        city: '',
        ageMin: 18,
        ageMax: 60,
        distanceMax: 50,
        verifiedOnly: false
    });

    // ─── Helper: hydrate state from /profile/me response ───────────────

    const hydrateFromProfile = (data) => {
        if (!data) {
            // No profile yet = needs onboarding
            setIsOnboarded(false);
            return;
        }

        // The backend getMe returns profile + user data
        const user = data.user || data;
        const profile = data.profile || data;

        setPhone(user.phoneNumber || '');
        setApprovalStatus(normalizeApprovalStatus(user.approvalStatus || data.approvalStatus));
        setUserRole(user.role || data.role || 'USER');

        if (profile.name) {
            setIsOnboarded(true);
            setUserProfile(prev => ({
                ...prev,
                name: profile.name || '',
                dobDay: profile.dobDay || profile.birthDay || '',
                dobMonth: profile.dobMonth || profile.birthMonth || '',
                dobYear: profile.dobYear || profile.birthYear || '',
                city: profile.city || '',
                gender: profile.gender || 'Woman',
                showGender: profile.showGender ?? true,
                orientation: profile.orientation || 'Straight',
                showOrientation: profile.showOrientation ?? true,
                relationshipIntent: profile.relationshipIntent || 'Long-term Relationship',
                relationshipStatus: profile.relationshipStatus || 'Single',
                interests: profile.interests || [],
                story: profile.story || '',
                hasDisability: profile.hasDisability || false,
                disabilityInfo: profile.disabilityInfo || '',
                showDisability: profile.showDisability || false,
                photos: profile.photos || []
            }));
        } else {
            setIsOnboarded(false);
        }
    };

    const normalizeApprovalStatus = (status) => {
        if (!status) return 'pending';
        return status.toLowerCase();
    };


    // ─── Discover Profiles (API-driven) ────────────────────────────────

    const fetchDiscoverProfiles = useCallback(async () => {
        if (!api.isConfigured) {
            setLoadingProfiles(false);
            setErrorProfiles('Backend not configured');
            return;
        }

        setLoadingProfiles(true);
        setErrorProfiles(null);

        try {
            const data = await api.getDiscover(filters);
            setProfiles(Array.isArray(data) ? data : []);
        } catch (err) {
            setErrorProfiles(err.message || 'Failed to load profiles');
            setProfiles([]);
        } finally {
            setLoadingProfiles(false);
        }
    }, [filters]);


    // ─── Connections (API-driven) ──────────────────────────────────────

    const fetchConnections = useCallback(async () => {
        if (!api.isConfigured) return;
        try {
            const data = await api.getConnections();
            const newConns = Array.isArray(data) ? data : [];

            setConnections(prev => {
                const oldIds = prev.map(c => c.id);
                const added = newConns.filter(c => !oldIds.includes(c.id));

                // Show celebration popup for newly added mutual connections
                for (const conn of added) {
                    if (interestsSent.includes(conn.id) && interestStatuses[conn.id] !== 'mutual') {
                        setShowCelebration(conn);
                        setInterestStatuses(prevStatuses => ({
                            ...prevStatuses,
                            [conn.id]: 'mutual'
                        }));
                    }
                }
                return newConns;
            });
        } catch (err) {
            console.error('Failed to fetch connections:', err);
        }
    }, [interestsSent, interestStatuses]);


    // ─── Conversations (API-driven) ────────────────────────────────────

    const fetchConversations = useCallback(async () => {
        if (!api.isConfigured) return;
        try {
            const data = await api.getConversations();
            const conversationsList = Array.isArray(data) ? data : [];
            setConversations(conversationsList);

            // Fetch messages for each conversation to populate the chats state
            for (const conv of conversationsList) {
                try {
                    const messages = await api.getMessages(conv.id);
                    if (Array.isArray(messages)) {
                        const mapped = messages.map(m => ({
                            id: m.id,
                            sender: m.senderId === conv.partnerId ? 'partner' : 'user',
                            text: m.text,
                            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        })).reverse();

                        setChats(prev => ({
                            ...prev,
                            [conv.partnerId]: mapped
                        }));
                    }
                } catch (msgErr) {
                    console.error(`Failed to fetch messages for conv ${conv.id}:`, msgErr);
                }
            }
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
    }, []);


    // ─── Load social data (discover, connections, conversations) ───────

    const loadSocialData = useCallback(async () => {
        try {
            await Promise.all([
                fetchDiscoverProfiles(),
                fetchConnections(),
                fetchConversations()
            ]);
        } catch (err) {
            console.error('Error loading social data:', err);
        }
    }, []);


    // ─── Persistence for UI-only settings ──────────────────────────────

    useEffect(() => {
        localStorage.setItem('vh-saved-profiles', JSON.stringify(savedProfiles));
    }, [savedProfiles]);

    useEffect(() => {
        localStorage.setItem('vh-support-tickets', JSON.stringify(supportTickets));
    }, [supportTickets]);

    // --- Dynamic System theme listener & Theme applier ---
    useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('vh-theme', theme);

        const applyTheme = (currentTheme) => {
            root.setAttribute('data-theme', currentTheme);
            setResolvedTheme(currentTheme);
        };

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches ? 'dark' : 'light');

            const handleMediaChange = (e) => {
                applyTheme(e.matches ? 'dark' : 'light');
            };

            mediaQuery.addEventListener('change', handleMediaChange);
            return () => mediaQuery.removeEventListener('change', handleMediaChange);
        } else {
            applyTheme(theme);
        }
    }, [theme]);

    // --- Accessibility Applier ---
    useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('vh-accessibility', JSON.stringify(accessibility));

        // High Contrast class
        if (accessibility.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Text Scale size
        const scale = accessibility.textSize === 'small' ? 0.9 : accessibility.textSize === 'large' ? 1.15 : 1.0;
        root.style.setProperty('--font-size-adjust', scale.toString());

        // Reduce Motion class
        if (accessibility.reduceMotion) {
            root.classList.add('reduce-motion');
        } else {
            root.classList.remove('reduce-motion');
        }
    }, [accessibility]);

    // --- Persistence for Notifications ---
    useEffect(() => {
        localStorage.setItem('vh-notifications', JSON.stringify(notifications));
    }, [notifications]);

    // --- WebSocket Connection & Real-Time Message Receipt ---
    const conversationsRef = useRef(conversations);
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    useEffect(() => {
        if (isLoggedIn && isOnboarded && approvalStatus === 'approved') {
          const token = api.tokenStore.getToken();
            if (token) {
                const socket = connectSocket(token);

                socket.on('new_message', ({ conversationId, message }) => {
                    const conv = conversationsRef.current.find(c => c.id === conversationId);
                    if (conv) {
                        setChats(prevChats => {
                            const current = prevChats[conv.partnerId] || [];
                            
                            // Find if there is an optimistic message with the same text to replace
                            let optIndex = -1;
                            for (let i = current.length - 1; i >= 0; i--) {
                                if (current[i].id.toString().includes('-') && current[i].text === message.text) {
                                    optIndex = i;
                                    break;
                                }
                            }

                            if (optIndex !== -1) {
                                const updated = [...current];
                                updated[optIndex] = {
                                    id: message.id,
                                    sender: message.senderId === conv.partnerId ? 'partner' : 'user',
                                    text: message.text,
                                    timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                };
                                return {
                                    ...prevChats,
                                    [conv.partnerId]: updated
                                };
                            }

                            // Otherwise, check for duplicate and append
                            if (current.some(m => m.id === message.id)) {
                                return prevChats;
                            }

                            const formatted = {
                                id: message.id,
                                sender: message.senderId === conv.partnerId ? 'partner' : 'user',
                                text: message.text,
                                timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };
                            
                            return {
                                ...prevChats,
                                [conv.partnerId]: [...current, formatted]
                            };
                        });
                    }
                });

                return () => {
                    disconnectSocket();
                };
            }
        } else {
            disconnectSocket();
        }
    }, [isLoggedIn, isOnboarded, approvalStatus]);

 // ─── Session Restoration on Mount ──────────────────────────────────

useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
            api.tokenStore.clear();
            setIsLoggedIn(false);
            setAuthLoading(false);
            return;
        }

        try {
            const firebaseIdToken = await firebaseUser.getIdToken();

            api.tokenStore.setToken(firebaseIdToken);

            const profileData = await api.getMe();

            hydrateFromProfile(profileData);

            setIsLoggedIn(true);

            const status = normalizeApprovalStatus(
                profileData?.user?.approvalStatus ||
                profileData?.approvalStatus
            );

            if (status === 'approved') {
                loadSocialData();
            }
        } catch (err) {
            console.error(err);

            api.tokenStore.clear();

            setIsLoggedIn(false);
        } finally {
            setAuthLoading(false);
        }
    });

    return () => unsubscribe();
}, []);

    // Set up periodic polling for connections
    useEffect(() => {
        if (isLoggedIn && isOnboarded && approvalStatus === 'approved') {
            fetchConnections();
            fetchConversations();

            const intervalId = setInterval(() => {
                fetchConnections();
            }, 10000);

            return () => clearInterval(intervalId);
        }
    }, [isLoggedIn, isOnboarded, approvalStatus, fetchConnections, fetchConversations]);




    // Refetch when filters change (only when logged in & approved)
    useEffect(() => {
        if (isLoggedIn && isOnboarded && approvalStatus === 'approved') {
            fetchDiscoverProfiles();
        }
    }, [filters, isLoggedIn, isOnboarded, approvalStatus, fetchDiscoverProfiles]);


    // ─── Actions ───────────────────────────────────────────────────────

    const login = async (phoneNumber) => {
        if (!api.isConfigured) {
            // Fallback for when backend is not running
            setPhone(phoneNumber);
            setIsLoggedIn(true);
            return;
        }

        const firebaseIdToken = await auth.currentUser.getIdToken();
        const data = await api.login(firebaseIdToken);

        // Store the Firebase ID token
        api.tokenStore.setToken(firebaseIdToken);

        // Set auth state
        setPhone(data.user.phoneNumber);
        setIsLoggedIn(true);
        setApprovalStatus(normalizeApprovalStatus(data.user.approvalStatus));
        setUserRole(data.user.role || 'USER');
        setIsOnboarded(data.user.isOnboarded || false);

        // If user is already onboarded and approved, load their profile and social data
        if (data.user.isOnboarded) {
            try {
                const profileData = await api.getMe();
                hydrateFromProfile(profileData);
            } catch {
                // Profile fetch failed — user can still proceed
            }
        }

        if (data.user.isOnboarded && data.user.approvalStatus !== 'PENDING') {
            loadSocialData();
        }
    };

    const loginWithGoogle = async (googleToken) => {
        if (!api.isConfigured) {
            // Fallback for mock mode
            setPhone("+919999988888");
            setIsLoggedIn(true);
            setApprovalStatus('pending');
            setIsOnboarded(false);
            return;
        }

        // Google sign-in is now handled via Firebase itself (signInWithPopup/
        // signInWithRedirect elsewhere); the passed-in googleToken is no longer
        // used since the backend only accepts a Firebase ID token.
        const firebaseIdToken = await auth.currentUser.getIdToken();
        const data = await api.login(firebaseIdToken);

        // Store the Firebase ID token
        api.tokenStore.setToken(firebaseIdToken);

        // Set auth state
        setPhone(data.user.phoneNumber);
        setIsLoggedIn(true);
        setApprovalStatus(normalizeApprovalStatus(data.user.approvalStatus));
        setUserRole(data.user.role || 'USER');
        setIsOnboarded(data.user.isOnboarded || false);

        // If user is already onboarded, load their profile and social data
        if (data.user.isOnboarded) {
            try {
                const profileData = await api.getMe();
                hydrateFromProfile(profileData);
            } catch {
                // Profile fetch failed — user can still proceed
            }
        }

        if (data.user.isOnboarded && normalizeApprovalStatus(data.user.approvalStatus) === 'approved') {
            loadSocialData();
        }
    };

    const registerWithGoogle = async (phoneNumber, googleToken) => {
        if (!api.isConfigured) {
            // Fallback for mock mode
            setPhone(phoneNumber);
            setIsLoggedIn(true);
            setApprovalStatus('pending');
            setIsOnboarded(false);
            return;
        }

        // Registration is now handled by the same Firebase-backed login
        // endpoint; the backend upserts the user from the Firebase ID token.
        // The passed-in googleToken is no longer used.
        const firebaseIdToken = await auth.currentUser.getIdToken();
        const data = await api.login(firebaseIdToken);

        // Store the Firebase ID token
        api.tokenStore.setToken(firebaseIdToken);

        // Set auth state
        setPhone(data.user.phoneNumber || phoneNumber);
        setIsLoggedIn(true);
        setApprovalStatus(normalizeApprovalStatus(data.user.approvalStatus));
        setUserRole(data.user.role || 'USER');
        setIsOnboarded(data.user.isOnboarded || false);
    };

    const completeOnboarding = async (profileData) => {
        if (!api.isConfigured) {
            setUserProfile(profileData);
            setIsOnboarded(true);
            setActiveTab('discover');
            return;
        }

        try {
            const saved = await api.saveProfile(profileData);
            setUserProfile(profileData);
            setIsOnboarded(true);
            setActiveTab('discover');

            // After onboarding, if already approved, load social data
            if (approvalStatus === 'approved') {
                loadSocialData();
            }
        } catch (err) {
            console.error('Failed to save profile:', err);
            throw err; // Let the caller handle the error
        }
    };

    const sendInterest = async (profileId) => {
        if (interestsSent.includes(profileId)) return;

        // Optimistic: mark as sent
        setInterestsSent(prev => [...prev, profileId]);
        setInterestStatuses(prev => ({ ...prev, [profileId]: 'sent' }));

        try {
            const data = await api.likeProfile(profileId);

            if (data.match) {
                // It's a mutual match!
                setInterestStatuses(prev => ({ ...prev, [profileId]: 'mutual' }));

                // Add to connections
                const matchedProfile = profiles.find(p => p.id === profileId);
                if (matchedProfile) {
                    setConnections(prev => {
                        const ids = prev.map(c => c.id || c);
                        if (!ids.includes(profileId)) {
                            return [...prev, matchedProfile];
                        }
                        return prev;
                    });
                    setShowCelebration(matchedProfile);
                }

                // Refresh connections from server
                fetchConnections();
                fetchConversations();
            } else {
                setInterestStatuses(prev => ({ ...prev, [profileId]: 'sent' }));
            }
        } catch (err) {
            // Rollback on failure
            setInterestsSent(prev => prev.filter(id => id !== profileId));
            setInterestStatuses(prev => {
                const next = { ...prev };
                delete next[profileId];
                return next;
            });
            console.error('Failed to send interest:', err);
        }
    };

    const toggleSaveProfile = (profileId) => {
        setSavedProfiles(prev => {
            if (prev.includes(profileId)) {
                return prev.filter(id => id !== profileId);
            } else {
                return [...prev, profileId];
            }
        });
    };

    const unmatchConnection = async (matchId, profileId) => {
        // Optimistic local cleanup — soft removal only, unlike blockUser
        setConnections(prev => prev.filter(c => (c.id || c) !== profileId));
        setInterestsSent(prev => prev.filter(id => id !== profileId));
        setInterestStatuses(prev => {
            const next = { ...prev };
            delete next[profileId];
            return next;
        });

        try {
            await api.unmatch(matchId);
            // Refresh data after unmatch
            fetchConnections();
            fetchConversations();
        } catch (err) {
            console.error('Failed to unmatch:', err);
            // Roll back optimistic removal on failure by re-syncing from server
            fetchConnections();
        }
    };

    const blockUser = async (profileId) => {
        // Optimistic local cleanup
        setSavedProfiles(prev => prev.filter(id => id !== profileId));
        setConnections(prev => prev.filter(c => (c.id || c) !== profileId));
        setInterestsSent(prev => prev.filter(id => id !== profileId));
        setInterestStatuses(prev => {
            const next = { ...prev };
            delete next[profileId];
            return next;
        });
        setBlockedUsers(prev => {
            if (!prev.includes(profileId)) {
                return [...prev, profileId];
            }
            return prev;
        });

        try {
            await api.blockUser(profileId);
            // Refresh data after block
            fetchConnections();
            fetchConversations();
        } catch (err) {
            console.error('Failed to block user:', err);
        }
    };

    const unblockUser = (profileId) => {
        setBlockedUsers(prev => prev.filter(id => id !== profileId));
        // Note: No unblock backend endpoint exists in routes currently
        // The UI state is updated optimistically
    };

    const reportUser = async (profileId, reason, comment) => {
        const ticket = {
            id: `report-${Date.now()}`,
            profileId,
            reason,
            comment,
            date: new Date().toLocaleDateString()
        };
        setReportedUsers(prev => [...prev, ticket]);

        try {
            await api.reportUser(profileId, reason, comment);
            // Report auto-blocks on the backend, sync locally
            blockUser(profileId);
        } catch (err) {
            console.error('Failed to report user:', err);
            // Still block locally even if API fails
            blockUser(profileId);
        }
    };

    const submitSupportTicket = (name, email, subject, text) => {
        const ticket = {
            id: `support-${Date.now()}`,
            name,
            email,
            subject,
            text,
            status: 'Open',
            date: new Date().toLocaleDateString()
        };
        setSupportTickets(prev => [...prev, ticket]);
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Always clear local state regardless of signOut success
            api.tokenStore.clear();

            setIsLoggedIn(false);
            setPhone('');
            setIsOnboarded(false);
            setOnboardingStep(1);
            setApprovalStatus('pending');
            setUserRole('USER');
            setUserProfile({
                name: '',
                dobDay: '',
                dobMonth: '',
                dobYear: '',
                city: '',
                gender: 'Woman',
                showGender: true,
                orientation: 'Straight',
                showOrientation: true,
                relationshipIntent: 'Long-term Relationship',
                relationshipStatus: 'Single',
                interests: [],
                story: '',
                hasDisability: false,
                disabilityInfo: '',
                showDisability: false,
                photos: []
            });
            setInterestsSent([]);
            setInterestStatuses({});
            setConnections([]);
            setSavedProfiles([]);
            setBlockedUsers([]);
            setReportedUsers([]);
            setSupportTickets([]);
            setChats({});
            setConversations([]);
            setProfiles([]);
            setActiveTab('discover');

            // Clear persisted UI data
            localStorage.removeItem('vh-saved-profiles');
            localStorage.removeItem('vh-support-tickets');
        }
    };

    const sendMessage = async (profileId, text) => {
        const messageId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const newMessage = {
            id: messageId,
            sender: 'user',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Optimistic update
        setChats(prev => {
            const current = prev[profileId] || [];
            return {
                ...prev,
                [profileId]: [...current, newMessage]
            };
        });

        // Find the conversation for this profile and send via API
        if (api.isConfigured) {
            try {
                const conversation = conversations.find(c => c.partnerId === profileId);

                if (conversation) {
                    await api.sendMessage(conversation.id, text);
                }
            } catch (err) {
                console.error('Failed to send message via API:', err);
            }
        }
    };

    return (
        <AppContext.Provider value={{
            authLoading,
            isLoggedIn,
            setIsLoggedIn,
            phone,
            approvalStatus,
            setApprovalStatus,
            userRole,
            isOnboarded,
            setIsOnboarded,
            onboardingStep,
            setOnboardingStep,
            userProfile,
            setUserProfile,
            profiles,
            loadingProfiles,
            errorProfiles,
            savedProfiles,
            interestsSent,
            interestStatuses,
            connections,
            setConnections,
            conversations,
            blockedUsers,
            reportedUsers,
            supportTickets,
            showCelebration,
            setShowCelebration,
            chats,
            setChats,
            activeTab,
            setActiveTab,
            filters,
            setFilters,
            theme,
            setTheme,
            resolvedTheme,
            accessibility,
            setAccessibility,
            notifications,
            setNotifications,
            login,
            loginWithGoogle,
            registerWithGoogle,
            completeOnboarding,
            sendInterest,
            toggleSaveProfile,
            unmatchConnection,
            blockUser,
            unblockUser,
            reportUser,
            submitSupportTicket,
            sendMessage,
            logout,
            fetchDiscoverProfiles,
            fetchConnections,
            fetchConversations,
            loadSocialData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
};