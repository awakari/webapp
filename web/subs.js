const templateSub = (sub) => `
                <div class="p-2 shadow-sm hover:text-blue-500 hover:bg-gray-100 rounded-sm flex">
                    <span class="truncate w-[240px] sm:w-[600px]">
                        ${sub.description}
                    </span>
                    <div class="grow"></div>
                    <span>
                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12H20M20 12L16 8M20 12L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                                         
                    </span>
                </div>
`

let eventsLoadingRunning = false;

function loadSubscriptions() {
    let authToken = sessionStorage.getItem("authToken");
    let userId = sessionStorage.getItem("userId");
    let optsReq = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
        },
        cache: "default",
    }
    fetch("/v1/sub?limit=100", optsReq)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("subs")) {
                let listHtml = document.getElementById("subs_list");
                listHtml.innerHTML = "";
                for (const sub of data.subs) {
                    listHtml.innerHTML += templateSub(sub);
                }
            }
        })
        .catch(err => {
            alert(err);
        })
}

function deleteSubscription(id) {
    if (confirm(`Confirm delete subscription ${id}?`)) {
        let userEmail = sessionStorage.getItem("userEmail");
        let optsReq = {
            method: "DELETE",
            headers: {
                "X-Awakari-User-Id": userEmail,
            },
            cache: "default",
        }
        fetch(`/v1/sub/${id}`, optsReq)
            .then(resp => {
                if (!resp.ok) {
                    throw new Error(`Request failed with status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(_ => {
                alert(`Deleted subscription ${id}`);
                window.location.assign("subs.html");
            })
            .catch(err => {
                alert(err);
            })
    }
}

function showInbox(id) {
    window.location.assign(`//inbox.html?id=${id}`);
}

async function startEventsLoading(subs) {
    eventsLoadingRunning = true;
    console.log("Running events loading...");
    try {
        await Promise.all(subs.map(sub => loadSubscriptionEvents(sub.id)));
    } finally {
        console.log("Stopped events loading");
        eventsLoadingRunning = false;
    }
}

async function loadSubscriptionEvents(subId) {
    while(true) {
        console.log(`Load subscription ${subId} events...`);
        await Events
            .longPoll(subId)
            .finally(_ => {
                let evtsHistory = Events.getLocalHistory(subId);
                let evtsUnreadCount = 0;
                for (const evt of evtsHistory) {
                    if (!evt.hasOwnProperty("read") || evt.read === false) {
                        evtsUnreadCount++;
                    }
                }
                if (evtsUnreadCount > 0) {
                    document.getElementById(`unread_count_${subId}`).style.background = "#f0abfc"; // bg-fuchsia-300
                }
                if (evtsUnreadCount > 9) {
                    document.getElementById(`unread_count_${subId}`).innerHTML = "9+";
                } else {
                    document.getElementById(`unread_count_${subId}`).innerHTML = `${evtsUnreadCount}`;
                }
            })
    }
}
