const templateSrc = (type, addr, highlight) => `
                <div class="hover:text-blue-500 hover:bg-gray-100 flex ${highlight ? '' : 'text-slate-400 hover:text-slate-400'}"
                     onclick="window.location.assign('pub-src-details.html?type=${type}&addr=${encodeURIComponent(addr)}')">
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

    loadSources();
}

function loadSources() {

    const urlParams = new URLSearchParams(window.location.search);
    let cursor = urlParams.get("cursor");
    if (cursor == null) {
        cursor = "";
    }
    let order = urlParams.get("order");
    if (order == null) {
        order = "ASC";
    }
    const filter = document.getElementById("filter").value;
    const srcType = document.getElementById("src_type").value;
    const own = document.getElementById("own").checked;

    const authToken = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");

    fetch(`/v1/src/${srcType}?limit=${pageLimit}&own=${own}&cursor=${cursor}&order=${order}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
            "X-Awakari-Src-Addr": cursor,
        },
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Sources list request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {

            const btnPrev = document.getElementById("button-prev");
            const btnNext = document.getElementById("button-next");

            if (data != null && data.length > 0) {

                if (order === "DESC") {
                    data.reverse();
                }

                // prev button
                if (cursor === "") {
                    btnPrev.disabled = "disabled";
                } else {
                    btnPrev.removeAttribute("disabled");
                    btnPrev.onclick = () => {
                        window.location.assign(`pub.html?cursor=${data[0].id}&order=DESC`)
                    };
                }

                // next button
                if (data.length === pageLimit) {
                    btnNext.removeAttribute("disabled");
                    btnNext.onclick = () => {
                        window.location.assign(`pub.html?cursor=${data[pageLimit - 1].id}&order=ASC`)
                    }
                } else {
                    btnNext.disabled = "disabled";
                }

                //
                let listHtml = document.getElementById("src_list");
                listHtml.innerHTML = "";
                for (const addr of data) {
                    if (filter !== "") {
                        const input = [
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
            } else {
                // empty results page
                if (order === "ASC") {
                    if (cursor !== "") {
                        btnPrev.onclick = () => {
                            history.back();
                        };
                        btnNext.disabled = "disabled";
                    }
                } else if (order === "DESC") {
                    // back to the beginning
                    window.location.assign("pub.html");
                }
            }
        })
        .catch(err => {
            alert(err);
        })
}
