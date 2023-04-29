/**
 * @name SSR Surge Converter
 * @file ssr-surge-conv.js
 * @description SSR Surge Converter
 * @author vangie
 * @version 1.0.0
 * @requires lib/cache.js
 * @requires lib/http.js
 **/

import { cache, addPreCacheUrl, timestamp } from "./lib/cache";
import { request, extractURL, reqOpt, respSuccess, respError } from "./lib/http";

const flagRegex = /\p{Regional_Indicator}[\p{Regional_Indicator}\p{Emoji_Modifier_Base}\p{Emoji_Modifier}\u200D\uFE0F]/u;
function getProxyFlag(name) {
    const flags = name.match(flagRegex);
    return flags ? flags[0] : undefined;
}

/**
 * Generate Surge proxies from SSR json
 * @param {string} json
 * @param {string} ssr_bin
 * @returns {string}
 **/
function generateSurgeProxies(json, ssr_bin) {
    let local_port = 21344;
    return JSON.parse(json).map(p => {
        const ip = p.server;
        const args = [
            "-s", ip, "-p", p.port,
            "-k", p.password, "-m", p.cipher,
            "-O", p.protocol, "-G", p["protocol-param"],
            "-o", p.obfs, "-g", p["obfs-param"],
            "-l", ++local_port
        ].map(arg => `args=${arg}`).join(", ");
        const proxy = {
            name: p.name,
            policy: `${p.name}=external, exec=${ssr_bin}, local-port=${local_port}, ${args}, addresses=${ip}`,
            group: getProxyFlag(p.name),
            timestamp: timestamp(),
            latency: Infinity,
        };
        return proxy.line;
    }).join('\n');
}

// extract url params from request url
const { query: {
    url: urls = [],
    ssr_bin = '/opt/homebrew/bin/ssr-local',
} = {} } = extractURL($request.url);

Promise.all(urls.map(url => url.trim()).map(async url => {
    let json = cache.get(url);
    if (json === undefined) {
        const { data } = await request.get(reqOpt(url));
        cache.set(url, data, 3600);
        json = data;
    } else {
        console.log(`read data of ${url} from cache.`);
    }

    addPreCacheUrl(url, cache);

    return generateSurgeProxies(json, ssr_bin);
}))
    .then(proxies => $done(respSuccess(proxies.join('\n'))))
    .catch(error => $done(respError(error)));