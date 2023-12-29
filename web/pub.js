const templateSrc = (type, addr) => `
                <div class="hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 flex"
                     onclick="window.location.assign('pub-src-details.html?type=${type}&addr=${encodeURIComponent(addr)}')">
                    <span class="truncate w-[280px] sm:w-[600px] py-2">
                        ${addr}
                    </span>
                    <span class="pt-1">
                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                                         
                    </span>
                </div>
`

const pageLimit = 12;

function load() {

    const authProvider = localStorage.getItem(keyAuthProvider);
    switch (authProvider) {
        case "Telegram":
            document.getElementById("donate-tg").style.display = "block";
            break
    }

    const authToken = localStorage.getItem(keyAuthToken);
    const userId = localStorage.getItem(keyUserId);
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

    const urlParams = new URLSearchParams(window.location.search);
    loadSources(urlParams.get("cursor"), urlParams.get("filter"), urlParams.get("srcType"), urlParams.get("own"));
}

function loadSources(cursor, filter, srcType, own) {

    if (cursor == null) {
        cursor = "";
    }
    let order = new URLSearchParams(window.location.search).get("order");
    if (order == null) {
        order = "ASC";
    }
    if (filter == null) {
        filter = document.getElementById("filter").value;
    } else {
        document.getElementById("filter").value = filter;
    }

    if (srcType == null) {
        srcType = document.getElementById("src_type").value;
    } else {
        document.getElementById("src_type").value = srcType;
    }
    switch (srcType) {
        case "tgbc":
            document.getElementById("own").disabled = "disabled";
            break
        default:
            document.getElementById("own").removeAttribute("disabled");
    }

    if (own == null) {
        own = document.getElementById("own").checked;
    } else if (own === "on" || own === true || own === "true") {
        own = true;
        document.getElementById("own").checked = true;
    } else {
        own = false;
        document.getElementById("own").checked = false;
    }

    const authToken = localStorage.getItem(keyAuthToken);
    const userId = localStorage.getItem(keyUserId);

    fetch(`/v1/src/${srcType}/list?limit=${pageLimit}&own=${own}&order=${order}&filter=${encodeURIComponent(filter)}`, {
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

            if (order === "DESC" && data != null) {
                data.reverse();
            }

            // prev button
            const btnPrev = document.getElementById("button-prev");
            if (cursor === "") {
                btnPrev.disabled = "disabled";
            } else if (data != null) {
                btnPrev.removeAttribute("disabled");
                btnPrev.onclick = () => {
                    window.location.assign(`pub.html?cursor=${encodeURIComponent(data[0])}&order=DESC&filter=${encodeURIComponent(filter)}&srcType=${srcType}&own=${own}`)
                };
            }

            // next button
            const btnNext = document.getElementById("button-next");
            if (data != null && data.length === pageLimit) {
                btnNext.removeAttribute("disabled");
                btnNext.onclick = () => {
                    window.location.assign(`pub.html?cursor=${encodeURIComponent(data[pageLimit - 1])}&order=ASC&filter=${encodeURIComponent(filter)}&srcType=${srcType}&own=${own}`)
                }
            } else {
                btnNext.disabled = "disabled";
            }

            let listHtml = document.getElementById("src_list");
            listHtml.innerHTML = "";
            if (data != null) {
                for (const addr of data) {
                    listHtml.innerHTML += templateSrc(srcType, addr, true);
                }
            }

            if (data == null || data.length === 0) {
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
                    window.location.assign(`pub.html?filter=${encodeURIComponent(filter)}&srcType=${srcType}&own=${own}`);
                }
            }
        })
        .catch(err => {
            alert(err);
        })
}
