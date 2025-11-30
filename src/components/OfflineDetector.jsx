import React, { useState, useEffect } from 'react';

const OfflineDetector = () => {
  const [isOnline, setIsOnline] = useState(true); // Default to true to avoid flash
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Function to update online status
    const updateOnlineStatus = () => {
      const status = navigator.onLine;
      setIsOnline(status);
      setShowToast(!status);
    };

    // Initial check
    updateOnlineStatus();

    // Event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // If online, don't render anything
  if (isOnline && !showToast) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
    >
      <div className="bg-gray-900/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 border border-gray-700/50">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-medium">You are currently offline</span>
        <button
          onClick={() => window.location.reload()}
          className="ml-2 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
        >
          Reload
        </button>
      </div>
    </div>
  );
};

export default OfflineDetector;
