const API_URL = import.meta.env.VITE_API_URL || '';

const tokenStore = {
    getToken() {
        return localStorage.getItem('vh-firebase-token') || '';
    },

    get() {
        return this.getToken();
    },

    setToken(token) {
        if (token) {
            localStorage.setItem('vh-firebase-token', token);
        }
    },

    clear() {
        localStorage.removeItem('vh-firebase-token');
    }
};

const request = async (path, options = {}) => {
    if (!API_URL) {
        throw new Error(
            'Backend API URL is not configured. Set VITE_API_URL in your environment.'
        );
    }

    const headers = new Headers(options.headers || {});
    const hasBody =
        options.body !== undefined && !(options.body instanceof FormData);

    if (hasBody && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const firebaseToken = tokenStore.getToken();

    if (firebaseToken && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${firebaseToken}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
        body: hasBody ? JSON.stringify(options.body) : options.body
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.success === false) {
        const err = new Error(payload?.message || 'API request failed');
        err.status = response.status;
        throw err;
    }

    return payload.data;
};

export const api = {
    isConfigured: Boolean(API_URL),
    tokenStore,

    // ==========================================================
    // AUTH
    // ==========================================================

    login(firebaseIdToken) {
        return request('/api/v1/auth/login', {
            method: 'POST',
            body: {
                firebaseIdToken
            }
        });
    },

    logout() {
        tokenStore.clear();
    },

    // ==========================================================
    // PROFILE
    // ==========================================================

    getMe() {
        return request('/api/v1/profile/me');
    },

    getSettings() {
        return request('/api/v1/profile/settings');
    },

    updateSettings(settings) {
        return request('/api/v1/profile/settings', {
            method: 'PUT',
            body: settings
        });
    },

    saveProfile(profile) {
        return request('/api/v1/profile', {
            method: 'POST',
            body: profile
        });
    },

    deleteAccount() {
        return request('/api/v1/profile', {
            method: 'DELETE'
        });
    },

    // ==========================================================
    // DISCOVER
    // ==========================================================

    getDiscover(filters = {}) {
        const params = new URLSearchParams();

        if (filters.gender && filters.gender !== 'All')
            params.set('gender', filters.gender);

        if (filters.relationshipIntent && filters.relationshipIntent !== 'All')
            params.set('relationshipIntent', filters.relationshipIntent);

        if (filters.city)
            params.set('city', filters.city);

        if (filters.ageMin)
            params.set('ageMin', String(filters.ageMin));

        if (filters.ageMax)
            params.set('ageMax', String(filters.ageMax));

        const qs = params.toString();

        return request(`/api/v1/discover${qs ? `?${qs}` : ''}`);
    },

    // ==========================================================
    // MATCH
    // ==========================================================

    likeProfile(receiverId) {
        return request('/api/v1/match/like', {
            method: 'POST',
            body: { receiverId }
        });
    },

    unlikeProfile(receiverId) {
        return request('/api/v1/match/unlike', {
            method: 'POST',
            body: { receiverId }
        });
    },

    unmatch(matchId) {
        return request('/api/v1/match/unmatch', {
            method: 'POST',
            body: { matchId }
        });
    },

    getConnections() {
        return request('/api/v1/match/connections');
    },

    getReceivedInvites() {
        return request('/api/v1/match/received-invites');
    },

    // ==========================================================
    // SAFETY
    // ==========================================================

    blockUser(blockedUserId, reason) {
        return request('/api/v1/block', {
            method: 'POST',
            body: {
                blockedUserId,
                reason
            }
        });
    },

    unblockUser(blockedUserId) {
        return request(`/api/v1/block/${blockedUserId}`, {
            method: 'DELETE'
        });
    },

    getBlockedUsers() {
        return request('/api/v1/safety/blocked');
    },

    reportUser(targetUserId, reason, comment) {
        return request('/api/v1/safety/reports', {
            method: 'POST',
            body: {
                targetUserId,
                reason,
                comment
            }
        });
    },

    // ==========================================================
    // CHAT
    // ==========================================================
    getConversations() {
        return request('/api/v1/chat/conversations');
    },

    getMessages(conversationId) {
        return request(
            `/api/v1/chat/conversations/${conversationId}/messages`
        );
    },

    sendMessage(conversationId, text, attachments) {
        return request(
            `/api/v1/chat/conversations/${conversationId}/messages`,
            {
                method: 'POST',
                body: {
                    text,
                    attachments
                }
            }
        );
    },

    deleteMessage(messageId) {
        return request(`/api/v1/chat/messages/${messageId}`, {
            method: 'DELETE'
        });
    },

    deleteConversationMessages(conversationId) {
        return request(
            `/api/v1/chat/conversations/${conversationId}/messages`,
            {
                method: 'DELETE'
            }
        );
    },

    // ==========================================================
    // NOTIFICATIONS
    // ==========================================================

    getNotifications(page = 1, limit = 50) {
        const qs = `?page=${page}&limit=${limit}`;
        return request(`/api/v1/notifications${qs}`);
    },

    markNotificationRead(notificationId) {
        return request(`/api/v1/notifications/${notificationId}/read`, {
            method: 'POST'
        });
    },

    markAllNotificationsRead() {
        return request('/api/v1/notifications/read-all', {
            method: 'POST'
        });
    },

    deleteNotification(notificationId) {
        return request(`/api/v1/notifications/${notificationId}`, {
            method: 'DELETE'
        });
    },

    // ==========================================================
    // UPLOAD
    // ==========================================================

    uploadPhoto(file) {
        const formData = new FormData();
        formData.append('photo', file);

        return request('/api/v1/upload', {
            method: 'POST',
            body: formData
        });
    },

    uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        return request('/api/v1/upload', {
            method: 'POST',
            body: formData
        });
    },

    // ==========================================================
    // ADMIN
    // ==========================================================

    admin: {
        getPending() {
            return request('/api/v1/admin/users/pending');
        },

        approve(userId) {
            return request(`/api/v1/admin/users/${userId}/approve`, {
                method: 'POST'
            });
        },

        reject(userId) {
            return request(`/api/v1/admin/users/${userId}/reject`, {
                method: 'POST'
            });
        },

        getPhoneHistory(phoneNumber) {
            const params = new URLSearchParams({ phoneNumber });

            return request(
                `/api/v1/admin/users/history?${params.toString()}`
            );
        }
    }
};
