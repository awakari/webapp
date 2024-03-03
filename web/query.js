function loadQuery() {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q != null && q !== "") {
        const userId = localStorage.getItem(keyUserId);
        switch (userId) {
            case null:
                document.getElementById('login').style.display = 'flex';
                break
            default:
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
    let elemEventsMenu = document.getElementById("events-menu");
    if (elemEvents.innerHTML === "") {
        elemEventsMenu.style.display = "none";
    } else if (elemEventsMenu.style.display !== "none" && confirm("Results streaming ended. Clear the results?")) {
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
        document.getElementById("streaming-results").innerText = "Results streaming ended.";
        queryStop();
    }
}

const templateEvent = (evt, time, src, type) => `
    <div class="p-1 shadow-xs border space-x-1 dark:border-gray-600 h-12 w-80 sm:w-[624px]">
        <a href="${src}" target="_blank">
            <p class="text-gray-700 dark:text-gray-300 hover:text-blue-500 truncate">
                ${evt.attributes.hasOwnProperty("title") ? evt.attributes.title.ce_string : (evt.attributes.hasOwnProperty("summary") ? evt.attributes.summary.ce_string : (evt.text_data != null ? evt.text_data : ""))}
            </p>
            <p class="font-mono text-slate-600 dark:text-slate-300 text-xs space-x-1">
                <span class="hover:text-blue-500 ">
                    ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}
                </span>
                <span class="text-gray-600 dark:text-gray-300 ">
                    ${evt.type}
                </span>
            </p>
        </a>
    </div>
`

function displayEvents(evts) {
    let elemEvts = document.getElementById("events");
    for (let evt of evts) {
        if (elemEvts.childElementCount >= 10) {
            elemEvts.removeChild(elemEvts.lastElementChild);
        }
        let time;
        if (evt.attributes.hasOwnProperty("time")) {
            time = new Date(evt.attributes.time.ce_timestamp);
        } else {
            time = new Date();
        }
        let src = evt.source;
        if (src.startsWith("@")) {
            src = `https://t.me/${src.substring(1)}`;
        }
        if (!src.startsWith("http://") && !src.startsWith("https://")) {
            src = `https://${src}`;
        }
        let type = evt.type;
        if (type.startsWith("com.github.awakari")) {
            type = type.substring(18);
        }
        if (type.startsWith("com.awakari")) {
            type = type.substring(11);
        }
        elemEvts.innerHTML = templateEvent(evt, time, src) + elemEvts.innerHTML;
    }
}
