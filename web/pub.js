const templateSrc = (type, addr, highlight) => `
                <div class="hover:text-blue-500 hover:bg-gray-100 flex ${highlight ? '' : 'text-slate-500 hover:text-slate-500'}"
                     onclick="window.location.assign('pub-src-details.html?type=${type}&addr=${addr}')">
                    <span class="truncate w-[240px] sm:w-[600px] py-2">
                        ${addr}
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

    fetch("/v1/usage/2", {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Daily publishing usage request failed with status: ${resp.status}`);
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

    fetch("/v1/limits/2", {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Daily publishing limit request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("count")) {
                document.getElementById("limit").innerText = data.count;
            }
            return data;
        })
        .catch(err => {
            alert(err);
        })

    loadSources(true);
}

function loadSources(start) {

    let cursor = sessionStorage.getItem("src_list_cursor");
    if (!cursor || start) {
        cursor = "";
    }
    const filter = document.getElementById("filter").value;
    const authToken = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    const headers = {
        "Authorization": `Bearer ${authToken}`,
        "X-Awakari-Group-Id": defaultGroupId,
        "X-Awakari-User-Id": userId,
    }
    const srcType = document.getElementById("src_type").value;
    const own = document.getElementById("own").checked;

    fetch(`/v1/src/${srcType}?cursor=${cursor}&own=${own}&limit=${pageLimit}`, {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Sources list request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null) {
                let listHtml = document.getElementById("src_list");
                listHtml.innerHTML = "";
                let lastAddr = "";
                for (const addr of data) {
                    lastAddr = addr;
                    if (filter !== "") {
                        const input  = [
                            addr,
                        ]
                        const idxs = uf.filter(input, filter);
                        if (idxs != null && idxs.length > 0) {
                            listHtml.innerHTML += templateSrc(srcType, addr, true);
                        } else {
                            listHtml.innerHTML += templateSrc(srcType, addr, false);
                        }
                    } else {
                        listHtml.innerHTML += templateSrc(srcType, addr, true);
                    }
                }
                sessionStorage.setItem("src_list_cursor", lastAddr);
                if (data.length === pageLimit) {
                    document.getElementById("button-next").disabled = "disabled";
                } else {
                    document.getElementById("button-next").removeAttribute("disabled");
                }
            }
        })
        .catch(err => {
            alert(err);
        })
}
