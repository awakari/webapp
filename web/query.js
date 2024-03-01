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
    getQuerySubscription(q)
        .then(subId => {
            if (subId !== "") {
                startEventsLoading(subId);
            }
        })
}

function getQuerySubscription(q) {
    const authToken = localStorage.getItem(keyAuthToken);
    const userId = localStorage.getItem(keyUserId);
    const headers = {
        "Authorization": `Bearer ${authToken}`,
        "X-Awakari-Group-Id": defaultGroupId,
        "X-Awakari-User-Id": userId,
    }
    let optsReq = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
        },
    }
    return fetch(`/v1/sub?limit=1000`, optsReq)
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            }
            resp.text().then(errMsg => console.error(errMsg));
            throw new Error(`Failed to create a new subscription: ${resp.status}`);
        })
        .then(data => {
            if (data && data.subs) {
                for (let sub of data.subs) {
                    if (sub.description === q) {
                        return sub.id;
                    }
                }
                return createSubscription(q, headers);
            } else {
                return createSubscription(q, headers);
            }
        })
        .catch(err => {
            alert(err);
            return "";
        })
}

function createSubscription(q, headers) {
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
    let optsReq = {
        method: "POST",
        headers: headers,
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

let queryRunning = false;

function queryStop() {
    queryRunning = false;
    document.getElementById("events-menu").style.display = "none";
    document.getElementById("events").innerHTML = "";
}

async function startEventsLoading(subId) {
    document.getElementById("events-menu").style.display = "flex";
    queryRunning = true;
    try {
        while (queryRunning) {
            console.log(`Long poll events for ${subId}...`);
            await Events
                .longPoll(subId)
                .then(evts => {
                    displayEvents(evts)
                });
            console.log(`Long poll events for ${subId} done`);
        }
    } catch (e) {
        console.log(`Events loading error ${subId}: ${e}`);
    } finally {
        alert(`Stopped events loading for ${subId}`);
        queryStop();
    }
}

const templateEvent = (evt) => `
    <div class="p-1 shadow-xs border hover:bg-white">
        <p class="font-mono text-slate-600 dark:text-slate-300 text-xs">
            ${evt.attributes.hasOwnProperty("time") ? evt.attributes.time.ce_timestamp : (new Date().toISOString())}
        </p>
        <p class="truncate w-80 sm:w-[624px] text-gray-700 dark:text-gray-200 hover:text-blue-500">
            <a href="${evt.source}" target="_blank"> 
                ${evt.attributes.hasOwnProperty("title") ? evt.attributes.title.ce_string : (evt.attributes.hasOwnProperty("summary") ? evt.attributes.summary.ce_string : (evt.text_data != null ? evt.text_data : ""))}
            </a>
        </p>
    </div>
`

function displayEvents(evts) {
    let elemEvts = document.getElementById("events");
    for (let evt of evts) {
        if (elemEvts.childElementCount === 10) {
            elemEvts.removeChild(elemEvts.lastChild);
        }
        elemEvts.innerHTML = templateEvent(evt) + elemEvts.innerHTML;
    }
}
