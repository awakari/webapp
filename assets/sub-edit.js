const templateSubEditForm = sub => `
        <span class="flex">
            <label for="sub_id" class="flex w-full">
                Id
                <input type="text" id="sub_id" disabled="disabled" value="${sub.id}" class="border w-full focus:shadow-md outline-none ml-8 font-mono text-xs text-slate-700" />
            </label>
        </span>
        <span class="flex">
            <label for="sub_descr" class="flex w-full">
                Description
                <input type="text" id="sub_descr" value="${sub.description}" class="border w-full focus:shadow-md outline-none ml-2" />
            </label>
        </span>
        <span class="flex" style="padding-bottom: 0.5rem">
            <label for="sub_enabl">
                Enabled
                <input type="checkbox" id="sub_enabl" ${sub.hasOwnProperty("enabled") && sub.enabled ? `checked` : ``} class="ml-7" style="accent-color: dimgrey"/>
            </label>
        </span>
        <span>
            <label for="sub_cond">
                Condition
                <textarea id="sub_cond" disabled="disabled" rows="8" class="border font-mono text-sm w-full focus:shadow-md outline-none text-slate-700">${JSON.stringify(sub.cond)}</textarea>
            </label>
        </span>
        <span class="items-center flex ml-28 py-2">
            <button type="button" title="Submit" class="h-8 w-24 focus:outline-none text-blue-700 rounded-md border border-blue-700 hover:bg-blue-200 flex text-center items-center" onclick="updateSub('${sub.id}')">
                <p class="ml-5">Submit</p>
            </button>
        </span>
`

function loadUpdateSubForm() {
    const queryParams = new URLSearchParams(window.location.search);
    const subId = queryParams.get("id");
    const userEmail = sessionStorage.getItem("userEmail")
    const optsReq = {
        method: "GET",
        headers: {
            "X-Awakari-User-Id": userEmail,
        },
        cache: "default",
    }
    fetch(`/v1/subscriptions/${subId}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            data.id = subId
            let form = document.getElementById("sub_edit_form");
            form.innerHTML = "";
            form.innerHTML += templateSubEditForm(data);
        })
        .catch(err => {
            alert(err);
        })
}

function updateSub(subId) {
    let userEmail = sessionStorage.getItem("userEmail")
    let payload = {
        id: subId,
        description: document.getElementById("sub_descr").value,
        enabled: document.getElementById("sub_enabl").checked,
    }
    let optsReq = {
        method: "PUT",
        headers: {
            "X-Awakari-User-Id": userEmail,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
    }
    fetch(`/v1/subscriptions/${subId}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg))
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })
        .then(_ => {
            alert(`Updated subscription: ${subId}`)
            window.location.assign("/web/subs.html")
        })
        .catch(err => {
            alert(err)
        })
}
