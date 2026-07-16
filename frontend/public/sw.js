const CACHE_NAME = 'bms-v45';
const RUNTIME_CACHE = 'bms-runtime-v5';
const API_CACHE = 'bms-api-v5';
const OFFLINE_PAGE = '/offline.html';

// Assets that should be cached on install
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

function logSW(...args) {
  console.log('[Service Worker]', ...args);
}

function logSWError(...args) {
  console.error('[Service Worker]', ...args);
}

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  logSW('Install event');

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        logSW('Caching static assets');
        await cache.addAll(CACHE_ASSETS);
        // Skip waiting to activate immediately
      } catch (error) {
        logSWError('Install failed:', error);
      }
    })()
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  logSW('Activate event');

  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE, API_CACHE];

        await Promise.all(
          cacheNames
            .filter((name) => !cacheWhitelist.includes(name))
            .map(async (name) => {
              logSW('Deleting old cache:', name);
              await caches.delete(name);
            })
        );

        await self.clients.claim();
        logSW('Claimed all clients');
      } catch (error) {
        logSWError('Activate failed:', error);
      }
    })()
  );
});

function isNavigationRequest(request, url) {
  // Requirements:
  // - Routes like /, /login, /register, /dashboard, /reports, /labour etc must be handled by navigationStrategy()
  // - Navigation requests must never reach staleWhileRevalidateStrategy()
  // - Use:
  //   if (request.mode === 'navigate' || request.destination === 'document')
  try {
    return (
      request.mode === 'navigate' ||
      request.destination === 'document' ||
      // Some browsers don’t set mode/destination consistently for client-side routes.
      // Treat same-origin requests that accept HTML as navigation.
      (request.method === 'GET' &&
        request.headers.get('accept')?.includes('text/html') &&
        url.origin === self.location.origin)
    );
  } catch {
    return false;
  }
}

function isApiAuthRequest(url) {
  return url.pathname.startsWith('/api/auth/');
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isJsOrCssRequest(url) {
  return url.pathname.endsWith('.js') || url.pathname.endsWith('.css');
}

function isStaticAssetUrl(url) {
  const staticExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.webp',
    '.ico',
    '.json',
    '.mp3',
    '.mp4',
    '.webm',
    '.ogg'
  ];

  const pathname = url.pathname;
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

async function getOfflineFallbackResponse() {
  try {
    const offlineResponse = await caches.match(OFFLINE_PAGE);
    if (offlineResponse) return offlineResponse;
  } catch (e) {
    logSWError('Could not load offline page:', e);
  }

  // Last resort.
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Fetch Event - Smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never let any fetch strategy throw an uncaught error.
  // If anything unexpected happens, return a safe fallback Response.
  try {
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // Skip chrome extensions
    if (url.protocol === 'chrome-extension:') return;

    // Requirements 2 + 5: Auth endpoints network-only
    if (isApiAuthRequest(url)) {
      event.respondWith(authNetworkOnlyStrategy(request));
      return;
    }

    // Requirements 2: Navigation must go to navigationStrategy()
    // Use exactly the required mode/destination checks, routing them before any staleWhileRevalidate.
    if (
      request.mode === 'navigate' ||
      request.destination === 'document'
    ) {
      event.respondWith(navigationStrategy(request));
      return;
    }

    if (isNavigationRequest(request, url)) {
      event.respondWith(navigationStrategy(request));
      return;
    }

    // API requests - keep network first with fallback
    if (isApiRequest(url)) {
      event.respondWith(networkFirstStrategy(request));
      return;
    }

    // JS/CSS files - network first
    if (isJsOrCssRequest(url)) {
      event.respondWith(networkFirstStrategy(request));
      return;
    }

    // Other static assets - cache first
    if (isStaticAssetUrl(url)) {
      event.respondWith(cacheFirstStrategy(request));
      return;
    }

    // Default - stale while revalidate for non-navigation non-auth GETs
    event.respondWith(staleWhileRevalidateStrategy(request));
  } catch (err) {
    logSWError('Fetch handler failed:', err);
    event.respondWith(
      new Response('Service Unavailable', {
        status: 503,
        statusText: 'Service Unavailable'
      })
    );
  }
});

// Auth Network-Only Strategy - NEVER cache auth endpoints (critical for security)
async function authNetworkOnlyStrategy(request) {
  try {
    const fetchOptions = {
      credentials: 'include',
      headers: new Headers(request.headers)
    };

    const networkResponse = await fetch(request, fetchOptions);
    // Never cache auth responses.
    return networkResponse;
  } catch (error) {
    logSWError('Auth endpoint network request failed (CRITICAL):', request.url, error);

    // Return fallback auth failure response (still a valid Response object, no throw).
    return new Response(
      JSON.stringify({
        error: 'Authentication requires internet connection',
        message: 'You must be online to login, register, or reset your password.',
        code: 'AUTH_OFFLINE_ERROR'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Network First Strategy - For API calls (never throw; always return Response)
async function networkFirstStrategy(request) {
  try {
    const fetchOptions = {
      credentials: 'include',
      headers: new Headers(request.headers)
    };

    const networkResponse = await fetch(request, fetchOptions);

    // Cache ONLY successful responses (2xx/3xx), never cache errors.
    if (
      networkResponse &&
      networkResponse.ok &&
      networkResponse.status >= 200 &&
      networkResponse.status < 400
    ) {
      const cache = await caches.open(API_CACHE);
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    logSWError('Network request failed, trying cache:', request.url, error);

    // Fall back to cache
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
    } catch (e) {
      logSWError('Cache match failed:', e);
    }

    // Return error response
    return new Response(
      JSON.stringify({
        error: 'Network error and no cached response available',
        message: 'You are offline. Some live data may not be available.'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First Strategy - For static assets (never throw; always return Response)
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(request);

    if (
      networkResponse &&
      networkResponse.ok &&
      networkResponse.status >= 200 &&
      networkResponse.status < 400
    ) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    // If network returns non-ok status, still return it.
    return networkResponse;
  } catch (error) {
    logSWError('Cache miss and network failed:', request.url, error);
    return new Response('Not found', { status: 404, statusText: 'Not Found' });
  }
}

// Navigation Strategy - For page navigation (never throw; always return Response)
async function navigationStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    return networkResponse;
  } catch (error) {
    logSWError('Navigation failed, checking cache:', request.url, error);

    // Fall back to cached route
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
    } catch (e) {
      logSWError('Navigation cache match failed:', e);
    }

    // Show offline page when navigation cannot be fulfilled.
    return await getOfflineFallbackResponse();
  }
}

// Stale While Revalidate Strategy (improved, never throw; always return Response)
async function staleWhileRevalidateStrategy(request) {
  let cachedResponse = null;

  try {
    cachedResponse = await caches.match(request);
  } catch (e) {
    logSWError('StaleWhileRevalidate cache match failed:', e);
  }

  try {
    const networkResponse = await fetch(request);

    // If network succeeds, return network response and update cache.
    if (networkResponse) {
      // Cache only if ok
      if (networkResponse.ok) {
        try {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(request, networkResponse.clone());
        } catch (e) {
          logSWError('StaleWhileRevalidate cache put failed:', e);
        }
      }

      return networkResponse;
    }

    // Network returned null/undefined - fall back.
    if (cachedResponse) return cachedResponse;

    return new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  } catch (e) {
    logSWError('StaleWhileRevalidate network failed:', request.url, e);

    // If network fails and cache exists, return cached response.
    if (cachedResponse) return cachedResponse;

    // If both fail, return required 503 response (never throw).
    return new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Message handling for update notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    logSW('Received SKIP_WAITING message');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    logSW('Received CLIENTS_CLAIM message');
    self.clients.claim();
  }
});

// Background sync for offline actions (optional)
self.addEventListener('sync', (event) => {
  logSW('Background sync event:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    logSW('Syncing offline data');
    // Implement sync logic here if needed
  } catch (error) {
    logSWError('Sync failed:', error);
  }
}

