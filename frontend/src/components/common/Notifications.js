/**
 * Notifications Component — Shows alerts and notifications
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'security',
      title: 'AI Fraud Detection Active',
      message: 'Your account is protected by our advanced AI fraud detection system.',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Welcome to SmartBank',
      message: 'Thank you for choosing our digital banking platform. Explore all features!',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Security Reminder',
      message: 'Remember to log out when using public devices and never share your credentials.',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: false
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    toast.success('All notifications marked as read');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'security': return 'bi-shield-check';
      case 'warning': return 'bi-exclamation-triangle';
      case 'info': return 'bi-info-circle';
      case 'success': return 'bi-check-circle';
      default: return 'bi-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'security': return '#00d4aa';
      case 'warning': return '#ff6b6b';
      case 'info': return '#6c63ff';
      case 'success': return '#6bcb77';
      default: return '#8892b0';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="glass-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 style={{ color: '#f0f4ff', margin: 0 }}>
          <i className="bi bi-bell me-2"></i>
          Notifications
          {unreadCount > 0 && (
            <span className="badge bg-danger ms-2" style={{ fontSize: '0.7rem' }}>
              {unreadCount}
            </span>
          )}
        </h5>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn btn-sm"
            style={{
              background: 'rgba(108, 99, 255, 0.1)',
              color: '#6c63ff',
              border: '1px solid rgba(108, 99, 255, 0.3)'
            }}
          >
            Mark All Read
          </button>
        )}
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="text-center py-4" style={{ color: '#8892b0' }}>
            <i className="bi bi-bell-slash" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
            <div>No notifications</div>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                background: notification.read ? 'rgba(255,255,255,0.02)' : 'rgba(108, 99, 255, 0.05)',
                border: notification.read ? 'none' : '1px solid rgba(108, 99, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="d-flex align-items-start gap-3">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: `${getNotificationColor(notification.type)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <i
                    className={`bi ${getNotificationIcon(notification.type)}`}
                    style={{ color: getNotificationColor(notification.type), fontSize: '0.9rem' }}
                  ></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 600,
                    color: '#f0f4ff',
                    fontSize: '0.9rem',
                    marginBottom: '0.25rem'
                  }}>
                    {notification.title}
                  </div>
                  <div style={{
                    color: '#8892b0',
                    fontSize: '0.8rem',
                    lineHeight: 1.4
                  }}>
                    {notification.message}
                  </div>
                  <div style={{
                    color: '#667085',
                    fontSize: '0.7rem',
                    marginTop: '0.5rem'
                  }}>
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </div>
                </div>
                {!notification.read && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#6c63ff',
                      flexShrink: 0,
                      marginTop: '6px'
                    }}
                  ></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;