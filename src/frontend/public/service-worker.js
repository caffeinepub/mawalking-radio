const CACHE_VERSION = '4.7';
const CACHE_NAME = `mawalking-radio-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `mawalking-radio-runtime-v${CACHE_VERSION}`;

// Static assets to cache on install (excluding navigation documents)
const STATIC_ASSETS = [
  '/manifest.json'
];

// Icon assets to cache separately (with error handling)
const ICON_ASSETS = [
  '/assets/generated/mawalking-radio-icon.dim_192x192.png',
  '/assets/generated/mawalking-radio-icon.dim_512x512.png'
];

// Background assets to cache (AVIF/WebP/PNG)
const BACKGROUND_ASSETS = [
  '/assets/generated/mawalking-user-bg-mobile.dim_1080x1920.avif',
  '/assets/generated/mawalking-user-bg-mobile.dim_1080x1920.webp',
  '/assets/generated/mawalking-user-bg-mobile.dim_1080x1920.png',
  '/assets/generated/mawalking-user-bg.dim_1920x1080.avif',
  '/assets/generated/mawalking-user-bg.dim_1920x1080.webp',
  '/assets/generated/mawalking-user-bg.dim_1920x1080.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        // Cache critical assets first
        return cache.addAll(STATIC_ASSETS)
          .then(() => {
            console.log('[Service Worker] Critical assets cached');
            // Cache icons and backgrounds individually with error handling
            const allAssets = [...ICON_ASSETS, ...BACKGROUND_ASSETS];
            return Promise.allSettled(
              allAssets.map(url => 
                fetch(url, { cache: 'reload' })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`Failed to fetch ${url}: ${response.status}`);
                    }
                    return cache.put(url, response);
                  })
                  .then(() => console.log(`[Service Worker] Cached asset: ${url}`))
                  .catch(err => console.warn(`[Service Worker] Failed to cache asset ${url}:`, err))
              )
            );
          });
      })
      .then(() => {
        console.log('[Service Worker] Installation complete, skipping waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - aggressively clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', CACHE_NAME);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete ALL caches that don't match current version
              const isOldCache = cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
              if (isOldCache) {
                console.log('[Service Worker] Deleting old cache:', cacheName);
              }
              return isOldCache;
            })
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        console.log('[Service Worker] Old caches cleaned up');
        // Claim all clients immediately
        return self.clients.claim();
      })
      .then(() => {
        console.log('[Service Worker] Activation complete, clients claimed');
      })
  );
});

// Push notification event handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  let notificationData = {
    title: 'Mawalking Radio',
    body: 'New track playing now!',
    icon: '/assets/generated/mawalking-radio-icon.dim_192x192.png',
    badge: '/assets/generated/mawalking-radio-icon.dim_192x192.png',
    tag: 'track-change',
    requireInteraction: false,
    silent: false
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        tag: data.tag || notificationData.tag,
        data: data.data || {}
      };
    } catch (error) {
      console.error('[Service Worker] Failed to parse push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      data: notificationData.data
    })
  );
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Background sync event handler (for future use)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-track-data') {
    event.waitUntil(
      fetch('https://www.mawalkingradio.app/api/nowplaying/mawalking_radio')
        .then(response => response.json())
        .then(data => {
          console.log('[Service Worker] Track data synced:', data);
          return caches.open(RUNTIME_CACHE).then(cache => {
            return cache.put(
              'https://www.mawalkingradio.app/api/nowplaying/mawalking_radio',
              new Response(JSON.stringify(data))
            );
          });
        })
        .catch(error => {
          console.error('[Service Worker] Background sync failed:', error);
        })
    );
  }
});

// Message handler for cache clearing
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'CLEAR_BACKGROUND_CACHE') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('[Service Worker] Clearing background image caches');
          return Promise.all(
            BACKGROUND_ASSETS.map(url => {
              console.log('[Service Worker] Deleting cached background:', url);
              return cache.delete(url);
            })
          );
        })
        .then(() => {
          console.log('[Service Worker] Background cache cleared');
          // Notify client that cache is cleared
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ success: true });
          }
        })
        .catch((error) => {
          console.error('[Service Worker] Failed to clear background cache:', error);
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ success: false, error: error.message });
          }
        })
    );
  }
});

// Fetch event - network first for navigation with aggressive cache busting
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests except for API calls
  if (url.origin !== location.origin) {
    // Allow API calls to mawalkingradio.app
    if (!url.hostname.includes('mawalkingradio.app')) {
      return;
    }
  }

  // CRITICAL: Skip audio stream requests - never cache audio streams
  if (request.url.includes('/listen/') || 
      request.url.includes('mawalkingRhumba') ||
      request.destination === 'audio' ||
      request.url.includes('stream')) {
    console.log('[Service Worker] Bypassing audio stream:', request.url);
    return; // Let browser handle directly
  }

  // SPECIAL: Cache-first for optimized background assets (AVIF/WebP/PNG)
  if (BACKGROUND_ASSETS.some(asset => url.pathname === asset)) {
    console.log('[Service Worker] Background asset - cache first:', url.pathname);
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving cached background:', url.pathname);
            return cachedResponse;
          }
          // Not in cache, fetch and cache
          return fetch(request, { cache: 'reload' })
            .then((response) => {
              if (response.ok) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  console.log('[Service Worker] Caching background asset:', url.pathname);
                  cache.put(request, responseToCache);
                });
              }
              return response;
            });
        })
    );
    return;
  }

  // Network first strategy for navigation requests (app shell)
  // CRITICAL: Always fetch fresh for draft/preview deployments
  if (request.mode === 'navigate' || 
      url.pathname === '/' || 
      url.pathname === '/index.html') {
    console.log('[Service Worker] Navigation request - network first with cache busting:', url.pathname);
    event.respondWith(
      fetch(request, { 
        cache: 'no-store',  // Most aggressive - no caching at all
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then((response) => {
          // Only cache successful responses
          if (response.ok && response.status === 200 && request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch((error) => {
          console.warn('[Service Worker] Network failed for navigation, trying cache:', error);
          // Only use cache as offline fallback
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving cached navigation (offline)');
              return cachedResponse;
            }
            // If no cache available, try index.html
            return caches.match('/index.html').then(indexResponse => {
              if (indexResponse) {
                console.log('[Service Worker] Serving cached index.html (offline)');
                return indexResponse;
              }
              throw error;
            });
          });
        })
    );
    return;
  }

  // Cache first for static assets (JS, CSS, fonts, images)
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'font' ||
      request.destination === 'image' ||
      url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((response) => {
            // Cache successful responses
            if (response.ok && request.method === 'GET') {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          });
        })
    );
    return;
  }

  // Network first for API calls
  if (url.hostname.includes('mawalkingradio.app')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for offline fallback
          if (response.ok && request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch((error) => {
          // Try cache as fallback
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[Service Worker] Serving cached API response (offline)');
              return cachedResponse;
            }
            throw error;
          });
        })
    );
    return;
  }
});
