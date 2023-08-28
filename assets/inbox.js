const templateInboxNav = subId => `
            <p class="text-lg"><b>Inbox</b></p>
            <span class="flex space-x-2" style="margin-left: auto; margin-right: 0">
                <button title="Edit Subscription" onclick="window.location.assign('/web/sub-edit.html?id=${subId}')" class="h-8 w-8 rounded-md border border-blue-700 shadow-2xl hover:bg-blue-200 text-blue-700 items-center">
                    <img src="/web/sub-edit.svg" alt="Edit Subscription" class="px-1"/>
                </button>
                <button title="New Message" onclick="window.location.assign('/web/msg-new.html')" class="h-8 w-8 rounded-md border border-cyan-700 shadow-2xl hover:bg-cyan-200 text-cyan-700 items-center">
                    <img src="/web/msg-new.svg" alt="New Message" class="px-1" style="padding-top: 0.25rem"/>
                </button>
                <button type="button" title="Exit" onclick="logout()" class="h-8 w-8 text-sm focus:outline-none text-gray-500 rounded-md border border-gray-500 hover:bg-gray-200 flex items-center">
                    <svg class="fill-current w-4 h-4 mx-auto" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                        <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"/>
                    </svg>
                </button>
            </span>
`

const templateInboxEvent = (subId, evt) => `
                <div class="p-2 shadow-sm border hover:bg-white" >
                    <span class="flex space-x-2">
                        <span class="hover:cursor-pointer" onclick="window.location.assign('/web/msg-view.html?subId=${subId}&evtId=${evt.id}')">
                            <span class="flex space-x-2">
                                <p class="font-mono text-xs text-slate-500">${evt.id}</p>
                            </span>
                            <span class="flex space-x-1">
                                <span style="margin-top: 0.5rem" class="h-2 w-2 flex justify-center items-center text-xs rounded-full ${(!evt.hasOwnProperty("read") || !evt.read) ? "bg-fuchsia-300" : "" }"></span>
                                <p class="truncate w-[256px]">
                                    ${evt.attributes.hasOwnProperty("title") ? evt.attributes.title.Attr.CeString : (evt.attributes.hasOwnProperty("summary") ? evt.attributes.summary.Attr.CeString : (evt.Data != null && evt.Data.TextData != null ? evt.Data.TextData : ""))}
                                </p>
                            </span>
                            <span class="flex space-x-2">
                                <p class="font-mono text-xs text-slate-700">${new Date(evt.attributes.time.Attr.CeTimestamp.seconds * 1000).toISOString()}</p>
                            </span>
                        </span>
                        <span class="flex">
                            <button type="button" title="Delete" onclick="deleteEvent('${subId}', '${evt.id}')" class="ml-1 text-sm focus:outline-none text-gray-400 h-8 w-8 rounded-md border border-gray-400 hover:bg-gray-100 hover:text-gray-500 hover:border-gray-500 flex items-center">
                                <svg class="fill-current w-4 h-4 mx-auto" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512">
                                    <path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/>
                                </svg>
                            </button>
                        </span>
                    </span>
                </div>
`

function loadInbox() {
    const queryParams = new URLSearchParams(window.location.search);
    const subId = queryParams.get("id");
    loadInboxNav(subId);
    loadEvents(subId);
}

function loadInboxNav(subId) {
    let inboxNav = document.getElementById("inbox_nav");
    inboxNav.innerHTML = "";
    inboxNav.innerHTML += templateInboxNav(subId);
}

function loadEvents(subId) {
    const userEmail = sessionStorage.getItem("userEmail")
    const optsReq = {
        method: "GET",
        headers: {
            "X-Awakari-User-Id": userEmail,
        },
    }
    fetch(`/v1/events/${subId}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("msgs")) {
                let evtsHistory = loadEventsHistory(subId);
                for (const evt of data.msgs) {
                    evtsHistory.push(evt);
                }
                storeAndDisplayEvents(subId, evtsHistory)
            }
        })
        .catch(err => {
            alert(err);
        })
}

function loadEventsHistory(subId) {
    let evtsHistoryTxt = localStorage.getItem(subId);
    if (evtsHistoryTxt == null) {
        evtsHistoryTxt = "[]";
    }
    return JSON.parse(evtsHistoryTxt);
}

function storeAndDisplayEvents(subId, evts) {
    localStorage.setItem(subId, JSON.stringify(evts));
    // display
    let listHtml = document.getElementById("evts_list")
    listHtml.innerHTML = "";
    evts.reverse().forEach(evt => {
        listHtml.innerHTML += templateInboxEvent(subId, evt);
    })
}

function deleteEvent(subId, evtId) {
    if (confirm(`Confirm delete event ${evtId}`)) {
        let evtsHistory = loadEventsHistory(subId);
        for (let i = 0; i < evtsHistory.length; i++) {
            if (evtsHistory[i].id === evtId) {
                evtsHistory.splice(i, 1)
            }
        }
        storeAndDisplayEvents(subId, evtsHistory)
    }
}
