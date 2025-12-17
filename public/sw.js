const CACHE_NAME = "habits-together-v2"
const urlsToCache = ["/manifest.json", "/icon.svg", "/favicon.svg"]

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache static assets, ignoring failures for dynamic routes
      return cache.addAll(urlsToCache).catch((error) => {
        console.log("SW: Cache addAll failed, but continuing:", error)
        return Promise.resolve()
      })
    }),
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Fetch from cache first, then network
self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") {
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    }),
  )
})

// Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("SW: Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim()
    })
  )
})
