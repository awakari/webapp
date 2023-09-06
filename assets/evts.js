const Events = {
    abortController: new AbortController(),
    audioEnabled: false,
}

const timeout = setTimeout(() => {
   Events.abortController.abort();
}, 9_000_000);

Events.toggleAudio = function () {
    if (Events.audioEnabled) {
        Events.audioEnabled = false;
        document.getElementById("img_toggle_audio").src = "/web/notifications-off.svg";
    } else {
        Events.audioEnabled = true;
        document.getElementById("img_toggle_audio").src = "/web/notifications-on.svg";
        Events.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        Events.audioSnd = new Audio("/web/inbox-notification.wav");
        Events.audioSrc = Events.audioCtx.createMediaElementSource(Events.audioSnd);
        Events.audioSrc.connect(Events.audioCtx.destination);
    }
};

Events.longPoll = function (subId) {
    const userEmail = sessionStorage.getItem("userEmail");
    const optsReq = {
        method: "GET",
        headers: {
            "X-Awakari-User-Id": userEmail,
        },
        cache: "no-cache",
        keepalive: true,
        signal: Events.abortController.signal,
    }
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
                let evtsHistory = Events.getLocalHistory(subId);
                for (const evt of data.msgs) {
                    evtsHistory.push(evt);
                }
                Events.putLocalHistory(subId, evtsHistory);
                if (Events.audioEnabled) {
                    return Events.audioSnd.play();
                }
            }
        })
        .catch(err => {
            console.error(err);
        })
};

Events.getLocalHistory = function (subId) {
    let evtsHistoryTxt = localStorage.getItem(subId);
    if (evtsHistoryTxt == null) {
        evtsHistoryTxt = "[]";
    }
    return JSON.parse(evtsHistoryTxt);
}

Events.putLocalHistory = function (subId, evts) {
    localStorage.setItem(subId, JSON.stringify(evts));
}

Events.delete = function (subId, evtId) {
    let evtsHistory = Events.getLocalHistory(subId);
    for (let i = 0; i < evtsHistory.length; i++) {
        if (evtsHistory[i].id === evtId) {
            evtsHistory.splice(i, 1)
        }
    }
    Events.putLocalHistory(subId, evtsHistory);
    return evtsHistory;
}
