// Service Worker Registration and Management
let swRegistration = null;
let updateCheckInterval = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Workers not supported');
    return null;
  }

  if (!isHTTPS() && !isLocalhost()) {
    console.warn('[PWA] Service Workers only work over HTTPS (or localhost)');
    return null;
  }

  try {
    console.log('[PWA] Registering service worker...');
    
    swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registered successfully:', swRegistration);

    // Handle updates
    handleServiceWorkerUpdates();

    // Start periodic update checks
    startUpdateChecks();

    return swRegistration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Handle service worker updates
 */
function handleServiceWorkerUpdates() {
  if (!swRegistration) return;

  // Listen for updates
  swRegistration.addEventListener('updatefound', () => {
    console.log('[PWA] Service Worker update found');

    const newWorker = swRegistration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      console.log('[PWA] Service Worker state changed:', newWorker.state);

      // If new service worker is installed and active controller is different
      if (
        newWorker.state === 'installed' &&
        navigator.serviceWorker.controller &&
        navigator.serviceWorker.controller !== newWorker
      ) {
        // New service worker available, notify the app
        console.log('[PWA] New Service Worker available for activation');
        dispatchUpdateAvailable();
      }
    });
  });

  // Listen for controller change (happens when new SW takes over)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[PWA] Service Worker controller changed - update activated');
    dispatchUpdateActivated();
  });
}

/**
 * Start periodic checks for service worker updates
 */
function startUpdateChecks() {
  if (updateCheckInterval) clearInterval(updateCheckInterval);

  // Check for updates every 1 hour
  updateCheckInterval = setInterval(() => {
    console.log('[PWA] Checking for Service Worker updates...');
    if (swRegistration) {
      swRegistration.update().catch(error => {
        console.error('[PWA] Update check failed:', error);
      });
    }
  }, 60 * 60 * 1000); // 1 hour

  // Also check immediately
  if (swRegistration) {
    swRegistration.update().catch(error => {
      console.error('[PWA] Initial update check failed:', error);
    });
  }
}

/**
 * Skip waiting and activate the new service worker
 */
export async function skipWaitingAndReload() {
  if (!swRegistration) {
    console.warn('[PWA] No service worker registration available');
    window.location.reload();
    return;
  }

  if (!swRegistration.waiting) {
    try {
      await swRegistration.update();
    } catch (error) {
      console.error('[PWA] Service Worker update failed:', error);
    }
  }

  if (swRegistration.waiting) {
    console.log('[PWA] Activating new Service Worker...');
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[PWA] Reloading page with new Service Worker');
        window.location.reload();
      }
    });
    return;
  }

  window.location.reload();
}

/**
 * Check if running on HTTPS
 */
function isHTTPS() {
  return window.location.protocol === 'https:';
}

/**
 * Check if running on localhost
 */
function isLocalhost() {
  return window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === '0.0.0.0';
}

/**
 * Get current service worker registration
 */
export function getServiceWorkerRegistration() {
  return swRegistration;
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker() {
  if (swRegistration) {
    try {
      const unregistered = await swRegistration.unregister();
      if (unregistered) {
        console.log('[PWA] Service Worker unregistered');
        swRegistration = null;
        if (updateCheckInterval) {
          clearInterval(updateCheckInterval);
          updateCheckInterval = null;
        }
      }
    } catch (error) {
      console.error('[PWA] Failed to unregister Service Worker:', error);
    }
  }
}

export async function checkForUpdates() {
  if (!swRegistration) {
    return;
  }

  try {
    await swRegistration.update();
  } catch (error) {
    console.error('[PWA] Service Worker update check failed:', error);
  }
}

/**
 * Dispatch custom event for update available
 */
function dispatchUpdateAvailable() {
  const event = new CustomEvent('pwa:updateavailable', {
    detail: { hasUpdate: true }
  });
  window.dispatchEvent(event);
}

/**
 * Dispatch custom event for update activated
 */
function dispatchUpdateActivated() {
  const event = new CustomEvent('pwa:updateactivated', {
    detail: { updateActivated: true }
  });
  window.dispatchEvent(event);
}

/**
 * Clear all caches
 */
export async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    console.log('[PWA] Clearing caches:', cacheNames);
    
    await Promise.all(
      cacheNames.map(name => {
        console.log('[PWA] Deleting cache:', name);
        return caches.delete(name);
      })
    );

    console.log('[PWA] All caches cleared');
  } catch (error) {
    console.error('[PWA] Failed to clear caches:', error);
  }
}

/**
 * Get cache size information
 */
export async function getCacheSizeInfo() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response && response.body) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return {
      totalSize,
      formattedSize: formatBytes(totalSize),
      cacheCount: cacheNames.length
    };
  } catch (error) {
    console.error('[PWA] Failed to get cache size:', error);
    return { totalSize: 0, formattedSize: '0 B', cacheCount: 0 };
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if app is installed
 */
export function isAppInstalled() {
  // Check if app is running in standalone mode (installed as PWA)
  return window.navigator.standalone === true ||
         window.matchMedia('(display-mode: standalone)').matches ||
         document.referrer.includes('android-app://') ||
         document.referrer.includes('web-app://');
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const persistent = await navigator.storage.persist();
      console.log('[PWA] Persistent storage request:', persistent);
      return persistent;
    }
  } catch (error) {
    console.error('[PWA] Failed to request persistent storage:', error);
  }
  return false;
}

/**
 * Check if storage is persistent
 */
export async function isPersistent() {
  try {
    if (navigator.storage && navigator.storage.persisted) {
      return await navigator.storage.persisted();
    }
  } catch (error) {
    console.error('[PWA] Failed to check persistent storage:', error);
  }
  return false;
}
