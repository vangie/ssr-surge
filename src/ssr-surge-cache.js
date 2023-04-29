/**
 * @name SSR Surge Cache
 * @description Update cache of ssr-surge
 * @file ssr-surge-cache.js
 * @author vangie
 * @version 1.0.0
 * @requires lib/cache.js
 * @requires lib/http.js
 **/

import { cache, getPreCacheUrls } from "./lib/cache";
import { request, reqOpt } from "./lib/http";

Promise.all(getPreCacheUrls(cache).map(async url => {
    console.log(`${new Date().toUTCString()} updating cache of ${url}.`);
    const { data } = await request.get(reqOpt(url));
    cache.set(url, data, 3600);
    console.log(`${new Date().toUTCString()} update response of ${url} to cache.`);
})).catch(error => {
    console.log(`${new Date().toUTCString()} update cache failed.`);
    console.log(JSON.stringify(error, null, 2));
}).finally(() => {
    $done();
});