function loadQuery() {
    const userId = localStorage.getItem(keyUserId);
    switch (userId) {
        case null:
            document.getElementById('login').style.display = 'flex';
            break
        default:
            const q = new URLSearchParams(window.location.search).get("q");
            if (q != null && q !== "") {
                document.getElementById("query").value = q;
                getQuerySubscription(q)
                    .then(subId => {
                        if (subId !== "") {
                            startEventsLoading(subId);
                        }
                    })
            }
    }
}

const subNameDefault = "_app_reserved";

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
    return fetch(`/v1/sub?limit=1000&filter=${subNameDefault}`, optsReq)
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
                    if (sub.description === subNameDefault) {
                        return deleteSubscription(sub.id, headers)
                            .then(_ => createSubscription(q, headers));
                    }
                }
            }
            return createSubscription(q, headers);
        })
        .catch(err => {
            alert(err);
            return "";
        })
}

function deleteSubscription(id, headers) {
    let optsReq = {
        method: "DELETE",
        headers: headers,
    };
    return fetch(`/v1/sub/${id}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to delete the subscription ${id}: ${resp.status}`);
            }
        })
        .catch(err => {
            alert(err);
        })
}

function createSubscription(q, headers) {
    const payload = {
        description: subNameDefault,
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
    let elemEvents = document.getElementById("events");
    if (elemEvents.innerHTML === "") {
        document.getElementById("events-menu").style.display = "none";
    } else if (confirm("Clear the results?")) {
        document.getElementById("events-menu").style.display = "none";
        elemEvents.innerHTML = "";
    }
}

const timeout = 900_000;

async function startEventsLoading(subId) {
    const deadline = Date.now() + timeout;
    document.getElementById("events-menu").style.display = "flex";
    queryRunning = true;
    try {
        while (queryRunning && Date.now() < deadline) {
            console.log(`Long poll events for ${subId}...`);
            await Events
                .longPoll(subId, deadline)
                .then(evts => displayEvents(evts));
            console.log(`Long poll events for ${subId} done`);
        }
    } catch (e) {
        console.log(`Events loading error ${subId}: ${e}`);
    } finally {
        alert("Search results streaming finished");
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
