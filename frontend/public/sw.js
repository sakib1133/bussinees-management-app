const CACHE_NAME = 'bms-v1';
const RUNTIME_CACHE = 'bms-runtime-v1';
const API_CACHE = 'bms-api-v1';
const OFFLINE_PAGE = '/offline.html';

// Assets that should be cached on install
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Caching static assets');
        
        // Cache critical assets
        await cache.addAll(CACHE_ASSETS);
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('[Service Worker] Install failed:', error);
      }
    })()
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        console.log('[Service Worker] Available caches:', cacheNames);
        
        // Delete old caches
        const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE, API_CACHE];
        await Promise.all(
          cacheNames
            .filter(name => !cacheWhitelist.includes(name))
            .map(name => {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
        
        // Claim clients immediately
        await self.clients.claim();
        console.log('[Service Worker] Claimed all clients');
      } catch (error) {
        console.error('[Service Worker] Activate failed:', error);
      }
    })()
  );
});

// Fetch Event - Smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Auth endpoints - NEVER cache (Network only, no cache fallback)
  if (url.pathname.startsWith('/api/auth/')) {
    event.respondWith(authNetworkOnlyStrategy(request));
    return;
  }

  // API requests - Network first with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // JavaScript/CSS files - Network first (iOS PWA fix: don't cache JS with cache-first)
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Other static assets - Cache first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Navigation requests - Network first for iOS PWA compatibility
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Default - Stale while revalidate
  event.respondWith(staleWhileRevalidateStrategy(request));
});

// Auth Network-Only Strategy - NEVER cache auth endpoints (critical for security)
async function authNetworkOnlyStrategy(request) {
  try {
    // Always go to network for auth endpoints - NO cache
    const fetchOptions = {
      credentials: 'include',
      headers: new Headers(request.headers)
    };
    const networkResponse = await fetch(request, fetchOptions);
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Auth endpoint network request failed (CRITICAL):', request.url);
    
    // Return offline error - user MUST have internet for authentication
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

// Network First Strategy - For API calls
async function networkFirstStrategy(request) {
  try {
    // Try network first with credentials for iOS PWA
    const fetchOptions = {
      credentials: 'include',
      headers: new Headers(request.headers)
    };
    const networkResponse = await fetch(request, fetchOptions);
    
    // Cache ONLY successful responses (2xx), never cache errors (4xx, 5xx)
    if (networkResponse.ok && networkResponse.status >= 200 && networkResponse.status < 400) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
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

// Cache First Strategy - For static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Cache ONLY successful responses, never errors
    if (networkResponse.ok && networkResponse.status >= 200 && networkResponse.status < 400) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Cache miss and network failed:', request.url);
    return new Response('Not found', { status: 404 });
  }
}

// Navigation Strategy - For page navigation
async function navigationStrategy(request) {
  try {
    // Try network first for HTML
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Navigation failed, checking cache:', request.url);
    
    // Fall back to cached page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page as final fallback
    try {
      const offlineResponse = await caches.match(OFFLINE_PAGE);
      if (offlineResponse) {
        return offlineResponse;
      }
    } catch (e) {
      console.error('[Service Worker] Could not load offline page:', e);
    }

    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      const cache = caches.open(RUNTIME_CACHE).then(cache => {
        cache.put(request, response.clone());
      });
    }
    return response;
  }).catch(() => {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw new Error('No cached response and network failed');
  });

  return cachedResponse || fetchPromise;
}

// Check if URL is a static asset
function isStaticAsset(url) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.webp', '.ico'
  ];

  const pathname = url.pathname;
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Message handling for update notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Received SKIP_WAITING message');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    console.log('[Service Worker] Received CLIENTS_CLAIM message');
    self.clients.claim();
  }
});

// Background sync for offline actions (optional)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    console.log('[Service Worker] Syncing offline data');
    // Implement sync logic here if needed
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}
