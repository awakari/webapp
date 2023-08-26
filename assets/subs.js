const templateSub = (sub) => `
                <div class="p-2 shadow-sm border hover:bg-white hover:cursor-pointer" onclick="loadInbox('${sub.id}')">
                    <span class="flex space-x-2">
                        <span>
                            <span class="flex space-x-2">
                                <p class="font-mono text-xs text-slate-500">${sub.id}</p>
                            </span>
                            <span class="flex space-x-2">
                                <p class="truncate w-[256px] ${sub.data.hasOwnProperty("enabled") && sub.data.enabled ? "" : "text-slate-500"}">
                                    ${sub.data.description}
                                </p>
                            </span>
                        </span>
                        <span class="flex">
                            <button type="button" title="Delete" onclick="deleteSub('${sub.id}')" class="ml-1 text-sm focus:outline-none text-gray-400 h-8 w-8 rounded-md border border-gray-400 hover:bg-gray-100 hover:text-gray-500 hover:border-gray-500 flex items-center">
                                <svg class="fill-current w-4 h-4 mx-auto" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512">
                                    <path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/>
                                </svg>
                            </button>
                        </span>
                    </span>
                </div>
`

function loadSubs() {
    let userEmail = sessionStorage.getItem("userEmail")
    let optsReq = {
        method: "GET",
        headers: {
            "X-Awakari-User-Id": userEmail,
        },
        cache: "default",
    }
    fetch("/v1/subscriptions", optsReq)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            let listHtml = document.getElementById("subs_list");
            listHtml.innerHTML = "";
            for (const sub of data) {
                listHtml.innerHTML += templateSub(sub);
            }
        })
        .catch(err => {
            alert(err);
        })
}

function deleteSub(id) {
    if (confirm(`Confirm delete subscription ${id}?`)) {
        let userEmail = sessionStorage.getItem("userEmail");
        let optsReq = {
            method: "DELETE",
            headers: {
                "X-Awakari-User-Id": userEmail,
            },
            cache: "default",
        }
        fetch(`/v1/subscriptions/${id}`, optsReq)
            .then(resp => {
                if (!resp.ok) {
                    throw new Error(`Request failed with status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(_ => {
                alert(`Deleted subscription ${id}`);
                window.location.assign("/web/subs.html");
            })
            .catch(err => {
                alert(err);
            })
    }
}

function loadInbox(id) {
    window.location.assign(`/web/inbox.html?id=${id}`);
}