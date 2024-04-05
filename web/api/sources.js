const Sources = {};

Sources.fetchListPageResponse = function (type, own, order, limit, filter, headers, forceCache) {
    return fetch(`/v1/src/${type}/list?&own=${own}&order=${order}&limit=${limit}&filter=${filter}`, {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => handleCookieAuth(resp, headers, (h) => Sources.fetchListPageResponse(type, own, order, limit, filter, h)));
}

Sources.fetch = function (typ, addrEnc, headers) {
    headers["X-Awakari-Src-Addr"] = addrEnc;
    return fetch(`/v1/src/${typ}`, {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => handleCookieAuth(resp, headers, (h) => Sources.fetch(typ, addrEnc, h)))
        .then(resp => {
            if (!resp.ok) {
                handleResponseStatus(resp.status);
                return null;
            }
            return resp;
        });
}

Sources.delete = function (typ, addrEnc, headers) {
    headers["X-Awakari-Src-Addr"] = addrEnc;
    return fetch(`/v1/src/${typ}`, {
        method: "DELETE",
        headers: headers,
    })
        .then(resp => {
            if (resp.ok) {
                return resp;
            }
            handleResponseStatus(resp.status);
            return null;
        });
}

Sources.add = function (srcType, srcAddr, updFreq, headers) {
    const payload = {
        "limit": {
            "freq": updFreq,
        },
        "src": {
            "addr": srcAddr,
        }
    }
    return fetch(`/v1/src/${srcType}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
    })
        .then(resp => handleCookieAuth(resp, headers, (h) => Sources.add(srcType, srcAddr, updFreq, h)));
}
