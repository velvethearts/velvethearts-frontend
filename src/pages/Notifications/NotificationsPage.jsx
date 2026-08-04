import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/UI/PageHeader';
import { Button } from '../../components/UI/Button';
import { Bell, ChatCircleText, Heart, Info } from '@phosphor-icons/react';

export const NotificationsPage = () => {
  const { notificationItems, notificationUnreadCount, markNotificationRead, markAllNotificationsRead, deleteNotificationItem, setActiveTab, setDeepLinkConversationId } = useApp();

  const hasUnread = notificationUnreadCount > 0 || notificationItems.some(n => !n.isRead);

  const timeAgo = (d) => {
    const now = Date.now();
    const diff = Math.floor((now - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const days = Math.floor(diff / 86400);
    return `${days}d ago`;
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'MESSAGE':
        return <ChatCircleText size={20} />;
      case 'MATCH':
      case 'LIKE':
        return <Heart size={20} />;
      case 'SYSTEM':
        return <Info size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const handleClick = async (n) => {
    try {
      if (!n.isRead) await markNotificationRead(n.id);
    } catch (e) { }

    const titleLower = n.title?.toLowerCase() || '';
    const contentLower = n.content?.toLowerCase() || '';

    // 1. Likes, matches, and connection notifications redirect to the Matches page
    if (
      n.type === 'LIKE' ||
      n.type === 'MATCH' ||
      titleLower.includes('like') ||
      titleLower.includes('match') ||
      titleLower.includes('connection') ||
      contentLower.includes('liked you') ||
      contentLower.includes('shared interest')
    ) {
      setActiveTab('matches');
      return;
    }

    // 2. New message received notifications redirect to the Chat page
    if (
      n.type === 'MESSAGE' ||
      titleLower.includes('message') ||
      contentLower.includes('sent you a message')
    ) {
      if (n.relatedId) {
        setDeepLinkConversationId(n.relatedId);
      }
      setActiveTab('chat');
      return;
    }

    if (n.type === 'SYSTEM') {
      setActiveTab('discover');
      return;
    }
  };

  return (
    <div className="notifications-page page-enter">
      <PageHeader
        title="Notifications"
        subtitle={hasUnread ? `${notificationUnreadCount} unread` : 'All notifications'}
        actions={hasUnread ? (
          <Button variant="ghost" onClick={markAllNotificationsRead}>
            Mark all read
          </Button>
        ) : null}
      />

      <div className="notifications-list">
        {notificationItems.length === 0 ? (
          <div className="empty-state">No notifications yet.</div>
        ) : (
          notificationItems.map(n => (
          <button key={n.id} onClick={() => handleClick(n)} className={`notif-item ${n.isRead ? 'read' : 'unread'}`} title={new Date(n.createdAt).toLocaleString()}>
            <div className="notif-icon">
              { (n.actorPhoto || n.actor?.photo || n.senderPhoto) ? (
                <img src={n.actorPhoto || n.actor?.photo || n.senderPhoto} alt="avatar" className="notif-avatar" />
              ) : (
                typeIcon(n.type)
              )}
            </div>

            <div className="notif-body">
              <div className="notif-title">{n.title}{!n.isRead && <span className="notif-unread-dot" />}</div>
              <div className="notif-content">{n.content}</div>
            </div>

            <div className="notif-meta">
              <div className="notif-time">{timeAgo(new Date(n.createdAt))}</div>
              <button onClick={(e) => { e.stopPropagation(); deleteNotificationItem(n.id); }} className="notif-delete">Delete</button>
            </div>
          </button>
          ))
        )}
      </div>

      <style>{`
        .notifications-page { max-width: var(--content-max-width); margin: 0 auto; padding: var(--space-6) var(--space-4); }
        .notifications-list { display: flex; flex-direction: column; gap: var(--space-3); margin-top: var(--space-4); }
        .notif-item { display:flex; align-items:center; gap: var(--space-4); padding: var(--space-3); border-radius: var(--radius-md); background: var(--bg-surface); border: 1px solid var(--border-subtle); text-align:left; }
        .notif-item.unread { background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0)); box-shadow: 0 1px 0 rgba(0,0,0,0.02); }
        .notif-icon { width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:var(--bg-muted); overflow:hidden; }
        .notif-avatar { width:100%; height:100%; object-fit:cover; display:block; }
        .notif-body { flex:1; }
        .notif-title { font-weight:600; font-family:var(--font-ui); display:flex; align-items:center; gap:8px; }
        .notif-title .notif-unread-dot { width:8px; height:8px; border-radius:50%; background:var(--text-accent); display:inline-block; margin-left:6px; }
        .notif-item.unread .notif-title { font-weight:700; }
        .notif-content { color:var(--text-secondary); font-size:var(--text-body-sm); }
        .notif-meta { display:flex; flex-direction:column; gap:6px; align-items:flex-end; }
        .notif-time { font-size:12px; color:var(--text-tertiary); }
        .notif-delete { background:transparent; border:none; color:var(--text-tertiary); cursor:pointer; }
        .notif-item:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.04); }
        .notif-item:active { transform: translateY(0); }
      `}</style>
    </div>
  );
};
