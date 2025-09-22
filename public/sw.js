const CACHE_NAME = "weather-pwa-v2"
const API_CACHE_NAME = "weather-api-v2"
const STATIC_CACHE_NAME = "weather-static-v2"
const IMAGES_CACHE_NAME = "weather-images-v2"

// Cache expiration times
const API_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const STATIC_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

const urlsToCache = [
  "/",
  "/manifest.json",
  "/offline",
  "/icon-192x192.jpg",
  "/icon-512x512.jpg",
]

// Static assets patterns to cache
const STATIC_CACHE_PATTERNS = [
  /\/_next\/static\/.*/,
  /\/fonts\/.*/,
  /\.css$/,
  /\.js$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.eot$/,
]

// Utility functions
function isCacheExpired(timestamp, duration) {
  return Date.now() - timestamp > duration
}

function addTimestamp(response) {
  const responseWithTimestamp = response.clone()
  responseWithTimestamp.headers.set('sw-timestamp', Date.now().toString())
  return responseWithTimestamp
}

function getTimestamp(response) {
  const timestamp = response.headers.get('sw-timestamp')
  return timestamp ? parseInt(timestamp, 10) : 0
}

function isStaticAsset(url) {
  return STATIC_CACHE_PATTERNS.some(pattern => pattern.test(url))
}

// Install event
self.addEventListener("install", (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching core assets')
        return cache.addAll(urlsToCache)
      }),
      caches.open(STATIC_CACHE_NAME),
      caches.open(API_CACHE_NAME),
      caches.open(IMAGES_CACHE_NAME)
    ]).then(() => {
      console.log('[SW] Installation complete')
      return self.skipWaiting()
    })
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (!cacheName.includes('v2')) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }).then(() => {
      console.log('[SW] Activation complete')
      return self.clients.claim()
    }),
  )
})

// Fetch event with improved caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests with network-first + cache expiration
  if (url.hostname === "api.openweathermap.org") {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets with cache-first + long expiration
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request))
    return
  }

  // Handle images with cache-first
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    event.respondWith(handleImageRequest(request))
    return
  }

  // Handle page requests with network-first + fallback
  event.respondWith(handlePageRequest(request))
})

// API request handler with smart caching
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME)
  
  try {
    // Try network first
    console.log('[SW] Fetching API from network:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses with timestamp
      const responseToCache = addTimestamp(networkResponse.clone())
      await cache.put(request, responseToCache)
      console.log('[SW] API response cached')
      return networkResponse
    }
    throw new Error("Network response not ok")
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', error.message)
    
    // Check cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      const timestamp = getTimestamp(cachedResponse)
      
      // Return cached data even if expired (better than no data)
      if (isCacheExpired(timestamp, API_CACHE_DURATION)) {
        console.log('[SW] Returning expired cache data')
        // Add header to indicate data is stale
        const staleResponse = cachedResponse.clone()
        staleResponse.headers.set('X-Cache-Status', 'stale')
        return staleResponse
      }
      
      console.log('[SW] Returning fresh cache data')
      return cachedResponse
    }
    
    // No cache available - return offline response
    console.log('[SW] No cache available, returning offline response')
    return new Response(
      JSON.stringify({ 
        error: "Không có kết nối mạng và không có dữ liệu offline",
        offline: true 
      }), {
        status: 503,
        statusText: "Service Unavailable",
        headers: { 
          "Content-Type": "application/json",
          "X-Cache-Status": "offline"
        },
      }
    )
  }
}

// Static asset handler with long-term caching
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    console.log('[SW] Serving static asset from cache:', request.url)
    return cachedResponse
  }
  
  try {
    console.log('[SW] Fetching static asset:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
      console.log('[SW] Static asset cached')
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Failed to fetch static asset:', error.message)
    throw error
  }
}

// Image request handler
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGES_CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    // Return a placeholder or the cached response
    return cachedResponse || new Response('', { status: 404 })
  }
}

// Page request handler with offline fallback
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  
  try {
    console.log('[SW] Fetching page from network:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
      return networkResponse
    }
    throw new Error("Network response not ok")
  } catch (error) {
    console.log('[SW] Network failed for page, checking cache')
    
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return cached index page as fallback
    const indexResponse = await cache.match('/')
    if (indexResponse) {
      return indexResponse
    }
    
    throw error
  }
}

// Handle background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  if (event.tag === "weather-sync") {
    event.waitUntil(syncWeatherData())
  }
})

// Background sync for weather data
async function syncWeatherData() {
  try {
    console.log('[SW] Attempting to sync weather data')
    // This could sync pending requests or refresh data
    const cache = await caches.open(API_CACHE_NAME)
    // Implementation depends on your specific sync needs
    return Promise.resolve()
  } catch (error) {
    console.log('[SW] Background sync failed:', error)
    throw error
  }
}

// Handle push notifications (if implemented later)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    console.log('[SW] Push notification received:', data)
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Weather Update', {
        body: data.body || 'Check the latest weather updates',
        icon: '/icon-192x192.jpg',
        badge: '/icon-192x192.jpg',
        tag: 'weather-notification',
        renotify: true
      })
    )
  }
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log('[SW] Notification clicked')
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})
