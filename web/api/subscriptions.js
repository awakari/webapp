const Subscriptions = {};

Subscriptions.fetchListPage = function (cursor, order, limit, filter, headers) {
    return fetch(`/v1/sub?limit=${limit}&cursor=${cursor}&order=${order}&filter=${encodeURIComponent(filter)}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => {
            if (!resp.ok) {
                handleResponseStatus(resp.code);
                return null;
            }
            return resp.json();
        })
}

Subscriptions.delete = function (id, headers) {
    let optsReq = {
        method: "DELETE",
        headers: headers,
    };
    return fetch(`/v1/sub/${id}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                handleResponseStatus(resp.status);
                return false;
            }
            return true;
        });
}

Subscriptions.createResponse = function (descr, enabled, expires, cond, headers) {
    const payload = {
        description: descr,
        enabled: enabled,
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

Subscriptions.create = function (descr, enabled, expires, cond, headers) {
    return Subscriptions
        .createResponse(descr, enabled, expires, cond, headers)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                handleResponseStatus(resp.status);
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
                handleResponseStatus(resp.status);
                return null;
            }
            return resp.json();
        })
}

Subscriptions.update = function (id, descr, enabled, expires, cond, headers) {
    const payload = {
        id: id,
        description: descr,
        enabled: enabled,
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
                handleResponseStatus(resp.status);
            }
            return resp.json();
        });
}
