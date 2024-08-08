const Events = {
    abortController: new AbortController(),
}

// uuidv4
Events.newId = function () {
    return Ksuid.generate();
}

Events.publishInternal = function (payload, headers) {
    return fetch("/v1/pub/internal", {
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
    return fetch("/v1/pub", {
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
    return fetch(`https://reader.awakari.com/v1/evt/${id}`, {
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
