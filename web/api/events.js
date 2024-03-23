const Events = {
    abortController: new AbortController(),
}

Events.longPoll = function (subId, deadline) {
    const headers = getAuthHeaders();
    let optsReq = {
        method: "GET",
        headers: headers,
    };
    const timeout = deadline - Date.now();
    return fetch(`/v1/events/${subId}`, optsReq)
        .then(resp => {
            clearTimeout(setTimeout(() => {
                Events.abortController.abort();
            }, timeout));
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .catch(e => {
            console.log(e);
            return null;
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("msgs") && data.msgs.length > 0) {
                console.log(`Read subscription ${subId}: got ${data.msgs.length} new events`);
                return data.msgs;
            } else {
                console.log(`Read subscription ${subId}: no new events`);
                return null;
            }
        });
};

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
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })
        .then(_ => {
            return true;
        })
        .catch(err => {
            alert(err);
            return false;
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
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })

}