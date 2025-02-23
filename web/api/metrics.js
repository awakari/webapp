const Metrics = {
    urlBase: "https://metrics.awakari.com",
};

Metrics.fetchAttributeTypes = function (headers) {
    const optsReq = {
        method: "GET",
        cache: "default",
        headers: headers,
    };
    return fetch(`${Metrics.urlBase}/v1/attr/types`, optsReq)
        .then(resp => handleCookieAuth(resp, headers, (h) => Metrics.fetchAttributeTypes(h)));
}

Metrics.fetchAttributeValues = function (name, headers) {
    let cache = "force-cache";
    if (navigator.userAgent.toLowerCase().indexOf('firefox') === -1 && name === "language") {
        cache = "no-cache"; // workaround for chrome
    }
    return fetch(`${Metrics.urlBase}/v1/attr/values/${name}`, {
        method: "GET",
        cache: cache,
        headers: headers,
    })
        .then(resp => handleCookieAuth(resp, headers, (h) => Metrics.fetchAttributeValues(name, h)));
}

Metrics.loadStatusPartWithRetry = function(headers, part) {
    return fetch(`${Metrics.urlBase}/v1/public/${part}`, {
        method: "GET",
        cache: "default",
        headers: headers,
    })
        .then(resp => handleCookieAuth(resp, headers, (h) => Metrics.loadStatusPartWithRetry(h, part)))
}

Metrics.fetchSourceCount = function (headers, type){
    return fetch(`${Metrics.urlBase}/v1/src/${type}`, {
        method: "GET",
        cache: "default",
        headers: headers,
    })
        .then(resp => handleCookieAuth(resp, headers, (h) => Metrics.fetchSourceCount(h, type)))
}
