const Events = {
    abortController: new AbortController(),
}

const timeout = setTimeout(() => {
    Events.abortController.abort();
}, 9_000_000);

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
                for (const evt of data.msgs) {
                    console.log(evt);
                }
            }
        });
};

function queryType() {
    if (document.getElementById('query').value === '') {
        queryStop();
    }
}

function querySubmit() {
    const q = document.getElementById('query').value;
    if (q === '') {
        queryStop();
    } else {
        const userId = localStorage.getItem(keyUserId);
        switch (userId) {
            case null:
                sessionStorage.setItem("query", q);
                document.getElementById('login').style.display = 'flex';
                break
            default:
                queryRun(q);
        }
    }
}

function queryRun(q) {
    document.getElementById("query").value = q;
    document.getElementById("events-menu").style.display = "flex";
    createQuerySubscription(q)
        .then(subId => {
            if (subId !== "") {
                startEventsLoading(subId);
            }
        })
}

function createQuerySubscription(q) {
    const payload = {
        description: q,
        enabled: true,
        cond: {
            not: false,
            tc: {
                term: q,
            }
        },
    }
    let authToken = localStorage.getItem(keyAuthToken);
    let userId = localStorage.getItem(keyUserId);
    let optsReq = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
        },
        body: JSON.stringify(payload)
    };
    return fetch(`/v1/sub`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to create a new subscription: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                return data.id;
            } else {
                throw new Error(`Empty create subscription response`);
            }
        })
        .catch(err => {
            alert(err);
            return "";
        })
}

let eventsLoadingRunning = false;

async function startEventsLoading(subId) {
    if (!eventsLoadingRunning) {
        eventsLoadingRunning = true;
        try {
            while (true) {
                console.log(`Long poll events for ${subId}...`);
                await Events
                    .longPoll(subId)
                    .catch(err => {
                        console.error(err);
                        break
                    })
                    .finally(_ => {
                        //displayEvents(subId, evtsHistory)
                    });
                console.log(`Long poll events for ${subId} done`);
            }
        } finally {
            console.log(`Stop events loading for ${subId}`);
            eventsLoadingRunning = false;
        }
    }
}

function queryStop() {
    document.getElementById("events-menu").style.display = "none";
    alert("TODO: queryStop");
}

