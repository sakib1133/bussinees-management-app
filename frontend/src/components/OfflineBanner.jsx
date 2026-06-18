import { useState, useEffect } from 'react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[PWA] Connection restored');
      setIsOnline(true);
      setWasOffline(true);
      
      // Auto-hide the banner after 4 seconds
      setTimeout(() => {
        setWasOffline(false);
      }, 4000);
    };

    const handleOffline = () => {
      console.log('[PWA] Connection lost');
      setIsOnline(false);
      setWasOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !wasOffline) {
    return null;
  }

  if (isOnline && wasOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-green-50 border-b border-green-200 px-4 py-3 z-30 animate-slide-down">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-green-600 text-lg">✓</span>
          <p className="text-green-700 text-sm font-medium">
            Connection restored. You are back online.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-50 border-b border-amber-200 px-4 py-3 z-30">
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <span className="text-amber-600 text-lg">📡</span>
        <p className="text-amber-700 text-sm font-medium">
          You are offline. Some live data may not be available. Using cached content.
        </p>
      </div>
    </div>
  );
}
