const Events = {};

Events.Load = function (subId, evtsHistory) {
    const userEmail = sessionStorage.getItem("userEmail");
    const optsReq = {
        method: "GET",
        headers: {
            "X-Awakari-User-Id": userEmail,
        },
    }
    return fetch(`/v1/events/${subId}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("msgs")) {
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
