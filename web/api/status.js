const Status = {};

Status.fetchAttributeTypes = function (headers) {
    const optsReq = {
        method: "GET",
        cache: "default",
        headers: headers,
    };
    return fetch(`https://metrics.awakari.com/v1/attr/types`, optsReq)
        .then(resp => handleCookieAuth(resp, headers, (h) => Status.fetchAttributeTypes(h)));
}

Status.fetchAttributeValues = function (name, headers) {
    return fetch(`https://metrics.awakari.com/v1/attr/values/${name}`, {
        method: "GET",
        cache: "default",
        headers: headers,
    })
        .then(resp => handleCookieAuth(resp, headers, (h) => Status.fetchAttributeValues(name, h)));
}
