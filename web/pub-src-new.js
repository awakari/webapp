function loadForm() {
    document.getElementById("src_type").onchange = showSrcDetails;
    showSrcDetails();
}

function showSrcDetails() {
    const opt = document.getElementById("src_type").value
    const btnSubmit = document.getElementById("button-submit");
    switch (opt) {
        case "tgbc":
            btnSubmit.style.display = "none";
            document.getElementById("tgbc").style.display = "block";
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "none";
            document.getElementById("site").style.display = "none";
            break
        case "tgch":
            btnSubmit.style.display = "flex";
            document.getElementById("tgbc").style.display = "none";
            document.getElementById("tgch").style.display = "block";
            document.getElementById("feed").style.display = "none";
            document.getElementById("site").style.display = "none";
            break
        case "feed":
            btnSubmit.style.display = "flex";
            document.getElementById("tgbc").style.display = "none";
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "block";
            document.getElementById("site").style.display = "none";
            break
        case "site":
            btnSubmit.style.display = "flex";
            document.getElementById("tgbc").style.display = "none";
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "none";
            document.getElementById("site").style.display = "block";
            break
    }
}

function addSource() {
    const authToken = localStorage.getItem(keyAuthToken);
    const userId = localStorage.getItem(keyUserId);
    const srcType = document.getElementById("src_type").value;
    let srcAddr;
    switch (srcType) {
        case "tgbc":
            return
        case "tgch":
            srcAddr = document.getElementById("chan_name").value;
            break
        case "feed":
            srcAddr = document.getElementById("feed_url").value;
            break
        case "site":
            srcAddr = document.getElementById("site_addr").value;
            break
    }
    const payload = {
        "limit": {
            "freq": parseInt(document.getElementById("feed_upd_freq").value),
        },
        "src": {
            "addr": srcAddr,
        }
    }
    fetch(`/v1/src/${srcType}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
        },
        body: JSON.stringify(payload),
    })
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp;
        })
        .then(_ => {
            alert("Source has been added");
            loadForm(); // reset
        })
        .catch(err => {
            alert(err);
        })
}
