function loadForm() {
    document.getElementById("src_type").onchange = showSrcDetails;
    showSrcDetails();
}

function showSrcDetails() {
    let opt = document.getElementById("src_type").value
    switch (opt) {
        case "tgchadmin":
            document.getElementById("tgchadmin").style.display = "block";
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "none";
            document.getElementById("site").style.display = "none";
            break
        case "tgch":
            document.getElementById("tgchadmin").style.display = "none";
            document.getElementById("tgch").style.display = "block";
            document.getElementById("feed").style.display = "none";
            document.getElementById("site").style.display = "none";
            break
        case "feed":
            document.getElementById("tgchadmin").style.display = "none";
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "block";
            document.getElementById("site").style.display = "none";
            break
        case "site":
            document.getElementById("tgchadmin").style.display = "none";
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
        case "tgchadmin":
            window.location.assign("https://t.me/AwakariBot?startchannel&admin=other");
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
