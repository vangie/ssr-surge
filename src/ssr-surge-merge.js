/**
 * @name SSR Surge Merge
 * @file ssr-surge-merge.js
 * @description SSR Surge Merge
 * @author vangie
 * @version 1.0.0
 * @requires lib/cache.js
 * @requires lib/http.js
 **/

import { cache, addPreCacheUrl } from "./lib/cache";
import { request, extractURL, reqOpt, respSuccess, respError } from "./lib/http";

// extract url params from request url
const { query: {
    url: urls = []
} = {} } = extractURL($request.url);

Promise.all(urls.map(url => url.trim()).map(async url => {
    let proxies = cache.get(url);

    if (proxies === undefined) {
        const { data } = await request.get(reqOpt(url));
        cache.set(url, data, 3600);
        proxies = data;
    } else {
        console.log(`read data of ${url} from cache.`);
    }

    addPreCacheUrl(url, cache);

    return proxies.trim();
}))
    .then(proxies => $done(respSuccess(proxies.join('\n'))))
    .catch(error => $done(respError(error)));
