const CACHE_NAME = "weather-pwa-v1"
const API_CACHE_NAME = "weather-api-v1"

const urlsToCache = [
  "/",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/_next/static/css/",
  "/_next/static/js/",
]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event with network-first strategy for API calls
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests with network-first strategy
  if (url.hostname === "api.openweathermap.org") {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        try {
          // Try network first
          const networkResponse = await fetch(request)
          if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone())
            return networkResponse
          }
          throw new Error("Network response not ok")
        } catch (error) {
          // Fall back to cache
          const cachedResponse = await cache.match(request)
          if (cachedResponse) {
            return cachedResponse
          }
          // Return a basic error response if no cache available
          return new Response(JSON.stringify({ error: "Offline and no cached data available" }), {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "application/json" },
          })
        }
      }),
    )
    return
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Handle background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "weather-sync") {
    event.waitUntil(
      // Implement background sync logic here if needed
      Promise.resolve(),
    )
  }
})
