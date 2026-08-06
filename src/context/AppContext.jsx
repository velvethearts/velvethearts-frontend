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
import { connectSocket, disconnectSocket, emitMarkSeen } from '../lib/socket';
import { ConfirmModal } from '../components/UI/ConfirmModal';
const AppContext = createContext();
const CHAT_CLEARS_STORAGE_KEY = 'vh-cleared-chats';

const getStoredChatClears = () => {
    try {
        return JSON.parse(localStorage.getItem(CHAT_CLEARS_STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
};

const setStoredChatClear = (...ids) => {
    const clears = getStoredChatClears();
    const now = new Date().toISOString();
    ids.forEach(id => {
        if (id) clears[id] = now;
    });
    localStorage.setItem(CHAT_CLEARS_STORAGE_KEY, JSON.stringify(clears));
};

const removeStoredChatClear = (profileId) => {
    const clears = getStoredChatClears();
    delete clears[profileId];
    localStorage.setItem(CHAT_CLEARS_STORAGE_KEY, JSON.stringify(clears));
};

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

    const notificationsRef = useRef(notifications);
    useEffect(() => {
        notificationsRef.current = notifications;
        try {
            localStorage.setItem('vh-notifications', JSON.stringify(notifications));
        } catch (e) { }
    }, [notifications]);

    useEffect(() => {
        try {
            localStorage.setItem('vh-accessibility', JSON.stringify(accessibility));
        } catch (e) { }
    }, [accessibility]);

    const updateNotificationSettings = useCallback(async (newNotifs) => {
        setNotifications(newNotifs);
        notificationsRef.current = newNotifs;
        try {
            localStorage.setItem('vh-notifications', JSON.stringify(newNotifs));
        } catch (e) { }
        if (api.isConfigured && api.tokenStore.getToken()) {
            try {
                await api.updateSettings(newNotifs);
            } catch (err) {
                console.warn('Failed to sync notification settings to backend:', err);
            }
        }
    }, []);

    const updateAccessibilitySettings = useCallback(async (newAccess) => {
        setAccessibility(newAccess);
        try {
            localStorage.setItem('vh-accessibility', JSON.stringify(newAccess));
        } catch (e) { }
        if (api.isConfigured && api.tokenStore.getToken()) {
            try {
                await api.updateSettings(newAccess);
            } catch (err) {
                console.warn('Failed to sync accessibility settings to backend:', err);
            }
        }
    }, []);

    // --- Notification Inbox ---
    const [notificationItems, setNotificationItems] = useState([]); // recent notifications (server-side model)
    const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
    const [deepLinkConversationId, setDeepLinkConversationId] = useState(null); // used to deep-link into chat from a notification

    // --- Global Confirm & Alert Dialog state ---
    const [dialogConfig, setDialogConfig] = useState(null);

    const showConfirm = useCallback((opts) => {
        return new Promise((resolve) => {
            const config = typeof opts === 'string' ? { message: opts } : opts;
            setDialogConfig({
                title: config.title || 'Confirm Action',
                message: config.message || '',
                okText: config.okText || 'OK',
                cancelText: config.cancelText || 'Cancel',
                variant: config.variant || 'primary',
                showCancel: config.showCancel !== false,
                onConfirm: () => {
                    setDialogConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setDialogConfig(null);
                    resolve(false);
                }
            });
        });
    }, []);

    const showAlert = useCallback((opts) => {
        return new Promise((resolve) => {
            const config = typeof opts === 'string' ? { message: opts } : opts;
            setDialogConfig({
                title: config.title || 'Notice',
                message: config.message || '',
                okText: config.okText || 'OK',
                cancelText: config.cancelText || 'Cancel',
                showCancel: config.showCancel ?? true,
                onConfirm: () => {
                    setDialogConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setDialogConfig(null);
                    resolve(false);
                }
            });
        });
    }, []);

    // Intercept native browser alert and confirm calls as a global safety net
    useEffect(() => {
        window.alert = (msg) => {
            showAlert({ title: 'Notice', message: String(msg) });
        };
        window.confirm = (msg) => {
            showConfirm({ title: 'Confirmation', message: String(msg) });
            return true;
        };
    }, [showAlert, showConfirm]);


    // --- Auth & Onboarding ---
    const [authLoading, setAuthLoading] = useState(true); // true until session restoration completes
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [phone, setPhone] = useState('');
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [userRole, setUserRole] = useState('USER');
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [userProfile, setUserProfile] = useState(() => {
        try {
            const saved = localStorage.getItem('vh-user-profile');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return {
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
        };
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

    const [savedProfileDetails, setSavedProfileDetails] = useState(() => {
        try {
            const saved = localStorage.getItem('vh-saved-profile-details');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return {};
    });

    const [interestsSent, setInterestsSent] = useState([]);
    const [interestStatuses, setInterestStatuses] = useState({});

    const [connections, setConnections] = useState([]);
    const [receivedInvites, setReceivedInvites] = useState([]);
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
    const [onlineUserIds, setOnlineUserIds] = useState(new Set());

    // UI state
    const [activeTab, setActiveTabState] = useState(() => {
        return sessionStorage.getItem('vh-active-tab') || 'discover';
    });

    const setActiveTab = useCallback((tab) => {
        sessionStorage.setItem('vh-active-tab', tab);
        setActiveTabState(tab);
    }, []);

    const [toastNotifications, setToastNotifications] = useState([]);

    const addToast = useCallback((toast) => {
        const id = Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        const newToast = { id, ...toast };
        setToastNotifications(prev => [newToast, ...prev].slice(0, 3));

        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) { }

        setTimeout(() => {
            setToastNotifications(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToastNotifications(prev => prev.filter(t => t.id !== id));
    }, []);

    const [filters, setFilters] = useState({
        gender: 'All',
        relationshipIntent: 'All',
        city: '',
        ageMin: 18,
        ageMax: 60,
        distanceMax: 50
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
                id: profile.id || prev.id || '',
                userId: profile.userId || user.id || prev.userId || '',
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

    const fetchReceivedInvites = useCallback(async () => {
        if (!api.isConfigured) return;
        try {
            const data = await api.getReceivedInvites();
            setReceivedInvites(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch received invites:', err);
        }
    }, []);


    // ─── Conversations (API-driven) ────────────────────────────────────

    const fetchConversations = useCallback(async () => {
        if (!api.isConfigured) return;
        try {
            const data = await api.getConversations();
            const conversationsList = Array.isArray(data) ? data : [];
            const chatClears = getStoredChatClears();
            const visibleConversations = conversationsList.filter(conv => {
                const clearedAt = chatClears[conv.partnerId];
                if (!clearedAt) return true;

                return conv.lastMessageTime && new Date(conv.lastMessageTime) > new Date(clearedAt);
            });
            setConversations(visibleConversations);

            // Fetch messages for each conversation concurrently to prevent sequential network bottlenecks
            await Promise.all(visibleConversations.map(async (conv) => {
                try {
                    const messages = await api.getMessages(conv.id);
                    if (Array.isArray(messages)) {
                        const clearedAt = chatClears[conv.partnerId] || chatClears[conv.id];
                        const visibleMessages = messages.filter(m => {
                            if (m.isDeleted) return false;
                            if (clearedAt && new Date(m.createdAt) <= new Date(clearedAt)) return false;
                            return true;
                        });

                        const mapped = visibleMessages.map(m => ({
                            id: m.id,
                            sender: m.senderId === conv.partnerId ? 'partner' : 'user',
                            text: m.text,
                            attachments: m.attachments || [],
                            isEdited: Boolean(m.isEdited),
                            isDeleted: Boolean(m.isDeleted),
                            seen: Boolean(m.seen),
                            createdAt: m.createdAt,
                            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        })).reverse();

                        setChats(prev => {
                            const existing = prev[conv.partnerId] || prev[conv.id] || [];
                            const fetchedIds = new Set(mapped.map(m => m.id));
                            const pendingOptimistic = existing.filter(
                                m => !fetchedIds.has(m.id) && typeof m.id === 'string' && m.id.includes('-') && !m.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
                            );
                            const merged = [...mapped, ...pendingOptimistic];
                            return {
                                ...prev,
                                [conv.partnerId]: merged,
                                [conv.id]: merged
                            };
                        });
                    }
                } catch (msgErr) {
                    console.error(`Failed to fetch messages for conv ${conv.id}:`, msgErr);
                }
            }));
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        }
    }, []);

    // Fetches messages for a single conversation and hydrates chats state.
    // Called by ChatView when a conversation becomes active (on mount or ID change).
    // Merges with existing state so optimistic/in-flight messages are preserved.
    const fetchConversationMessages = useCallback(async (conversationId, partnerId) => {
        if (!api.isConfigured || !conversationId) return;
        try {
            const messages = await api.getMessages(conversationId);
            if (!Array.isArray(messages)) return;
            const chatClears = getStoredChatClears();
            const clearedAt = chatClears[partnerId] || chatClears[conversationId];
            const visible = messages.filter(m => {
                if (m.isDeleted) return false;
                if (clearedAt && new Date(m.createdAt) <= new Date(clearedAt)) return false;
                return true;
            });
            const fetchedMapped = visible.map(m => ({
                id: m.id,
                sender: m.senderId === partnerId ? 'partner' : 'user',
                text: m.text,
                attachments: m.attachments || [],
                isEdited: Boolean(m.isEdited),
                isDeleted: Boolean(m.isDeleted),
                seen: Boolean(m.seen),
                createdAt: m.createdAt,
                timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })).reverse();

            // Merge: keep any optimistic (temp-ID) messages that are NOT yet confirmed in DB,
            // so an in-flight send is never wiped by a concurrent fetch.
            setChats(prev => {
                const existing = prev[conversationId] || prev[partnerId] || [];
                const fetchedIds = new Set(fetchedMapped.map(m => m.id));
                // Optimistic messages have temp IDs (e.g. "1722774827000-abc"); keep them
                const pendingOptimistic = existing.filter(
                    m => !fetchedIds.has(m.id) && typeof m.id === 'string' && m.id.includes('-') && !m.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
                );
                const merged = [...fetchedMapped, ...pendingOptimistic];
                return {
                    ...prev,
                    [conversationId]: merged,
                    ...(partnerId ? { [partnerId]: merged } : {})
                };
            });
        } catch (err) {
            console.error(`Failed to fetch messages for conversation ${conversationId}:`, err);
        }
    }, []);

    const fetchBlockedUsers = useCallback(async () => {
        if (!api.isConfigured) return;
        try {
            const res = await api.getBlockedUsers();
            const list = res?.data || res || [];
            setBlockedUsers(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Failed to fetch blocked users:', err);
        }
    }, []);

    // ─── Load social data (discover, connections, conversations) ───────

    const loadSocialData = useCallback(async () => {
        try {
            await Promise.all([
                fetchDiscoverProfiles(),
                fetchConnections(),
                fetchConversations(),
                fetchReceivedInvites(),
                fetchBlockedUsers()
            ]);
        } catch (err) {
            console.error('Error loading social data:', err);
        }
    }, [fetchDiscoverProfiles, fetchConnections, fetchConversations, fetchReceivedInvites, fetchBlockedUsers]);


    // ─── Persistence for UI-only settings ──────────────────────────────

    useEffect(() => {
        localStorage.setItem('vh-saved-profiles', JSON.stringify(savedProfiles));
    }, [savedProfiles]);

    useEffect(() => {
        localStorage.setItem('vh-user-profile', JSON.stringify(userProfile));
    }, [userProfile]);

    useEffect(() => {
        localStorage.setItem('vh-saved-profile-details', JSON.stringify(savedProfileDetails));
    }, [savedProfileDetails]);

    const savedProfileObjects = savedProfiles.map(id => {
        return savedProfileDetails[id] || profiles.find(p => p.id === id) || connections.find(c => c.id === id || c.userId === id) || null;
    }).filter(Boolean);

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

    const connectionsRef = useRef(connections);
    useEffect(() => {
        connectionsRef.current = connections;
    }, [connections]);

    // Track the current user's userId for socket message identification
    const currentUserIdRef = useRef(userProfile.userId || userProfile.id || '');
    useEffect(() => {
        currentUserIdRef.current = userProfile.userId || userProfile.id || '';
    }, [userProfile.userId, userProfile.id]);

    useEffect(() => {
        if (isLoggedIn && isOnboarded && approvalStatus === 'approved') {
          const token = api.tokenStore.getToken();
            if (token) {
                const socket = connectSocket(token);

                socket.on('new_message', ({ conversationId, message }) => {
                    if (!message) return;

                    const conv = conversationsRef.current.find(c => c.id === conversationId);
                    const myUserId = currentUserIdRef.current;
                    const isMySentMessage = message.senderId === myUserId;

                    const partnerConn = connectionsRef.current.find(c => 
                        c.id === message.senderId || 
                        c.userId === message.senderId || 
                        (conv && (c.id === conv.partnerId || c.userId === conv.partnerId))
                    );

                    // Resolve partnerId: if message is from me, look up partner from conversation; otherwise sender is partner
                    let partnerId;
                    if (conv) {
                        partnerId = conv.partnerId;
                    } else if (!isMySentMessage) {
                        partnerId = partnerConn?.id || partnerConn?.userId || message.senderId;
                    } else {
                        // Own message echo without a known conversation — find partner from connections
                        partnerId = partnerConn?.id || partnerConn?.userId || null;
                    }

                    if (partnerId) {
                        const isFromPartner = !isMySentMessage;

                        const formatted = {
                            id: message.id,
                            sender: isFromPartner ? 'partner' : 'user',
                            text: message.text || '',
                            attachments: message.attachments || [],
                            isEdited: Boolean(message.isEdited),
                            isDeleted: Boolean(message.isDeleted),
                            seen: Boolean(message.seen),
                            createdAt: message.createdAt || new Date().toISOString(),
                            timestamp: new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };

                        setChats(prevChats => {
                            const current = prevChats[partnerId] || prevChats[conversationId] || (partnerConn?.id ? prevChats[partnerConn.id] : []) || [];
                            let optIndex = -1;
                            for (let i = current.length - 1; i >= 0; i--) {
                                const item = current[i];
                                if (
                                    item.id === message.id ||
                                    (typeof item.id === 'string' && item.id.includes('-') && (
                                        (message.text && item.text === message.text) ||
                                        (Array.isArray(message.attachments) && message.attachments.length > 0)
                                    ))
                                ) {
                                    optIndex = i;
                                    break;
                                }
                            }

                            let updated;
                            if (optIndex !== -1) {
                                updated = [...current];
                                updated[optIndex] = formatted;
                            } else if (!current.some(m => m.id === message.id)) {
                                updated = [...current, formatted];
                            } else {
                                updated = current;
                            }

                            return {
                                ...prevChats,
                                [partnerId]: updated,
                                ...(conversationId ? { [conversationId]: updated } : {}),
                                ...(partnerConn?.id ? { [partnerConn.id]: updated } : {})
                            };
                        });

                        // Update conversation preview and unread count in conversations state
                        setConversations(prevConvs => {
                            const exists = prevConvs.some(c => c.id === conversationId || c.partnerId === partnerId);
                            if (exists) {
                                return prevConvs.map(c => {
                                    if (c.id === conversationId || c.partnerId === partnerId) {
                                        const isPartnerSender = message.senderId === c.partnerId;
                                        return {
                                            ...c,
                                            lastMessage: message.isDeleted ? 'Message deleted' : (message.text || 'Sent an attachment'),
                                            lastMessageTime: message.createdAt || new Date().toISOString(),
                                            unreadCount: isPartnerSender ? (c.unreadCount || 0) + 1 : (c.unreadCount || 0)
                                        };
                                    }
                                    return c;
                                });
                            } else {
                                fetchConversations();
                                return prevConvs;
                            }
                        });

                        // Trigger Toast notification if message is from partner and user is not actively chatting with them
                        if (isFromPartner) {
                            const activeTabCur = sessionStorage.getItem('vh-active-tab');
                            const activeChatCur = sessionStorage.getItem('vh-active-chat-id');
                            const isCurrentlyChatting = activeTabCur === 'chat' && activeChatCur === partnerId;

                            if (!isCurrentlyChatting && notificationsRef.current?.chatNotifs !== false) {
                                addToast({
                                    partnerId,
                                    conversationId,
                                    title: partnerConn ? partnerConn.name : 'New Message',
                                    message: message.text || 'Sent an attachment',
                                    photo: partnerConn?.photo || ''
                                });
                            }
                        }
                    }
                });

                socket.on('messages_seen', ({ conversationId, readerId, seenAt }) => {
                    const myUserId = currentUserIdRef.current;
                    if (readerId === myUserId) return;

                    const conv = conversationsRef.current.find(c => c.id === conversationId);
                    const partnerId = conv?.partnerId;
                    const cutoffTime = new Date(seenAt || Date.now()).getTime();

                    setChats(prevChats => {
                        const targetKeys = [partnerId, conversationId].filter(Boolean);
                        if (targetKeys.length === 0) return prevChats;

                        const nextChats = { ...prevChats };
                        for (const key of targetKeys) {
                            if (nextChats[key]) {
                                nextChats[key] = nextChats[key].map(msg => {
                                    if (msg.sender === 'user') {
                                        const msgTime = new Date(msg.createdAt || Date.now()).getTime();
                                        if (!msg.seen && (isNaN(msgTime) || msgTime <= cutoffTime)) {
                                            return { ...msg, seen: true, seenAt };
                                        }
                                    }
                                    return msg;
                                });
                            }
                        }
                        return nextChats;
                    });
                });

                socket.on('message_deleted', ({ conversationId, messageId }) => {
                    const conv = conversationsRef.current.find(c => c.id === conversationId);
                    if (!conv) return;

                    setChats(prevChats => ({
                        ...prevChats,
                        [conv.partnerId]: (prevChats[conv.partnerId] || []).map(message =>
                            message.id === messageId
                                ? { ...message, text: 'This message was deleted', isDeleted: true, attachments: [] }
                                : message
                        )
                    }));
                });

                socket.on('message_edited', ({ conversationId, messageId, text, isEdited }) => {
                    const conv = conversationsRef.current.find(c => c.id === conversationId);
                    const partnerId = conv?.partnerId;

                    setChats(prevChats => {
                        const targetKeys = [partnerId, conversationId].filter(Boolean);
                        if (targetKeys.length === 0) return prevChats;

                        const next = { ...prevChats };
                        for (const key of targetKeys) {
                            if (next[key]) {
                                next[key] = next[key].map(msg =>
                                    msg.id === messageId
                                        ? { ...msg, text, isEdited: Boolean(isEdited ?? true) }
                                        : msg
                                );
                            }
                        }
                        return next;
                    });

                    setConversations(prevConvs =>
                        prevConvs.map(c => {
                            if (c.id === conversationId || c.partnerId === partnerId) {
                                return {
                                    ...c,
                                    lastMessage: text
                                };
                            }
                            return c;
                        })
                    );
                });

                socket.on('conversation_cleared', ({ conversationId }) => {
                    const conv = conversationsRef.current.find(c => c.id === conversationId);
                    if (!conv) return;

                    setStoredChatClear(conv.partnerId);
                    setChats(prevChats => {
                        const next = { ...prevChats };
                        delete next[conv.partnerId];
                        return next;
                    });
                    setConversations(prevConversations =>
                        prevConversations.filter(conversation => conversation.id !== conversationId)
                    );
                });

                socket.on('online_users', (userIds) => {
                    if (Array.isArray(userIds)) {
                        setOnlineUserIds(new Set(userIds));
                    }
                });

                socket.on('user_presence', ({ userId, isOnline }) => {
                    if (!userId) return;
                    setOnlineUserIds(prev => {
                        const next = new Set(prev);
                        if (isOnline) {
                            next.add(userId);
                        } else {
                            next.delete(userId);
                        }
                        return next;
                    });
                });

                // Fetch initial notifications inbox on connect
                try {
                    fetchNotifications();
                } catch (e) { /* ignore */ }

                // Real-time notification delivery (Likes, Matches, System)
                socket.on('notification', ({ notification }) => {
                    if (!notification || notification.type === 'MESSAGE') return;

                    // Filter incoming socket notifications based on user preferences
                    if (notification.type === 'LIKE' && notificationsRef.current?.interestNotifs === false) return;
                    if (notification.type === 'MATCH' && notificationsRef.current?.matchNotifs === false) return;

                    setNotificationItems(prev => {
                        const exists = prev.some(n => n.id === notification.id);
                        const updated = exists
                            ? prev.map(n => n.id === notification.id ? notification : n)
                            : [notification, ...prev];
                        setNotificationUnreadCount(updated.filter(n => !n.isRead).length);
                        return updated;
                    });
                });

                // When a match is created, refresh notifications to pick up server-side created rows
                socket.on('matchCreated', ({ conversationId }) => {
                    try { fetchNotifications(); } catch (e) { }
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

            try {
                await api.login(firebaseIdToken);
            } catch (loginErr) {
                console.warn('api.login during onAuthStateChanged failed:', loginErr);
            }

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
            console.error('Session restoration error:', err);

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
            fetchReceivedInvites();

            const intervalId = setInterval(() => {
                fetchConnections();
                fetchReceivedInvites();
            }, 10000);

            return () => clearInterval(intervalId);
        }
    }, [isLoggedIn, isOnboarded, approvalStatus, fetchConnections, fetchConversations, fetchReceivedInvites]);




    // Refetch when filters change (only when logged in & approved)
    useEffect(() => {
        if (isLoggedIn && isOnboarded && approvalStatus === 'approved') {
            fetchDiscoverProfiles();
        }
    }, [filters, isLoggedIn, isOnboarded, approvalStatus, fetchDiscoverProfiles]);


    // ─── Actions ───────────────────────────────────────────────────────

    // --- Notifications API / Inbox Actions ---
    const fetchNotifications = useCallback(async (page = 1, limit = 50) => {
        if (!api.isConfigured) return;
        try {
            const data = await api.getNotifications(page, limit);
            const rawList = Array.isArray(data) ? data : (data?.notifications || []);
            // Notifications page handles Likes, Matches, System updates — chat messages show counters on the Chat tab/conversations
            const list = rawList.filter(n => n.type !== 'MESSAGE');
            setNotificationItems(list);
            setNotificationUnreadCount(list.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, []);

    const markNotificationRead = useCallback(async (id) => {
        if (!api.isConfigured) return;
        try {
            await api.markNotificationRead(id);
            setNotificationItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setNotificationUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification read:', err);
        }
    }, []);

    const markAllNotificationsRead = useCallback(async () => {
        if (!api.isConfigured) return;
        try {
            await api.markAllNotificationsRead();
            setNotificationItems(prev => prev.map(n => ({ ...n, isRead: true })));
            setNotificationUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all notifications read:', err);
        }
    }, []);

    const deleteNotificationItem = useCallback(async (id) => {
        if (!api.isConfigured) return;
        try {
            await api.deleteNotification(id);
            setNotificationItems(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    }, []);


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
        setPhone(data.user.phoneNumber || phoneNumber || '');
        setIsLoggedIn(true);
        const status = normalizeApprovalStatus(data.user.approvalStatus);
        setApprovalStatus(status);
        setUserRole(data.user.role || 'USER');

        // Store userId early so socket handler can identify self
        if (data.user.id) {
            setUserProfile(prev => ({ ...prev, userId: data.user.id }));
        }

        // Fetch full profile to accurately check onboarding status and hydrate state
        let hasProfile = false;
        try {
            const profileData = await api.getMe();
            if (profileData && (profileData.name || profileData.profile?.name)) {
                hydrateFromProfile(profileData);
                hasProfile = true;
            } else {
                setIsOnboarded(false);
            }
        } catch (profileErr) {
            console.error('Failed to load profile in login:', profileErr);
            if (data.user?.profile?.name) {
                hydrateFromProfile(data.user.profile);
                hasProfile = true;
            } else {
                setIsOnboarded(false);
            }
        }

        if (hasProfile && status === 'approved') {
            loadSocialData();
        }
    };

    const loginWithGoogle = async (googleToken) => {
        return login();
    };

    const registerWithGoogle = async (phoneNumber, googleToken) => {
        return login(phoneNumber);
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

    const updateUserProfile = async (profileData) => {
        setUserProfile(profileData);
        if (api.isConfigured && api.tokenStore.getToken()) {
            try {
                const saved = await api.saveProfile(profileData);
                if (saved) {
                    hydrateFromProfile(saved);
                }
            } catch (err) {
                console.error('Failed to save profile updates:', err);
                throw err;
            }
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
                setReceivedInvites(prev => prev.filter(invite => invite.id !== profileId));

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
                fetchReceivedInvites();
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

    const toggleSaveProfile = (profileId, profileObj = null) => {
        setSavedProfiles(prev => {
            if (prev.includes(profileId)) {
                return prev.filter(id => id !== profileId);
            } else {
                return [...prev, profileId];
            }
        });

        setSavedProfileDetails(prev => {
            const next = { ...prev };
            if (next[profileId]) {
                delete next[profileId];
            } else {
                const found = profileObj || profiles.find(p => p.id === profileId) || connections.find(c => c.id === profileId || c.userId === profileId);
                if (found) {
                    next[profileId] = found;
                }
            }
            return next;
        });
    };

    const unmatchConnection = async (matchId, profileId) => {
        // Optimistic local cleanup — soft removal only, unlike blockUser
        setConnections(prev => prev.filter(c => (c.id || c) !== profileId));
        setReceivedInvites(prev => prev.filter(invite => invite.id !== profileId));
        setInterestsSent(prev => prev.filter(id => id !== profileId));
        setInterestStatuses(prev => {
            const next = { ...prev };
            delete next[profileId];
            return next;
        });
        setChats(prev => {
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
        setSavedProfileDetails(prev => {
            const next = { ...prev };
            delete next[profileId];
            return next;
        });
        setConnections(prev => prev.filter(c => (c.id || c) !== profileId));
        setReceivedInvites(prev => prev.filter(invite => invite.id !== profileId));
        setInterestsSent(prev => prev.filter(id => id !== profileId));
        setInterestStatuses(prev => {
            const next = { ...prev };
            delete next[profileId];
            return next;
        });
        setChats(prev => {
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
            fetchBlockedUsers();
            fetchDiscoverProfiles();
        } catch (err) {
            console.error('Failed to block user:', err);
        }
    };

    const unblockUser = async (profileId) => {
        setBlockedUsers(prev => prev.filter(item => {
            const id = typeof item === 'string' ? item : (item.blockedUserId || item.id);
            return id !== profileId;
        }));

        try {
            await api.unblockUser(profileId);
            fetchBlockedUsers();
            fetchDiscoverProfiles();
            fetchConnections();
            fetchConversations();
        } catch (err) {
            console.error('Failed to unblock user:', err);
        }
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
            setReceivedInvites([]);
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

    const sendMessage = async (profileId, text, attachments = [], attachmentsForOptimistic = null) => {
        const messageId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        // For the optimistic message shown immediately to the sender, prefer
        // attachmentsForOptimistic (which may contain localPreview for the
        // thumbnail) but fall back to attachments.
        // The API always receives the clean `attachments` array (Cloudinary
        // URLs only, no blob: URLs or client-only fields).
        const optimisticAttachments = attachmentsForOptimistic || attachments || [];
        const newMessage = {
            id: messageId,
            sender: 'user',
            text: text || '',
            attachments: optimisticAttachments,
            isDeleted: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Optimistic update
        setChats(prev => {
            const current = prev[profileId] || [];
            const nextList = [...current, newMessage];
            return {
                ...prev,
                [profileId]: nextList
            };
        });

        // Find the conversation for this profile and send via API
        if (api.isConfigured) {
            try {
                let conversation = conversations.find(c => 
                    c.partnerId === profileId || 
                    c.id === profileId || 
                    c.matchId === profileId
                );

                if (!conversation) {
                    const freshConvs = await api.getConversations();
                    const list = Array.isArray(freshConvs) ? freshConvs : [];
                    setConversations(list);
                    conversation = list.find(c => 
                        c.partnerId === profileId || 
                        c.id === profileId || 
                        c.matchId === profileId
                    );
                }

                const targetId = conversation?.id || profileId;

                // Update optimistic message key under conversation ID & partner ID as well
                setChats(prev => {
                    const current = prev[profileId] || (conversation?.partnerId ? prev[conversation.partnerId] : []) || (conversation?.id ? prev[conversation.id] : []) || [];
                    const hasMsg = current.some(m => m.id === messageId);
                    const nextList = hasMsg ? current : [...current, newMessage];
                    return {
                        ...prev,
                        [profileId]: nextList,
                        ...(conversation?.partnerId ? { [conversation.partnerId]: nextList } : {}),
                        ...(conversation?.id ? { [conversation.id]: nextList } : {})
                    };
                });

                const res = await api.sendMessage(targetId, text, attachments);
                // api.js already unwraps payload.data, so res IS the message object
                const sentMsg = res;

                if (sentMsg && sentMsg.id) {
                    // Defer blob URL revocation to avoid revoking a URL that is still
                    // actively displayed in the optimistic message bubble
                    const prevOptimistic = optimisticAttachments;
                    setTimeout(() => {
                        prevOptimistic.forEach(att => {
                            if (att.localPreview && att.localPreview.startsWith('blob:')) {
                                try { URL.revokeObjectURL(att.localPreview); } catch (_) {}
                            }
                        });
                    }, 5000);

                    const resolvedConvId = sentMsg.conversationId || conversation?.id || profileId;

                    setChats(prev => {
                        const current = prev[profileId] || prev[resolvedConvId] || (conversation?.partnerId ? prev[conversation.partnerId] : []) || [];
                        const updated = current.map(m =>
                            m.id === messageId
                                ? {
                                    id: sentMsg.id,
                                    sender: 'user',
                                    text: sentMsg.text || '',
                                    attachments: sentMsg.attachments || [],
                                    isDeleted: Boolean(sentMsg.isDeleted),
                                    timestamp: new Date(sentMsg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  }
                                : m
                        );
                        return {
                            ...prev,
                            [profileId]: updated,
                            [resolvedConvId]: updated,
                            ...(conversation?.partnerId ? { [conversation.partnerId]: updated } : {})
                        };
                    });

                    setConversations(prev => {
                        const exists = prev.some(c => c.id === resolvedConvId);
                        if (exists) {
                            return prev.map(c => c.id === resolvedConvId ? {
                                ...c,
                                lastMessage: sentMsg.text || (Array.isArray(sentMsg.attachments) && sentMsg.attachments.length > 0 ? 'Sent an attachment' : 'Sent a message'),
                                lastMessageTime: sentMsg.createdAt || new Date().toISOString()
                            } : c);
                        } else {
                            // Re-fetch conversations to pick up the newly created conversation record
                            fetchConversations();
                            return prev;
                        }
                    });
                }
            } catch (err) {
                console.error('Failed to send message via API:', err);
            }
        }
    };

    const deleteMessage = async (profileId, messageId) => {
        const previous = chats[profileId] || [];

        setChats(prev => ({
            ...prev,
            [profileId]: (prev[profileId] || []).map(message =>
                message.id === messageId
                    ? { ...message, text: 'This message was deleted', isDeleted: true, attachments: [] }
                    : message
            )
        }));

        if (!api.isConfigured) return;

        // If messageId is a temporary client string, keep local state updated without crashing API
        if (typeof messageId === 'string' && messageId.includes('-') && !messageId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return;
        }

        try {
            await api.deleteMessage(messageId);
        } catch (err) {
            console.warn('Failed to delete message on backend:', err?.message || err);
            // If already deleted or not found on backend, maintain local deletion without throwing
            if (err?.message && err.message.toLowerCase().includes('not found')) {
                return;
            }
            setChats(prev => ({
                ...prev,
                [profileId]: previous
            }));
            throw err;
        }
    };

    const editMessage = async (profileId, messageId, newText) => {
        const conversation = conversations.find(c =>
            c.partnerId === profileId ||
            c.id === profileId ||
            c.matchId === profileId
        );
        const convId = conversation?.id;

        const updateLocalState = (text, isEdited) => {
            setChats(prev => {
                const targetKeys = Array.from(new Set([profileId, convId, conversation?.partnerId].filter(Boolean)));
                const nextChats = { ...prev };
                for (const key of targetKeys) {
                    if (nextChats[key]) {
                        nextChats[key] = nextChats[key].map(m =>
                            m.id === messageId ? { ...m, text, isEdited } : m
                        );
                    }
                }
                return nextChats;
            });

            setConversations(prevConvs =>
                prevConvs.map(c => {
                    if (c.id === convId || c.partnerId === profileId) {
                        return { ...c, lastMessage: text };
                    }
                    return c;
                })
            );
        };

        const currentMsgs = chats[profileId] || (convId ? chats[convId] : []) || [];
        const existingMsg = currentMsgs.find(m => m.id === messageId);
        const prevText = existingMsg ? existingMsg.text : '';

        // Optimistically update
        updateLocalState(newText, true);

        if (!api.isConfigured) return;

        // If messageId is a temporary client string, maintain local edit
        if (typeof messageId === 'string' && messageId.includes('-') && !messageId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            return;
        }

        try {
            await api.editMessage(messageId, newText);
        } catch (err) {
            console.error('Failed to edit message on backend:', err);
            if (existingMsg) {
                updateLocalState(prevText, Boolean(existingMsg.isEdited));
            }
            throw err;
        }
    };

    const deleteConversationMessages = async (targetId) => {
        const conversation = conversations.find(c =>
            c.id === targetId ||
            c.partnerId === targetId ||
            c.matchId === targetId ||
            c.userId === targetId ||
            c.partner?.id === targetId ||
            c.partner?.userId === targetId
        );

        const profileId = conversation?.partnerId || targetId;
        const convId = conversation?.id || targetId;

        setStoredChatClear(profileId, convId, targetId, conversation?.partnerId);

        setChats(prev => {
            const next = { ...prev };
            delete next[profileId];
            if (convId) delete next[convId];
            if (targetId) delete next[targetId];
            return next;
        });

        setConversations(prev => prev.map(c => 
            (c.id === convId || c.partnerId === profileId)
                ? { ...c, lastMessage: '', unreadCount: 0 }
                : c
        ));

        if (!api.isConfigured) return;

        try {
            await api.deleteConversationMessages(convId);
            fetchConversations();
        } catch (err) {
            console.warn('deleteConversationMessages warning:', err?.message || err);
            // Maintain local deletion cleanly even if backend returned 404/not found
        }
    };

    const markConversationSeen = useCallback(async (targetId) => {
        if (!targetId) return;

        const conversation = conversationsRef.current.find(c => 
            c.id === targetId || 
            c.partnerId === targetId || 
            c.matchId === targetId
        );

        const convId = conversation?.id || targetId;
        const partnerId = conversation?.partnerId || targetId;

        // Reset unread count for this conversation in local state
        setConversations(prev => prev.map(c => 
            (c.id === convId || c.partnerId === partnerId)
                ? { ...c, unreadCount: 0 }
                : c
        ));

        // Emit socket mark_seen & trigger API call
        if (convId) {
            emitMarkSeen(convId);
            if (api.isConfigured) {
                try {
                    await api.markSeen(convId);
                } catch (err) {
                    console.warn('markConversationSeen warning:', err?.message || err);
                }
            }
        }
    }, []);

        const chatUnreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

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
            savedProfileObjects,
            interestsSent,
            interestStatuses,
            connections,
            setConnections,
            receivedInvites,
            conversations,
            chatUnreadCount,
            toastNotifications,
            addToast,
            removeToast,
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
            updateAccessibilitySettings,
            notifications,
            setNotifications,
            updateNotificationSettings,
            // Notification inbox state & actions
            notificationItems,
            setNotificationItems,
            notificationUnreadCount,
            fetchNotifications,
            markNotificationRead,
            markAllNotificationsRead,
            deleteNotificationItem,
            deepLinkConversationId,
            setDeepLinkConversationId,
            login,
            loginWithGoogle,
            registerWithGoogle,
            completeOnboarding,
            updateUserProfile,
            sendInterest,
            toggleSaveProfile,
            unmatchConnection,
            blockUser,
            unblockUser,
            reportUser,
            submitSupportTicket,
            sendMessage,
            editMessage,
            deleteMessage,
            deleteConversationMessages,
            markConversationSeen,
            logout,
            onlineUserIds,
            fetchDiscoverProfiles,
            fetchConnections,
            fetchReceivedInvites,
            fetchConversations,
            fetchConversationMessages,
            loadSocialData,
            showConfirm,
            showAlert
        }}>
            {children}
            <ConfirmModal
                isOpen={Boolean(dialogConfig)}
                onClose={() => {
                    if (dialogConfig?.onCancel) dialogConfig.onCancel();
                    setDialogConfig(null);
                }}
                title={dialogConfig?.title}
                message={dialogConfig?.message}
                okText={dialogConfig?.okText}
                cancelText={dialogConfig?.cancelText}
                variant={dialogConfig?.variant}
                showCancel={dialogConfig?.showCancel}
                onConfirm={dialogConfig?.onConfirm}
                onCancel={dialogConfig?.onCancel}
            />
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
};
