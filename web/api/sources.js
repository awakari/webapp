const Sources = {};

Sources.fetchListPage = function (type, own, order, limit, filter, headers) {
    return fetch(`/v1/src/${type}/list?&own=${own}&order=${order}&limit=${limit}&filter=${filter}`, {
        method: "GET",
        headers: headers,
        cache: "force-cache",
    });
}

Sources.fetch = function (typ, addrEnc, headers) {
    headers["X-Awakari-Src-Addr"] = addrEnc;
    return fetch(`/v1/src/${typ}`, {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        });
}

Sources.delete = function (typ, addrEnc, headers) {
    headers["X-Awakari-Src-Addr"] = addrEnc;
    return fetch(`/v1/src/${typ}`, {
        method: "DELETE",
        headers: headers,
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp;
        })
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
    });
}