const resultsStreamingTimeout = 3_600_000;

function loadQuery() {
    if (localStorage.getItem(keyUserId)) {
        document.getElementById("sign-in-for-full").style.display = "none";
    } else {
        document.getElementById("sign-in-for-full").style.display = "block"
    }
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q != null && q !== "") {
        document.getElementById("query").value = q;
        const expires = Date.now() + resultsStreamingTimeout;
        getQuerySubscription(q, expires)
            .then(subId => {
                if (subId && subId !== "") {
                    startEventsLoading(subId, expires);
                }
            });
    }
}

const searchSubNamePrefix = "_Reserved_Search ";

function getQuerySubscription(q, expires) {
    const headers = getAuthHeaders();
    const cond = {
        not: false,
        tc: {
            term: q,
        },
    };
    return Subscriptions
        .createResponse(searchSubNamePrefix + q, true, new Date(expires), cond, headers)
        .then(resp => {
            if (!resp.ok) {
                switch (resp.status) {
                    case 401:
                        alert("Access failure. Sign in or clean cookies.");
                        break;
                    case 429:
                        alert("Limit reached. Go to own subscriptions list and delete unneeded.");
                        break;
                    default:
                        alert(`Subscription create request failed, response status: ${resp.status}`);
                        break;
                }
                return null;
            }
            return resp.json();
        })
        .then(data => data ? data.id : null);
}

let activeSubId = null;

async function queryStop() {
    const headers = getAuthHeaders();
    const data = await Subscriptions
        .fetch(activeSubId, headers)
        .then(data => {
            if (data) {
                data.expires = new Date(); // now
                return data;
            }
            return null;
        });
    if (data) {
        await Subscriptions.update(activeSubId, data.description, data.enabled, data.expires, data.cond, headers);
    }
    activeSubId = null;
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

let audio = {};

async function startEventsLoading(subId, deadline) {
    document.getElementById("events-menu").style.display = "flex";
    activeSubId = subId;
    audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    audio.snd = new Audio("inbox-notification.wav");
    audio.src = audio.ctx.createMediaElementSource(audio.snd);
    audio.src.connect(audio.ctx.destination);
    try {
        while (activeSubId && Date.now() < deadline) {
            console.log(`Long poll events for ${subId}...`);
            await Events
                .longPoll(subId, deadline)
                .then(evts => {
                    if (evts && evts.length > 0) {
                        displayEvents(evts);
                        try {
                            audio.snd.play();
                        } catch (e) {
                            console.log(e);
                        }
                    }
                });
            console.log(`Long poll events for ${subId} done`);
        }
    } catch (e) {
        alert(`Unexpected events loading error ${subId}: ${e}`);
    } finally {
        document.getElementById("streaming-results").innerText = "Results streaming ended.";
        await queryStop();
    }
}

const templateEvent = (txt, time, src, link, id) => `
    <div class="p-1 shadow-xs border dark:border-gray-600 h-12 w-86 sm:w-[624px] flex align-middle">
        <a href="${link}" target="_blank" class="w-78 sm:w-[586px]">
            <p class="text-gray-700 dark:text-gray-300 hover:text-blue-500 w-80 sm:w-[586px] truncate">
                ${txt}
            </p>
            <p class="font-mono text-xs w-80 sm:w-[586px] truncate">
                <span class="text-stone-500">
                    ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}
                </span>
                <span class="text-slate-600 dark:text-slate-400 w-80 truncate">${src}</span>
            </p>
        </a>
        <button type="button"
                onclick="reportPublicationInappropriate('${src}', '${link}', '${id}')"
                class="mt-1 flex report justify-center text-center text-xl h-6 w-6 text-stone-500 hover:text-amber-500">
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
