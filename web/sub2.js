const templateSub = (sub) => `
                <div class="hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 flex w-[280px] sm:max-w-[624px]"
                     onclick="window.location.assign('sub-details2.html?id=${sub.id}')">
                    <span class="truncate py-2 text-right">
                        ${sub.description}
                    </span>
                    <span class="pt-1">
                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                                         
                    </span>
                </div>
`

const pageLimit= 14;

function load() {

    // const authProvider = localStorage.getItem(keyAuthProvider);
    // switch (authProvider) {
    //     case "Telegram":
    //         document.getElementById("donate-tg").style.display = "block";
    //         break
    // }

    const authToken = localStorage.getItem(keyAuthToken);
    const userId = localStorage.getItem(keyUserId);
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
            return data;
        })
        .catch(err => {
            alert(err);
        })

    const urlParams = new URLSearchParams(window.location.search);
    loadSubscriptions(urlParams.get("filter"));
}

function loadSubscriptions(filter) {

    const urlParams = new URLSearchParams(window.location.search);
    let cursor = urlParams.get("cursor");
    if (cursor == null) {
        cursor = "";
    }
    let order = urlParams.get("order");
    if (order == null) {
        order = "ASC";
    }
    if (filter == null) {
        filter = document.getElementById("filter").value;
    } else {
        document.getElementById("filter").value = filter;
    }

    const authToken = localStorage.getItem(keyAuthToken);
    const userId = localStorage.getItem(keyUserId);

    fetch(`/v1/sub?limit=${pageLimit}&cursor=${cursor}&order=${order}&filter=${encodeURIComponent(filter)}`, {
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

            if (data != null) {

                let subs = [];
                if (data.hasOwnProperty("subs")) {
                    subs = data.subs;
                }

                if (order === "DESC") {
                    subs.reverse();
                }

                // prev button
                const btnPrev = document.getElementById("button-prev");
                if (cursor === "") {
                    btnPrev.disabled = "disabled";
                } else {
                    btnPrev.removeAttribute("disabled");
                    if (subs.length > 0) {
                        btnPrev.onclick = () => {
                            window.location.assign(`sub2.html?cursor=${subs[0].id}&order=DESC&filter=${encodeURIComponent(filter)}`)
                        }
                    } else {
                        btnPrev.onclick = () => {
                            history.back();
                        };
                    }
                }

                // next button
                const btnNext = document.getElementById("button-next");
                if (subs.length === pageLimit) {
                    btnNext.removeAttribute("disabled");
                    btnNext.onclick = () => {
                        window.location.assign(`sub2.html?cursor=${subs[pageLimit - 1].id}&order=ASC&filter=${encodeURIComponent(filter)}`)
                    }
                } else {
                    btnNext.disabled = "disabled";
                }

                //
                let listHtml = document.getElementById("subs_list");
                listHtml.innerHTML = "";
                for (const sub of subs) {
                    listHtml.innerHTML += templateSub(sub);
                }

                if (subs.length === 0) {
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
                        window.location.assign(`sub2.html?filter=${encodeURIComponent(filter)}`);
                    }
                }
            }
        })
        .catch(err => {
            alert(err);
        })
}
