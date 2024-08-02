const Events = {
    abortController: new AbortController(),
}

// uuidv4
Events.newId = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
