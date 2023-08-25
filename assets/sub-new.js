function createSub() {
    let userEmail = sessionStorage.getItem("userEmail")
    let payload = {
        description: document.getElementById("sub_descr").value,
        enabled: document.getElementById("sub_enabl").checked,
        cond: JSON.parse(document.getElementById("sub_cond").value),
    }
    let optsReq = {
        method: "POST",
        headers: {
            "X-Awakari-User-Id": userEmail,
            "Content-Type": "application/json",
            body: JSON.stringify(payload)
        },
    }
    fetch("/v1/subscriptions", optsReq)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed ${resp.status}/${resp.text()}`);
            }
            return resp.json();
        })
        .then(data => {
            console.info("created subscription id: " + data.id)
            window.location.assign("/web/subs.html")
        })
        .catch(err => {
            console.error("Error: ", err)
        })
}
