const VERSION='tidefall-app-v1';
const SHELL=[
  '/',
  '/offline.html',
  '/styles-all.css',
  '/site-upgrade.css',
  '/app-shell.css',
  '/site-ui.js',
  '/favicon-64.png',
  '/assets/app-icon.svg',
  '/assets/tidefall-mobile-hero.webp'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(VERSION)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==VERSION).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          if(response.ok){
            const copy=response.clone();
            caches.open(VERSION).then(cache=>cache.put(request,copy));
          }
          return response;
        })
        .catch(()=>caches.match(request).then(cached=>cached||caches.match('/offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>{
      if(cached)return cached;
      return fetch(request).then(response=>{
        if(response.ok){
          const copy=response.clone();
          caches.open(VERSION).then(cache=>cache.put(request,copy));
        }
        return response;
      });
    })
  );
});
