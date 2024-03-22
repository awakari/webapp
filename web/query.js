// select2 init
//$(document).ready(function() {

    // $('#currencies').select2({
    //     ajax: {
    //         url: '/v1/status/attr/values/offerspricecurrency',
    //         processResults: function (data) {
    //             let results = [];
    //             let i = 0;
    //             for (const v of data) {
    //                 results.push({
    //                     id: i,
    //                     text: v,
    //                 });
    //                 i ++;
    //             }
    //             return {
    //                 results: results,
    //             };
    //         },
    //         placeholder: function() {
    //             // 'this' refers to the current select2 element
    //             return $(this).data('placeholder'); // Assuming you have a 'data-placeholder' attribute in your HTML
    //         },
    //         allowClear: true,
    //     }
    // });

    // $('#languages').select2({
    //     ajax: {
    //         url: '/v1/status/attr/values/language',
    //         processResults: function (data) {
    //             let results = [];
    //             let i = 0;
    //             for (const v of data) {
    //                 results.push({
    //                     id: i,
    //                     text: v,
    //                 });
    //                 i ++;
    //             }
    //             return {
    //                 results: results,
    //             };
    //         },
    //         placeholder: function() {
    //             // 'this' refers to the current select2 element
    //             return $(this).data('placeholder'); // Assuming you have a 'data-placeholder' attribute in your HTML
    //         },
    //         allowClear: true,
    //     }
    // });

    // $('#subjects').select2({
    //     ajax: {
    //         url: '/v1/status/attr/values/subject',
    //         processResults: function (data) {
    //             let results = [];
    //             let i = 0;
    //             for (const v of data) {
    //                 results.push({
    //                     id: i,
    //                     text: v,
    //                 });
    //                 i ++;
    //             }
    //             return {
    //                 results: results,
    //             };
    //         },
    //         placeholder: function() {
    //             // 'this' refers to the current select2 element
    //             return $(this).data('placeholder'); // Assuming you have a 'data-placeholder' attribute in your HTML
    //         },
    //         allowClear: true,
    //     }
    // });
    //
    // document.getElementById("currencies").onchange = (evt) => {
    //     let currencies = [];
    //     for (const item of $('#currencies').select2('data')) {
    //         currencies.push(item.text);
    //     }
    //     document.getElementById("q-curr").value = currencies.join(",");
    // }
    // document.getElementById("languages").onchange = (evt) => {
    //     let languages = [];
    //     for (const item of $('#languages').select2('data')) {
    //         languages.push(item.text);
    //     }
    //     document.getElementById("q-lang").value = languages.join(",");
    // }
    // document.getElementById("subjects").onchange = (evt) => {
    //     let subjects = [];
    //     for (const item of $('#subjects').select2('data')) {
    //         subjects.push(item.text);
    //     }
    //     document.getElementById("q-subj").value = subjects.join(",");
    // }
//});

const resultsStreamingTimeout = 3_600_000;

function loadQuery() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q != null && q !== "") {
        document.getElementById("query").value = q;
        const expires = Date.now() + resultsStreamingTimeout;
        getQuerySubscription(q, expires)
            .then(subId => {
                if (subId !== "") {
                    startEventsLoading(subId, expires);
                }
            });
    }
}

const defaultSubName = "_reserved_app_search";

function getQuerySubscription(q, expires) {
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

const templateEvent = (txt, time, src, link, id) => `
    <div class="p-1 shadow-xs border dark:border-gray-600 h-12 w-86 sm:w-[624px] flex align-middle">
        <a href="${link}" target="_blank" class="w-80 sm:w-[586px]">
            <p class="text-gray-700 dark:text-gray-300 hover:text-blue-500 truncate">
                ${txt}
            </p>
            <p class="font-mono text-xs truncate">
                <span class="text-stone-500">
                    ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}
                </span>
                <span class="text-slate-600 dark:text-slate-400 truncate">${src}</span>
            </p>
        </a>
        <button type="button"
                onclick="reportPublicationInappropriate('${src}', '${link}', '${id}')"
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
        let link = evt.source;
        if (link.startsWith("@")) {
            link = `https://t.me/${link.substring(1)}`;
        }
        if (!link.startsWith("http://") || !link.startsWith("https")) {
            link = `https://${link}`;
        }
        if (evt.attributes.hasOwnProperty("object") && evt.attributes.object.hasOwnProperty("ce_uri")) {
            link = evt.attributes.object.ce_uri;
        }
        if (evt.attributes.hasOwnProperty("objecturl")) {
            link = evt.attributes.objecturl.ce_uri;
        }
        let txt = evt.text_data;
        if (evt.attributes.hasOwnProperty("summary")) {
            txt = evt.attributes.summary.ce_string;
        }
        if (evt.attributes.hasOwnProperty("title")) {
            txt = evt.attributes.title.ce_string;
        }
        txt = txt.replace(/(<([^>]+)>)/gi, ""); // remove HTML tags
        elemEvts.innerHTML = templateEvent(txt, time, evt.source, link, evt.id) + elemEvts.innerHTML;
    }
}
