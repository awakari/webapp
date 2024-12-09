const Events = {
    abortController: new AbortController(),
    urlBasePub: "https://pub.awakari.com",
    urlBaseMsg: "https://messages.awakari.com"
}

// uuidv4
Events.newId = function () {
    return Ksuid.generate();
}

Events.publishInternal = function (payload, headers) {
    return fetch(`${Events.urlBasePub}/v1/internal`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
    })
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                handleResponseStatus("Publish internal event", resp.status);
                return null;
            }
            return resp;
        });
}

Events.publish = function (payload, headers) {
    return fetch(`${Events.urlBasePub}/v1`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
    })
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                handleResponseStatus("Publish event", resp.status);
                return null;
            }
            return resp;
        });
}

Events.fetch = function (id) {
    return fetch(`${Events.urlBaseMsg}/v1/${id}`, {
        method: "GET",
    }).then(resp => {
        if (!resp.ok) {
            resp.text().then(errMsg => alert(errMsg));
            handleResponseStatus(`Event id ${id}`, resp.status);
            return null;
        }
        return resp;
    });
}

Events.search = function (q) {
    return fetch(`${Events.urlBaseMsg}/v1/search?q=${encodeURIComponent(q)}`, {
        method: "GET",
        cache: "no-cache",
    });
}
