import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = 'info', duration = 2000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: notification.type === 'success' ? '#22c55e' : notification.type === 'error' ? '#ef4444' : '#6366f1',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            fontFamily: 'monospace',
            fontSize: 18,
            letterSpacing: 1,
            animation: 'fadeIn 0.2s',
          }}
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
