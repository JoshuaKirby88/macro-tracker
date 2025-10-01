/* eslint-disable no-undef */
/*
  Onigiri PWA Service Worker
  - Uses Workbox to cache static assets and pages
  - Provides an offline fallback for navigations
  - Safe defaults for Next.js apps
*/

const VERSION = "v1"
const CACHE_PREFIX = "onigiri"
const OFFLINE_HTML = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Onigiri — Offline</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#111111">
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0; padding: calc(env(safe-area-inset-top) + 2rem) 1rem 1rem 1rem;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background: #111; color: #fafafa;
    }
    .card {
      max-width: 640px; margin: 0 auto;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px; padding: 20px;
      backdrop-filter: blur(6px);
    }
    h1 { font-size: 1.25rem; margin: 0 0 .25rem 0; }
    p { opacity: .85; line-height: 1.5; margin: .5rem 0 0 0; }
    a { color: #9ae6b4; text-decoration: underline; }
    .muted { opacity: .7; font-size: .9rem; }
  </style>
</head>
<body>
  <main class="card">
    <h1>You're offline</h1>
    <p>Onigiri can't reach the network right now. You'll see cached content where available.</p>
    <p class="muted">Try again when you have a connection. <a href="/">Go home</a></p>
  </main>
</body>
</html>
`

// Try to load Workbox from CDN.
self.__WB_DISABLE_DEV_LOGS = true
try {
	importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js")
} catch (_) {
	// no-op, fallback will be used below if workbox isn't available
}

const enableNavigationPreload = async () => {
	if (self.registration && self.registration.navigationPreload) {
		try {
			await self.registration.navigationPreload.enable()
		} catch (_) {
			// ignore
		}
	}
}

self.addEventListener("activate", (event) => {
	event.waitUntil(enableNavigationPreload())
})

self.addEventListener("message", (event) => {
	if (!event.data) return
	if (event.data === "SKIP_WAITING" || event.data?.type === "SKIP_WAITING") {
		self.skipWaiting()
	}
})

if (self.workbox) {
	// Workbox configuration
	workbox.setConfig({ debug: false })
	workbox.core.setCacheNameDetails({
		prefix: CACHE_PREFIX,
		suffix: VERSION,
		precache: "precache",
		runtime: "runtime",
	})

	workbox.core.skipWaiting()
	workbox.core.clientsClaim()

	// In case a build step injects precache manifest in the future.
	workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || [])

	// Cache Next.js build assets with Cache First (immutable)
	workbox.routing.registerRoute(
		({ url }) => url.pathname.startsWith("/_next/static/"),
		new workbox.strategies.CacheFirst({
			cacheName: `${CACHE_PREFIX}-${VERSION}-next-static`,
			plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }), new workbox.expiration.ExpirationPlugin({ maxEntries: 200, purgeOnQuotaError: true })],
		}),
	)

	// Static resources: scripts, styles, workers -> Stale-While-Revalidate
	workbox.routing.registerRoute(
		({ request }) => ["script", "style", "worker"].includes(request.destination),
		new workbox.strategies.StaleWhileRevalidate({
			cacheName: `${CACHE_PREFIX}-${VERSION}-static-resources`,
			plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }), new workbox.expiration.ExpirationPlugin({ maxEntries: 200, purgeOnQuotaError: true })],
		}),
	)

	// Fonts: Google and local -> Cache First, long TTL
	workbox.routing.registerRoute(
		({ url, request }) => request.destination === "font" || url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
		new workbox.strategies.CacheFirst({
			cacheName: `${CACHE_PREFIX}-${VERSION}-fonts`,
			plugins: [
				new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
				new workbox.expiration.ExpirationPlugin({
					maxEntries: 60,
					maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
					purgeOnQuotaError: true,
				}),
			],
		}),
	)

	// Images -> Stale-While-Revalidate or Cache First with cap
	workbox.routing.registerRoute(
		({ request }) => request.destination === "image",
		new workbox.strategies.StaleWhileRevalidate({
			cacheName: `${CACHE_PREFIX}-${VERSION}-images`,
			plugins: [
				new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
				new workbox.expiration.ExpirationPlugin({
					maxEntries: 150,
					maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
					purgeOnQuotaError: true,
				}),
			],
		}),
	)

	// App shell pages / navigations -> Network First with fallback to cache/offline
	workbox.routing.registerRoute(
		({ request }) => request.mode === "navigate",
		new workbox.strategies.NetworkFirst({
			cacheName: `${CACHE_PREFIX}-${VERSION}-pages`,
			networkTimeoutSeconds: 3,
			plugins: [
				new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
				new workbox.expiration.ExpirationPlugin({
					maxEntries: 50,
					maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
					purgeOnQuotaError: true,
				}),
			],
		}),
	)

	// PWA metadata and icons -> SWR for freshness
	workbox.routing.registerRoute(
		({ url }) => url.pathname === "/manifest.webmanifest" || url.pathname === "/favicon.ico" || url.pathname === "/apple-icon.png" || url.pathname.startsWith("/icons/"),
		new workbox.strategies.StaleWhileRevalidate({
			cacheName: `${CACHE_PREFIX}-${VERSION}-pwa-assets`,
			plugins: [new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }), new workbox.expiration.ExpirationPlugin({ maxEntries: 30, purgeOnQuotaError: true })],
		}),
	)

	// Offline fallback for navigations and images
	workbox.routing.setCatchHandler(async ({ event }) => {
		if (event.request.destination === "document") {
			return new Response(OFFLINE_HTML, {
				headers: { "Content-Type": "text/html; charset=UTF-8" },
			})
		}
		if (event.request.destination === "image") {
			// Transparent 1x1 PNG
			const transparentPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
			return new Response(atob(transparentPng), {
				headers: { "Content-Type": "image/png" },
			})
		}
		return Response.error()
	})
} else {
	// Minimal fallback SW without Workbox
	const RUNTIME = `${CACHE_PREFIX}-${VERSION}-runtime`

	self.addEventListener("install", (event) => {
		self.skipWaiting()
	})

	self.addEventListener("activate", (event) => {
		event.waitUntil(
			(async () => {
				const keys = await caches.keys()
				await Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX) && !k.endsWith(VERSION)).map((k) => caches.delete(k)))
				if (self.clients && self.clients.claim) await self.clients.claim()
				await enableNavigationPreload()
			})(),
		)
	})

	self.addEventListener("fetch", (event) => {
		const req = event.request

		// Handle navigations: Network first, then cache, then offline HTML
		if (req.mode === "navigate") {
			event.respondWith(
				(async () => {
					try {
						const preload = await event.preloadResponse
						if (preload) return preload
						const network = await fetch(req)
						const cache = await caches.open(RUNTIME)
						cache.put(req, network.clone())
						return network
					} catch {
						const cache = await caches.open(RUNTIME)
						const cached = await cache.match(req)
						if (cached) return cached
						return new Response(OFFLINE_HTML, {
							headers: { "Content-Type": "text/html; charset=UTF-8" },
						})
					}
				})(),
			)
			return
		}

		// Static resources: Stale-While-Revalidate
		if (["style", "script", "worker"].includes(req.destination) || req.url.includes("/_next/static/")) {
			event.respondWith(
				(async () => {
					const cache = await caches.open(RUNTIME)
					const cached = await cache.match(req)
					const networkPromise = fetch(req)
						.then((res) => {
							cache.put(req, res.clone())
							return res
						})
						.catch(() => undefined)
					return cached || (await networkPromise) || fetch(req)
				})(),
			)
			return
		}

		// Images: Cache First with cap
		if (req.destination === "image") {
			event.respondWith(
				(async () => {
					const cache = await caches.open(RUNTIME)
					const cached = await cache.match(req)
					if (cached) return cached
					try {
						const res = await fetch(req)
						cache.put(req, res.clone())
						return res
					} catch {
						return new Response("", { status: 504 })
					}
				})(),
			)
		}
	})
}
