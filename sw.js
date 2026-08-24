/* MosbyFit · service worker
   Estrategia: red primero, caché de respaldo.
   - Con señal: siempre trae la versión más nueva. Las actualizaciones se aplican solas.
   - Sin señal: sirve la última copia guardada. La app abre igual en el gimnasio.
   Este archivo no necesita cambiar cuando actualices index.html. Se sube una sola vez. */

const CACHE = 'mosbyfit';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  e.respondWith((async () => {
    try {
      const red = await fetch(req);
      if (red && red.ok) {
        const c = await caches.open(CACHE);
        c.put(req, red.clone());
      }
      return red;
    } catch (err) {
      const guardado = await caches.match(req);
      if (guardado) return guardado;
      if (req.mode === 'navigate') {
        const raiz = await caches.match('./') || await caches.match('./index.html');
        if (raiz) return raiz;
      }
      throw err;
    }
  })());
});
