function queryType() {
    if (document.getElementById('query').value === '') {
        document.getElementById('login').style.display='none';
    }
}

function querySubmit() {
    const q = document.getElementById('query').value;
    if (q === '') {
        document.getElementById('login').style.display = 'none';
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
    alert(`Run query: ${q}`);
    // createQuerySubscription(q)
    //     .then(subId => {
    //
    //     })
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

async function startEventsLoading(subId) {
    if (!eventsLoadingRunning) {
        eventsLoadingRunning = true;
        try {
            while (true) {
                console.log(`Long poll events for ${subId}...`);
                await Events
                    .longPoll(subId)
                    .finally(_ => {
                        let evtsHistory = Events.getLocalHistory(subId);
                        displayEvents(subId, evtsHistory)
                    });
                console.log(`Long poll events for ${subId} done`);
            }
        } finally {
            console.log(`Stop events loading for ${subId}`);
            eventsLoadingRunning = false;
        }
    }
}
