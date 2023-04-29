/**
 * @file Cache
 * @description Cache for SSR Surge
 * @author vangie
 * @version 1.0.0
 **/

/**
 * Cache class
 * @param {string} cacheKey
 * @example
 * const cache = new Cache('cacheKey');
 **/
export class Cache {
    constructor(cacheKey) {
        this.cacheKey = cacheKey;
        this.cacheData = null;
        this.readCache();
    }

    /**
     * Set cache
     * @param {string} key
     * @param {any} value
     * @param {number} ttl - Time to live in seconds
     **/
    set(key, value, ttl = -1) {
        this.cacheData[key] = {
            value,
            ttl,
            timestamp: timestamp(),
        };
        this.writeCache();
    }

    /**
     * Get cache
     * @param {string} key
     * @param {any} defaultValue
     * @returns {any}
     **/
    get(key, defaultValue = undefined) {
        const data = this.cacheData[key];
        if (data) {
            if (data.ttl > 0 && timestamp() >= data.timestamp + data.ttl) {
                delete this.cacheData[key];
                this.writeCache();
                return defaultValue;
            }
            return data.value;
        }
        return defaultValue;
    }

    /**
     * Delete cache
     * @param {string} key
     * @returns {boolean} - Whether the key existed
     **/
    del(key) {
        const existed = this.cacheData.hasOwnProperty(key);
        delete this.cacheData[key];
        this.writeCache();
        return existed;
    }

    /**
     * Check if cache exists
     * @param {string} key
     * @returns {boolean}
     **/
    exist(key) {
        const data = this.cacheData[key];
        if (data) {
            if (data.ttl > 0 && timestamp() >= data.timestamp + data.ttl) {
                this.del(key);
                return false;
            }
            return true;
        }
        return false;
    }

    /**
     * Clear cache
     * @returns {void}
     **/
    clear() {
        this.cacheData = {};
        this.writeCache();
    }

    readCache() {
        if (!this.cacheData) {
            const payload = $persistentStore.read(this.cacheKey);
            this.cacheData = payload ? JSON.parse(payload) : {};
        }
    }

    writeCache() {
        $persistentStore.write(JSON.stringify(this.cacheData), this.cacheKey);
    }
}

/**
 * Add url to precache list
 * @param {string} url
 * @param {Cache} cache
 * @returns {void}
 * @example
 * addPreCacheUrl('https://example.com', cache);
 * addPreCacheUrl('https://example.com', new Cache('cacheKey'));
 **/
export function addPreCacheUrl(url, cache) {
    const urls = cache.get("urls", []);
    let found = false;
    for (let i = 0; i < urls.length; i++) {
        if (urls[i].url === url) {
            urls[i] = {
                url,
                timestamp: timestamp(),
            };
            found = true;
            break;
        }
    }
    if (!found) {
        urls.push({
            url,
            timestamp: timestamp(),
        });
    }
    cache.set("urls", urls, -1);
}

export const cache = new Cache("ssr-surge");

/**
 * Get precache urls
 * @param {Cache} cache
 * @returns {string[]}
 * @example
 * getPreCacheUrls(cache);
 * getPreCacheUrls(new Cache('cacheKey'));
 **/
export function getPreCacheUrls(cache) {
    const urls = cache.get("urls", []).filter(u => u.timestamp + 3600 >= timestamp());
    cache.set("urls", urls, -1);
    return urls.map(u => u.url);
}

export function timestamp() {
    return Math.floor(Date.now() / 1000);
}