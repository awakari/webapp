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
    return fetch(`${Metrics.urlBase}/v1/attr/values/${name}`, {
        method: "GET",
        cache: "default",
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
