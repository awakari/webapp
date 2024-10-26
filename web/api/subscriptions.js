const Subscriptions = {};

Subscriptions.fetchListPage = function (cursor, followers, order, limit, filter, ownOnly, headers) {
    return fetch(`/v1/sub?limit=${limit}&cursor=${cursor}&followers=${followers}&sort=FOLLOWERS&order=${order}&filter=${encodeURIComponent(filter)}&public=${!ownOnly}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => {
            if (resp) {
                if (!resp.ok) {
                    handleResponseStatus(`List interests`, resp.status);
                    return null;
                }
                return resp;
            } else {
                return null;
            }
        });
}

Subscriptions.delete = function (id, headers) {
    let optsReq = {
        method: "DELETE",
        headers: headers,
    };
    return fetch(`/v1/sub/${id}`, optsReq)
        .then(resp => {
            if (resp.ok) {
                return resp;
            }
            resp.text().then(errMsg => console.error(errMsg));
            handleResponseStatus(`Delete interest ${id}`, resp.status);
            return null;
        });
}

Subscriptions.createResponse = function (name, descr, expires, isPublic, cond, discoverSourcesFlag, headers) {
    const payload = {
        id: name,
        discover: discoverSourcesFlag,
        description: descr,
        enabled: true,
        public: isPublic,
        cond: cond,
    }
    if (expires) {
        payload.expires = expires.toISOString();
    }
    const optsReq = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
    };
    return fetch(`/v1/sub`, optsReq);
}

Subscriptions.create = function (name, descr, expires, isPublic, cond, discoverSourcesFlag, headers) {
    return Subscriptions
        .createResponse(name, descr, expires, isPublic, cond, discoverSourcesFlag, headers)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                switch (resp.status) {
                    case 429:
                        if (confirm("Usage limit reached. Subscribe in Patreon for an extra access?")) {
                            window.location.open("https://www.patreon.com/c/awakari/membership", "_blank");
                        }
                        break;
                    default:
                        handleResponseStatus(`Create interest ${name}`, resp.status);
                        break;
                }
                return null;
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                return data.id;
            } else {
                return null;
            }
        });
}

Subscriptions.fetch = function (id, headers) {
    const optsReq = {
        method: "GET",
        headers: headers,
        cache: "default",
    }
    return fetch(`/v1/sub/${id}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                handleResponseStatus(`Get interest ${id}`, resp.status);
                return null;
            }
            return resp;
        })
}

Subscriptions.update = function (id, descr, enabled, expires, isPublic, cond, discoverSourcesFlag, headers) {
    const payload = {
        id: id,
        discover: discoverSourcesFlag,
        description: descr,
        enabled: enabled,
        public: isPublic,
        cond: cond,
    }
    if (expires) {
        payload.expires = expires.toISOString();
    }
    const optsReq = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(payload)
    }
    return fetch(`/v1/sub/${id}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg))
                handleResponseStatus(`Update interest ${id}`, resp.status);
                return null;
            }
            return resp;
        });
}
