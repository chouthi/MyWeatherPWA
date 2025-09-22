// lib/cache-utils.ts
// Utilities for managing cache and offline functionality

export interface CacheInfo {
  hasCache: boolean
  lastUpdate: string | null
  isStale: boolean
  isOnline: boolean
}

export async function getCacheInfo(): Promise<CacheInfo> {
  const isOnline = navigator.onLine
  let hasCache = false
  let lastUpdate: string | null = null
  let isStale = false

  try {
    if ('caches' in window) {
      const cache = await caches.open('weather-api-v2')
      const cachedRequests = await cache.keys()
      hasCache = cachedRequests.length > 0

      if (hasCache && cachedRequests.length > 0) {
        // Get the most recent cached response
        const responses = await Promise.all(
          cachedRequests.map(req => cache.match(req))
        )
        
        const validResponses = responses.filter(Boolean)
        if (validResponses.length > 0) {
          // Find the most recent timestamp
          let latestTimestamp = 0
          for (const response of validResponses) {
            const timestamp = response!.headers.get('sw-timestamp')
            if (timestamp) {
              const ts = parseInt(timestamp, 10)
              if (ts > latestTimestamp) {
                latestTimestamp = ts
              }
            }
          }
          
          if (latestTimestamp > 0) {
            const date = new Date(latestTimestamp)
            lastUpdate = date.toLocaleString('vi-VN')
            
            // Check if data is stale (older than 5 minutes)
            const now = Date.now()
            const fiveMinutes = 5 * 60 * 1000
            isStale = (now - latestTimestamp) > fiveMinutes
          }
        }
      }
    }
  } catch (error) {
    console.log('Error checking cache info:', error)
  }

  return {
    hasCache,
    lastUpdate,
    isStale,
    isOnline
  }
}

export async function clearOldCache(): Promise<void> {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const oldCaches = cacheNames.filter(name => 
        name.includes('weather') && !name.includes('v2')
      )
      
      await Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
      )
      
      console.log('Cleared old caches:', oldCaches)
    }
  } catch (error) {
    console.log('Error clearing old cache:', error)
  }
}

export function registerSW(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('SW registered:', registration)
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('New version of the app is available')
                if (confirm('Có phiên bản mới của ứng dụng. Tải lại để cập nhật?')) {
                  window.location.reload()
                }
              }
            })
          }
        })
      } catch (error) {
        console.log('SW registration failed:', error)
      }
    })
  }
}

export async function checkForUpdates(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
      }
    } catch (error) {
      console.log('Error checking for updates:', error)
    }
  }
}