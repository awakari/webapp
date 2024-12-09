const Sources = {
    urlBase: "https://pub.awakari.com"
};

Sources.fetchListPageResponse = function (type, own, order, limit, filter, headers, subId) {
    return fetch(`${Sources.urlBase}/v1/src/${type}/list?&own=${own}&order=${order}&limit=${limit}&filter=${filter}&subId=${subId}`, {
        method: "GET",
        headers: headers,
        cache: "default",
    });
}

Sources.fetch = function (typ, addrEnc, headers) {
    headers["X-Awakari-Src-Addr"] = addrEnc;
    return fetch(`${Sources.urlBase}/v1/src/${typ}`, {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                handleResponseStatus(`Get source ${addrEnc}`, resp.status);
                return null;
            }
            return resp;
        });
}

Sources.delete = function (typ, addrEnc, headers) {
    headers["X-Awakari-Src-Addr"] = addrEnc;
    return fetch(`${Sources.urlBase}/v1/src/${typ}`, {
        method: "DELETE",
        headers: headers,
    })
        .then(resp => {
            if (resp.ok) {
                return resp;
            }
            handleResponseStatus(`Delete source ${addrEnc}`, resp.status);
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
    return fetch(`${Sources.urlBase}/v1/src/${srcType}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
    });
}
