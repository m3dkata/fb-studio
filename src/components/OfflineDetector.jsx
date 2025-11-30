import React, { useState, useEffect } from 'react';

const OfflineDetector = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  const checkConnection = async () => {
    // Don't show offline if browser says we're online
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Use a timestamp to bypass service worker cache
      // Fetch a small resource from the server with cache-busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`/favicon.ico?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // If fetch fails, we're likely offline
      return false;
    }
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

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check - only if browser says we're offline
    if (!navigator.onLine) {
      checkConnection().then(online => {
        setIsOnline(online);
        setShowOfflineMessage(!online);
      });
    } else {
      // Browser says we're online, trust it initially
      setIsOnline(true);
      setShowOfflineMessage(false);
    }

    // Periodic check if offline (every 5 seconds)
    let interval;
    if (!isOnline) {
      interval = setInterval(async () => {
        const online = await checkConnection();
        if (online) {
          setIsOnline(true);
          setShowOfflineMessage(false);
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
