// PaniTrack Service Worker - 100% Offline PWA Mode
const CACHE_NAME = 'panitrack-cache-v1';

// Fichiers de base indispensables au démarrage
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Installation : Mise en cache initiale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PaniTrack SW] Pré-mise en cache des fichiers de base');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[PaniTrack SW] Suppression ancien cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Stratégie de capture réseau / cache
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignorer les requêtes non-GET et les requêtes spécifiques à Vite HMR ou Chrome extensions
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.protocol.startsWith('chrome-extension') || url.pathname.includes('/@vite/') || url.pathname.includes('/@react-refresh')) {
    return;
  }

  // 1. Pour la navigation de page principale (ex: rechargement hors-ligne)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Mise en cache de la page fraîche
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return networkResponse;
        })
        .catch(() => {
          // Si hors-ligne : servir immédiatement index.html depuis le cache
          return caches.match('/index.html').then((fallback) => {
            return fallback || caches.match('/');
          });
        })
    );
    return;
  }

  // 2. Pour les assets (JS, CSS, polices, SVG, images) : Cache First avec mise à jour en tâche de fond
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Renvoyer immédiatement le cache
        // et lancer une mise à jour silencieuse en arrière-plan si en ligne
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
          })
          .catch(() => {
            // Hors-ligne silencieux, rien à faire
          });
        return cachedResponse;
      }

      // Si pas encore en cache, aller chercher sur le réseau et stocker
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            return networkResponse;
          }
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return networkResponse;
        })
        .catch(() => {
          // Si hors-ligne et non trouvé, tentative de repli vers index.html pour les ressources texte
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
