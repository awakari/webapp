const templateSub = (sub, highlight) => `
                <div class="hover:text-blue-500 hover:bg-gray-100 flex ${highlight ? '' : 'text-slate-400 hover:text-slate-400'}"
                     onclick="window.location.assign('sub-details.html?id=${sub.id}')">
                    <span class="truncate w-[240px] sm:w-[600px] py-2">
                        ${sub.description}
                    </span>
                    <span>
                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                                         
                    </span>
                </div>
`

const uf = new uFuzzy();
const pageLimit = 10;

function load() {
    const authToken = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    const headers = {
        "Authorization": `Bearer ${authToken}`,
        "X-Awakari-Group-Id": defaultGroupId,
        "X-Awakari-User-Id": userId,
    }

    fetch("/v1/usage/1", {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Subscriptions usage request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("count")) {
                document.getElementById("count").innerText = data.count;
            }
        })
        .catch(err => {
            alert(err);
        })

    fetch("/v1/limits/1", {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Subscriptions limit request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("count")) {
                document.getElementById("limit").innerText = data.count;
            }
            return data.count;
        })
        .catch(err => {
            alert(err);
        })

    loadSubscriptions(true, false);
}

function loadSubscriptions(start, next) {

    let cursor = "";
    if (next) {
        cursor = sessionStorage.getItem("sub_list_cursor_next");
    } else if (!start) {
        cursor = sessionStorage.getItem("sub_list_cursor");
    }

    const authToken = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    const filter = document.getElementById("filter").value;

    fetch(`/v1/sub?limit=${pageLimit}&cursor=${cursor}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
        },
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Subscriptions list request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("subs")) {
                let listHtml = document.getElementById("subs_list");
                listHtml.innerHTML = "";
                let lastId = "";
                for (const sub of data.subs) {
                    lastId = sub.id;
                    if (filter !== "") {
                        const input  = [
                            sub.description,
                        ]
                        const idxs = uf.filter(input, filter);
                        if (idxs != null && idxs.length > 0) {
                            listHtml.innerHTML += templateSub(sub, true);
                        } else {
                            listHtml.innerHTML += templateSub(sub, false);
                        }
                    } else {
                        listHtml.innerHTML += templateSub(sub, true);
                    }
                }
                sessionStorage.setItem("sub_list_cursor", cursor);
                sessionStorage.setItem("sub_list_cursor_next", lastId);
                if (data.subs.length === pageLimit) {
                    document.getElementById("button-next").removeAttribute("disabled");
                } else {
                    document.getElementById("button-next").disabled = "disabled";
                }
            }
        })
        .catch(err => {
            alert(err);
        })
}
