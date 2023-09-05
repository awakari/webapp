const Events = {}

Events.enableSound = function () {
    Events.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    Events.audioSnd = new Audio("/web/sound-msg-new.mp3");
    Events.audioSrc = Events.audioCtx.createMediaElementSource(Events.audioSnd);
    Events.audioSrc.connect(Events.audioCtx.destination);
}

Events.LongPoll = function (subId, evtsHistory) {
    const userEmail = sessionStorage.getItem("userEmail");
    const optsReq = {
        method: "GET",
        headers: {
            "X-Awakari-User-Id": userEmail,
        },
        timeout: 9_000_000, // 15 min
    }
    return fetch(`/v1/events/${subId}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            console.log(`Read subscription ${subId} events response data: ${JSON.stringify(data)}`);
            if (data != null && data.hasOwnProperty("msgs")) {
                if (data.msgs.length > 0 && Events.hasOwnProperty("audioSnd")) {
                    Events.audioSnd.play();
                }
                for (const evt of data.msgs) {
                    evtsHistory.push(evt);
                }
                Events.PutLocalHistory(subId, evtsHistory);
            }
        })
        .catch(err => {
            console.error(err);
        })
};

Events.GetLocalHistory = function (subId) {
    let evtsHistoryTxt = localStorage.getItem(subId);
    if (evtsHistoryTxt == null) {
        evtsHistoryTxt = "[]";
    }
    return JSON.parse(evtsHistoryTxt);
}

Events.PutLocalHistory = function (subId, evts) {
    localStorage.setItem(subId, JSON.stringify(evts));
}
