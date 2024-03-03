const Events = {
    abortController: new AbortController(),
}

Events.longPoll = function (subId, deadline) {
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
