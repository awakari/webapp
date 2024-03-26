const templateSub = (sub) => `
                <div class="hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 flex w-[320px] sm:w-[400px] space-x-1"
                     onclick="window.location.assign('sub-details.html?id=${sub.id}')">
                    <span class="truncate py-2 grow">
                        ${sub.description}
                    </span>
                    <span class="pt-1">
                        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                                         
                    </span>
                </div>
`

const pageLimit= 12;

function load() {

    const headers = getAuthHeaders();
    if (!headers["Authorization"]) {
        document.getElementById("login").style.display = "block";
    }

    document.getElementById("wait").style.display = "block";
    Usage
        .fetch("1", headers)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            if (data && data.hasOwnProperty("count")) {
                document.getElementById("count").innerText = data.count;
            }
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });

    document.getElementById("wait").style.display = "block";
    Limits
        .fetch("1", headers)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            if (data && data.hasOwnProperty("count")) {
                document.getElementById("limit").innerText = data.count;
            }
            return data;
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });

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
    document.getElementById("wait").style.display = "block";

    const headers = getAuthHeaders();

    Subscriptions
        .fetchListPage(cursor, order, pageLimit, filter, headers)
        .then(data => {

            if (data) {

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
                            window.location.assign(`sub.html?cursor=${subs[0].id}&order=DESC&filter=${encodeURIComponent(filter)}`)
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
                        window.location.assign(`sub.html?cursor=${subs[pageLimit - 1].id}&order=ASC&filter=${encodeURIComponent(filter)}`)
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
                        window.location.assign(`sub.html?filter=${encodeURIComponent(filter)}`);
                    }
                }
            }
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });
}
