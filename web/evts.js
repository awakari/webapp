const Events = {
    abortController: new AbortController(),
}

Events.longPoll = function (subId, deadline) {
    Events.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    Events.audioSnd = new Audio("inbox-notification.wav");
    Events.audioSrc = Events.audioCtx.createMediaElementSource(Events.audioSnd);
    Events.audioSrc.connect(Events.audioCtx.destination);
    let headers = {
        "X-Awakari-Group-Id": defaultGroupId,
    }
    const authToken = localStorage.getItem(keyAuthToken);
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }
    const userId = localStorage.getItem(keyUserId);
    if (userId) {
        headers["X-Awakari-User-Id"] = userId;
    }
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
                try {
                    Events.audioSnd.play();
                } catch (e) {
                    console.log(e);
                }
                console.log(`Read subscription ${subId}: got ${data.msgs.length} new events`);
                return data.msgs;
            } else {
                console.log(`Read subscription ${subId}: no new events`);
                return null;
            }
        });
};
