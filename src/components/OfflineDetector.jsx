import React, { useState, useEffect } from 'react';

const OfflineDetector = () => {
  const [isOnline, setIsOnline] = useState(true); // Start optimistic - assume online
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  const checkConnection = async () => {
    // Trust browser's navigator.onLine first
    if (!navigator.onLine) {
      return false;
    }

    // If browser says we're online, we're probably online
    // Don't do aggressive connectivity checks that might fail due to CORS or other issues
    return true;
  };

  useEffect(() => {
    const handleOnline = async () => {
      // Double check if we really have internet
      const hasInternet = await checkConnection();
      if (hasInternet) {
        setIsOnline(true);
        setShowOfflineMessage(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    // Listen to browser's online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Only show offline if browser explicitly says we're offline
    // Don't do initial connectivity check to avoid false positives
    if (!navigator.onLine) {
      setIsOnline(false);
      setShowOfflineMessage(true);
    }

    // Periodic check only if we're already offline
    let interval;
    if (!isOnline && !navigator.onLine) {
      interval = setInterval(async () => {
        // Check if browser now says we're online
        if (navigator.onLine) {
          const online = await checkConnection();
          if (online) {
            setIsOnline(true);
            setShowOfflineMessage(false);
          }
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (interval) clearInterval(interval);
    };
  }, [isOnline]);

  const handleRetry = async () => {
    const online = await checkConnection();
    if (online) {
      setIsOnline(true);
      setShowOfflineMessage(false);
      window.location.reload();
    }
  };

  // Don't show anything if online
  if (isOnline) {
    return null;
  }

  // Show full-screen offline message
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <svg
        width="64"
        height="64"
        style={{ marginBottom: '24px', color: '#9ca3af' }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>

      <h1 style={{
        margin: '0 0 16px',
        fontSize: '24px',
        color: '#111827',
        textAlign: 'center'
      }}>
        You are offline
      </h1>

      <p style={{
        margin: '0 0 24px',
        color: '#6b7280',
        textAlign: 'center',
        maxWidth: '300px'
      }}>
        Please check your internet connection and try again.
      </p>

      <button
        onClick={handleRetry}
        style={{
          backgroundColor: '#0d9488',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#0f766e'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#0d9488'}
      >
        {navigator.onLine ? 'Reload App' : 'Retry Connection'}
      </button>

      <p style={{
        margin: '24px 0 0',
        fontSize: '14px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
      </p>
    </div>
  );
};

export default OfflineDetector;
