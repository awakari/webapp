function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function genNewMsgAttrs() {
    document.getElementById("msg_id").value = uuidv4()
    document.getElementById("msg_ts").value = new Date().toISOString()
}

function submitMsg() {
    const userEmail = sessionStorage.getItem("userEmail");
    const payload = {
        id: document.getElementById("msg_id").value,
        specVersion: "1.0",
        source: "awakari.cloud/web",
        type: "com.github.awakari.webapp",
        attributes: JSON.parse(document.getElementById("msg_attrs").value),
        text_data: document.getElementById("msg_txt_data").value,
    }
    payload.attributes["time"] = {
        ce_timestamp: document.getElementById("msg_ts").value,
    }
    const optsReq = {
        method: "POST",
        headers: {
            "X-Awakari-User-Id": userEmail,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    }
    fetch("/v1/events", optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg))
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })
        .then(_ => {
            window.location.assign("/web/subs.html")
        })
        .catch(err => {
            alert(err)
        })
}
