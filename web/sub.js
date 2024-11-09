const templateSub = (sub) => `
                <div class="hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 flex w-[320px] sm:w-[400px] space-x-1"
                     onclick="window.location.assign('sub-details.html?id=${sub.id}')">
                    <span class="pt-1 text-slate-500 flex h-8">
                        <span class="text-xs">${sub.hasOwnProperty("followers")? sub.followers : '' }</span>                     
                    </span>
                    ${sub.public ? '<span class="truncate py-2 grow">' : '<span class="truncate py-2 grow text-slate-500 dark:text-gray-400 hover:text-blue-500">'}
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

async function loadInterests() {

    const headers = getAuthHeaders();
    if (!headers["Authorization"]) {
        window.location.assign(`login.html?redirect=${window.location}`);
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
    return reloadInterests(urlParams.get("filter"), urlParams.get("own"), true);
}

async function reloadInterests(filter, ownOnly, initial) {

    const urlParams = new URLSearchParams(window.location.search);
    let order = urlParams.get("order");
    if (order == null) {
        order = "DESC";
    }

    let cursor = urlParams.get("cursor");
    if (cursor == null) {
        switch (order) {
            case "ASC": {
                cursor = "0";
                break;
            }
            default: {
                cursor = "zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz";
            }
        }
    }
    let cursorFollowers = urlParams.get("followers");
    if (cursorFollowers == null) {
        switch (order) {
            case "ASC": {
                cursorFollowers = "0";
                break;
            }
            default: {
                cursorFollowers = "9223372036854775807"; // max int64
            }
        }
    }
    if (filter == null) {
        filter = document.getElementById("filter").value;
    } else {
        document.getElementById("filter").value = filter;
    }

    const headers = getAuthHeaders();

    if (ownOnly == null) {
        // initially, when user has no own interests, show public interests list, otherwise own interests list
        if (initial) {
            const ownInterestCount = await Interests
                .fetchListPage(cursor, cursorFollowers, order, 1, filter, true, headers)
                .then(resp => resp ? resp.json() : null)
                .then(data => {
                    if (data) {
                        if (data.hasOwnProperty("subs")) {
                            return data.subs.length;
                        }
                        return 0;
                    }
                    return 0;
                });
            if (ownInterestCount > 0) {
                document.getElementById("own").checked = true;
            }
        }
        ownOnly = document.getElementById("own").checked;
    } else if (ownOnly === true || ownOnly === "true") {
        ownOnly = true;
        document.getElementById("own").checked = true;
    } else {
        ownOnly = false;
        document.getElementById("own").checked = false;
    }

    document.getElementById("wait").style.display = "block";

    Interests
        .fetchListPage(cursor, cursorFollowers, order, pageLimit, filter, ownOnly, headers)
        .then(resp => resp ? resp.json() : null)
        .then(data => {

            if (data) {

                let subs = [];
                if (data.hasOwnProperty("subs")) {
                    subs = data.subs;
                }

                if (order === "ASC") {
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
                            const sub = subs[0];
                            window.location.assign(`sub.html?cursor=${sub.id}&followers=${sub.hasOwnProperty('followers')? sub.followers : '0'}&order=ASC&filter=${encodeURIComponent(filter)}&own=${ownOnly}`)
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
                        const sub = subs[pageLimit - 1];
                        window.location.assign(`sub.html?cursor=${sub.id}&followers=${sub.hasOwnProperty('followers')? sub.followers : '0'}&order=DESC&filter=${encodeURIComponent(filter)}&own=${ownOnly}`)
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
                    if (order === "DESC") {
                        if (cursor !== "") {
                            btnPrev.onclick = () => {
                                history.back();
                            };
                            btnNext.disabled = "disabled";
                        }
                    } else if (order === "ASC") {
                        // back to the beginning
                        window.location.assign(`sub.html?filter=${encodeURIComponent(filter)}&own=${ownOnly}`);
                    }
                }
            }
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function subNewDropdown() {
    document.getElementById("sub-new-dropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
