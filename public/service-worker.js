var CACHE = `budget-site-cache`;
const DATA_CACHE = `budget-site-data-cache`;

var URLS_TO_CACHE = [
	`/`,
	`/index.html`,
	`/db.js`,
	`/styles.css`,
	`/manifest.json`,
	`/index.js`,
	`/icons/icon-192x192.png`,
	`/icons/icon-512x512.png`,
];

self.addEventListener(`install`, function (event) {
	event.waitUntil(
		caches.open(CACHE).then(function (cache) {
			return cache.addAll(URLS_TO_CACHE);
		})
	);
});

self.addEventListener(`fetch`, function (event) {
	if (event.request.url.includes(`/api/`)) {
            console.log(`[Service Worker] Fetch (data)`, event.request.url);
            event.respondWith(caches.open(DATA_CACHE).then(function (cache) {
                  return fetch(event.request).then(function (response) {
                        cache.put(event.request.url, response.clone());
                        return response;
                  }).catch(err => {
                  return cache.match(event.request);
                })
            }).catch(err => console.log(err)));
		return;
	}

    event.respondWith(
        fetch(event.request).catch(function () {
                return caches.match(event.request).then(function (response) {
                    if (response) {
                            return response;
                    } else if (event.request.headers.get(`accept`).includes(`text/html`)) {
                            return caches.match(`/`);
                    }
                }

            )
        })
    )
});