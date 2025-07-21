

@@ -1 +1,25 @@


const CACHE_NAME = 'garde-cache-v1';


const urlsToCache = [


  '/',


  '/index.html',


  '/style.css',


  '/manifest.json',


  '/icon-192.png',


  '/icon-512.png',


  '/service-worker.js'


];





self.addEventListener('install', event => {


  event.waitUntil(


    caches.open(CACHE_NAME)


      .then(cache => cache.addAll(urlsToCache))


  );


});





self.addEventListener('fetch', event => {


  event.respondWith(


    caches.match(event.request)


      .then(response => response || fetch(event.request))


  );


});
