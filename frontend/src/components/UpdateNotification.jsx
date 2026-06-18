import { useState, useEffect } from 'react';
import { skipWaitingAndReload } from '../utils/pwaUtils';

export default function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for PWA update notification
    const handleUpdateAvailable = (event) => {
      console.log('[PWA] Update available notification received');
      setUpdateAvailable(true);
    };

    const handleUpdateActivated = (event) => {
      console.log('[PWA] Update activated');
      setIsUpdating(false);
    };

    window.addEventListener('pwa:updateavailable', handleUpdateAvailable);
    window.addEventListener('pwa:updateactivated', handleUpdateActivated);

    return () => {
      window.removeEventListener('pwa:updateavailable', handleUpdateAvailable);
      window.removeEventListener('pwa:updateactivated', handleUpdateActivated);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    console.log('[PWA] User initiated update');
    
    try {
      await skipWaitingAndReload();
    } catch (error) {
      console.error('[PWA] Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-down border-l-4 border-green-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔄</span>
            <h3 className="font-semibold text-gray-800">Update Available</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            A new version of the app is available. Click update to get the latest features and improvements.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className={`px-4 py-2 ${
                isUpdating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white text-sm font-medium rounded transition-colors`}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={handleDismiss}
              disabled={isUpdating}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          disabled={isUpdating}
          className="text-gray-400 hover:text-gray-600 ml-2 disabled:opacity-50"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
