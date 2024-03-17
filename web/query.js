// select2 init
$(document).ready(function() {
    $('.dropdown-multiselect').select2({
        placeholder: function() {
            // 'this' refers to the current select2 element
            return $(this).data('placeholder'); // Assuming you have a 'data-placeholder' attribute in your HTML
        },
        allowClear: true,
    });
});

const resultsStreamingTtimeout = 3_600_000;

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
                const expires = Date.now() + resultsStreamingTtimeout;
                getQuerySubscription(q, expires)
                    .then(subId => {
                        if (subId !== "") {
                            startEventsLoading(subId, expires);
                        }
                    })
        }
    }
}

const defaultSubName = "_reserved_app_search";

function getQuerySubscription(q, expires) {
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
    return fetch(`/v1/sub?limit=1000&filter=${defaultSubName}`, optsReq)
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
                    if (sub.description === defaultSubName) {
                        return deleteSubscription(sub.id, headers)
                            .then(_ => createSubscription(q, headers, expires));
                    }
                }
            }
            return createSubscription(q, headers, expires);
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

function createSubscription(q, headers, expires) {
    console.log(``);
    const payload = {
        description: defaultSubName,
        enabled: true,
        expires: new Date(expires).toISOString(),
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
                if (resp.status === 429) {
                    throw new Error("Subscription count limit reached. Please contact awakari@awakari.com and request to increase the limit.");
                } else {
                    throw new Error(`Failed to create a new subscription: ${resp.status}`);
                }
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
        window.location.assign("index.html");
    }
}

async function startEventsLoading(subId, deadline) {
    document.getElementById("events-menu").style.display = "flex";
    queryRunning = true;
    try {
        while (queryRunning && Date.now() < deadline) {
            console.log(`Long poll events for ${subId}...`);
            await Events
                .longPoll(subId, deadline)
                .then(evts => {
                    if (evts && evts.length > 0) {
                        displayEvents(evts);
                    }
                });
            console.log(`Long poll events for ${subId} done`);
        }
    } catch (e) {
        alert(`Unexpected events loading error ${subId}: ${e}`);
    } finally {
        document.getElementById("streaming-results").innerText = "Results streaming ended.";
        queryStop();
    }
}

const templateEvent = (txt, time, srcUrl, link, id) => `
    <div class="p-1 shadow-xs border dark:border-gray-600 h-12 w-86 sm:w-[624px] flex align-middle">
        <a href="${link}" target="_blank" class="w-80 sm:w-[586px]">
            <p class="text-gray-700 dark:text-gray-300 hover:text-blue-500 truncate">
                ${txt}
            </p>
            <p class="font-mono text-xs truncate">
                <span class="text-stone-500">
                    ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}
                </span>
                <span class="text-slate-600 dark:text-slate-400 truncate">
                    ${srcUrl.host}<span class="text-slate-500 truncate">${srcUrl.pathname}</span>
                </span>
            </p>
        </a>
        <button type="button"
                onclick="reportPublicationInappropriate('${srcUrl}', '${link}', '${id}')"
                class="m-1 flex report justify-center text-center text-xl h-6 w-6 text-stone-500 hover:text-amber-500">
            ⚠
        </button>
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
        let link = src;
        if (evt.attributes.hasOwnProperty("object") && evt.attributes.object.hasOwnProperty("ce_uri")) {
            link = evt.attributes.object.ce_uri;
        }
        if (evt.attributes.hasOwnProperty("objecturl")) {
            link = evt.attributes.objecturl.ce_uri;
        }
        const srcUrl = new URL(src);
        let txt = evt.text_data;
        if (evt.attributes.hasOwnProperty("summary")) {
            txt = evt.attributes.summary.ce_string;
        }
        if (evt.attributes.hasOwnProperty("title")) {
            txt = evt.attributes.title.ce_string;
        }
        txt = txt.replace(/(<([^>]+)>)/gi, ""); // remove HTML tags
        elemEvts.innerHTML = templateEvent(txt, time, srcUrl, link, evt.id) + elemEvts.innerHTML;
    }
}

const queryOptTemplate = (id, value) => `    
    <div x-show="$el.innerText.toLowerCase().includes(filter.toLowerCase())" class="flex items-center">
        <input x-model="options" id="${id}" type="checkbox" value="${value}" class="outline-none focus:outline-none w-4 h-4 text-gray-600 bg-gray-500 border-gray-300">
        <label for="${id}" class="ml-1 flex-grow truncate">${value}</label>
    </div>
`

function loadQueryOptionsAttribute() {
    let optsReq = {
        method: "GET",
    };
    return fetch(`/v1/status/attr/types`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            let typesByKey = null;
            if (data) {
                typesByKey = data.typesByKey;
            }
            if (typesByKey) {
                let optsHtml = "";
                for (const key of Object.keys(typesByKey)) {
                    if (key !== "") {
                        optsHtml += queryOptTemplate(key, key);
                    }
                }
                document.getElementById("query-opt-attrs").innerHTML += optsHtml;
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function loadQueryOptionsSource() {
    let optsReq = {
        method: "GET",
    };
    return fetch(`/v1/status/sources`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                let optsHtml = "";
                let uniqueSrcs = new Set();
                for (const type of Object.keys(data)) {
                    const srcs = data[type];
                    for (const src of srcs) {
                        uniqueSrcs.add(src);

                    }
                }
                let i = 0;
                for (const src of uniqueSrcs) {
                    optsHtml += queryOptTemplate(`src-${i}`, src);
                    i ++;
                }
                document.getElementById("query-opt-srcs").innerHTML += optsHtml;
            }
        })
        .catch(err => {
            console.log(err);
        });
}
