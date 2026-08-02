import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

let socket = null;

export function connectSocket(token) {
  if (socket && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('⚡ Socket connected successfully');
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('⚡ Socket disconnected');
  }
}

export function getSocket() {
  return socket;
}

export function joinConversation(conversationId) {
  if (socket) {
    socket.emit('join_conversation', conversationId);
  }
}

export function leaveConversation(conversationId) {
  if (socket) {
    socket.emit('leave_conversation', conversationId);
  }
}

export function emitStartTyping(conversationId) {
  if (socket) {
    socket.emit('typing_start', conversationId);
  }
}

export function emitStopTyping(conversationId) {
  if (socket) {
    socket.emit('typing_stop', conversationId);
  }
}
