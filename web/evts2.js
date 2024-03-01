const Events = {
    abortController: new AbortController(),
}

const timeout = setTimeout(() => {
    Events.abortController.abort();
}, 900_000); // 15 minutes

Events.longPoll = function (subId) {
    let authToken = localStorage.getItem(keyAuthToken);
    let userId = localStorage.getItem(keyUserId);
    let optsReq = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
        },
    };
    return fetch(`/v1/events/${subId}`, optsReq)
        .then(resp => {
            clearTimeout(timeout);
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            console.log(`Read subscription ${subId} events response data: ${JSON.stringify(data)}`);
            if (data != null && data.hasOwnProperty("msgs") && data.msgs.length > 0) {
                return data.msgs;
            }
        });
};
