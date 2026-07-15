import { useEffect, useState } from 'react';
import { skipWaitingAndReload, isAppInstalled } from '../utils/pwaUtils';

export default function UpdateNotification({ versionUpdateAvailable = false }) {
  const [updateAvailable, setUpdateAvailable] = useState(versionUpdateAvailable);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (versionUpdateAvailable) setUpdateAvailable(true);
  }, [versionUpdateAvailable]);

  const readDeployedVersion = async () => {
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const v = data?.version != null ? String(data.version) : null;
    return v;
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Acknowledge BEFORE reload so the popup won’t reappear due to SW/controller timing.
      const deployedVersion = await readDeployedVersion();
      if (deployedVersion) {
        localStorage.setItem('pwa_last_ack_version', deployedVersion);
      }

      await skipWaitingAndReload();
    } catch (error) {
      console.error('[PWA] Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = async () => {
    // “Later” also acknowledges the currently deployed version.
    setUpdateAvailable(false);

    try {
      const deployedVersion = await readDeployedVersion();
      if (deployedVersion) {
        localStorage.setItem('pwa_last_ack_version', deployedVersion);
      }
    } catch {
      // no-op
    }
  };

  // Never show update UI to non-installed browser users.
  if (!isAppInstalled()) return null;
  if (!updateAvailable) return null;

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

