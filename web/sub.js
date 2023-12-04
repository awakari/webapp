const templateSub = (sub) => `
                <div class="p-2 shadow-sm hover:text-blue-500 hover:bg-gray-100 rounded-sm flex"
                     onclick="window.location.assign('sub-details.html?id=${sub.id}')">
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
