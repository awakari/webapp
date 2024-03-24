const Subscriptions = {};

Subscriptions.fetchListPage = function (cursor, order, limit, filter, headers) {
    return fetch(`/v1/sub?limit=${limit}&cursor=${cursor}&order=${order}&filter=${encodeURIComponent(filter)}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Subscriptions list request failed with status: ${resp.status}`);
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
                throw new Error(`Failed to delete the subscription ${id}: ${resp.status}`);
            }
        });
}

Subscriptions.create = function (descr, enabled, expires, cond, headers) {
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
    return fetch(`/v1/sub`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                if (resp.status === 429) {
                    throw new Error("Subscription count limit reached. Please contact awakari@awakari.com and request to increase the limit.");
                } else {
                    throw new Error(`Failed to create a new subscription: ${resp.status}`);
                }
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                return data.id;
            } else {
                throw new Error(`Empty create subscription response`);
            }
        })

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
                throw new Error(`Failed to fetch the subscription ${id}, status: ${resp.status}`);
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
                throw new Error(`Failed to update the subscription ${id}, status: ${resp.status}`);
            }
            return resp.json();
        });
}