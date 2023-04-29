/**
 * @file HTTP
 * @description HTTP support for SSR Surge
 * @author vangie
 * @version 1.0.0
 **/

/**
 * Promise based http client
 * @type {object}
 * @example
 * request.get('https://example.com')
 * // => Promise
 * request.get( { url: 'https://example.com', headers: { 'User-Agent': 'Surge' } })
 * // => Promise
 **/
export const request = ['get', 'post', 'put', 'delete', 'head', 'options', 'patch'].reduce((req, method) => {
    req[method] = (url_or_options) => {
        return new Promise((resolve, reject) => {
            $httpClient[method](url_or_options, (error, response, data) => {
                if (error) {
                    reject(error);
                } else {
                    if (response.status === 200) {
                        resolve({ response, data });
                    } else {
                        reject({ response, data });
                    }
                }
            });
        });
    };
    return req;
}, {});

/**
 * Extract path and query from url
 * @param {string} url
 * @returns {object}
 * @example
 * extractURL('https://example.com/path/to?query=1&query=2')
 * // => { path: '/path/to', query: { query: ['1', '2'] } }
 * extractURL('https://example.com/path/to')
 * // => { path: '/path/to', query: {} }
 * extractURL('https://example.com/path/to?query=1&query=2#hash')
 * // => { path: '/path/to', query: { query: ['1', '2'] }, hash: '#hash' }
 * extractURL('https://example.com/path/to#hash')
 * // => { path: '/path/to', query: {}, hash: '#hash' }
 * extractURL('https://example.com/path/to?query=1&query=2#hash?query=3')
 * // => { path: '/path/to', query: { query: ['1', '2'] }, hash: '#hash?query=3' }
 **/
export function extractURL(url) {
    const [_, domain, path, queryStr = '', hash = ''] = url.match(/^https?:\/\/([^/]+)(.+?)(\?[^#]*)?(#.*)?$/);
    const query = parseQueryString(queryStr);

    return {
        domain,
        path,
        query,
        hash
    };
}

/**
 *  Parse query string
 * @param {string} queryStr
 * @returns {object}
 * @example
 * parseQueryString('?a=1&b=2&c=3')
 * // => { a: ['1'], b: ['2'], c: ['3'] }
 * parseQueryString('?a=1&b=2&c=3&a=4')
 * // => { a: ['1', '4'], b: ['2'], c: ['3'] }
 **/
function parseQueryString(queryStr) {
    return (queryStr.substring(1) || "").split("&").reduce((query, param) => {
        const [name, value = ''] = param.split('=').map(decodeURIComponent);
        name && (query[name] = query[name] || []).push(value);
        return query;
    }, {});
}

/**
 * Prepare request options
 * @param {string} url
 * @returns {object}
 * @example
 * reqOpt('https://example.com')
 * // => { url: 'https://example.com' }
 * reqOpt('https://sub.store/example.com')
 * // => { url: 'https://sub.store/example.com', 'policy-descriptor': 'dummyProxy=socks5,localhost,6153' }
 * reqOpt('https://ssr.surge/example.com')
 * // => { url: 'https://ssr.surge/example.com', 'policy-descriptor': 'dummyProxy=socks5,localhost,6153' }
 **/
export function reqOpt(url) {
    const { domain } = extractURL(url);
    const option = { url };
    if (['sub.store', 'ssr.surge'].includes(domain)) {
        option["policy-descriptor"] = 'dummyProxy=socks5,localhost,6153';
    }
    return option;
}

/**
 * Prepare error response for Surge
 * @param {object} error
 * @returns {object}
 * @example
 * respError({ message: 'error' })
 * // => { response: { status: 500, body: '{\n  "message": "error"\n}' } }
 **/
export function respError(error) {
    return {
        response: {
            status: 500,
            body: JSON.stringify(error, null, 2)
        }
    };
}

/**
 * Prepare success response for Surge
 * @param {string} body
 * @returns {object}
 * @example
 * respSuccess('success')
 * // => { response: { status: 200, headers: { "content-type": "text/plain;charset=utf-8" }, body: 'success' } }
 * respSuccess(JSON.stringify({ message: 'success' }))
 * // => { response: { status: 200, headers: { "content-type": "text/plain;charset=utf-8" }, body: '{\n  "message": "success"\n}' } }
 **/
export function respSuccess(body) {
    return {
        response: {
            status: 200,
            headers: {
                "content-type": "text/plain;charset=utf-8"
            },
            body
        }
    };
}
