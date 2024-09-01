function loadForm() {
    const headers = getAuthHeaders();
    if (!headers["Authorization"]) {
        window.location.assign(`login.html?redirect=${window.location}`);
    }
    document.getElementById("src_type").onchange = showSrcDetails;
    document.getElementById("feed_url").value = "";
    showSrcDetails();
}

function showSrcDetails() {
    const opt = document.getElementById("src_type").value
    const btnSubmit = document.getElementById("button-submit");
    switch (opt) {
        case "apub":
            btnSubmit.style.display = "flex";
            document.getElementById("apub").style.display = "block";
            document.getElementById("tgbc").style.display = "none";
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "none";
            break
        case "tgbc":
            btnSubmit.style.display = "none";
            document.getElementById("apub").style.display = "none";
            document.getElementById("tgbc").style.display = "block";
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "none";
            break
        case "tgch":
            btnSubmit.style.display = "flex";
            document.getElementById("apub").style.display = "none";
            document.getElementById("tgbc").style.display = "none";
            document.getElementById("tgch").style.display = "block";
            document.getElementById("feed").style.display = "none";
            break
        case "feed":
            btnSubmit.style.display = "flex";
            document.getElementById("apub").style.display = "none";
            document.getElementById("tgbc").style.display = "none";
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "block";
            break
    }
}

function addSource() {
    const srcType = document.getElementById("src_type").value;
    let srcAddr;
    switch (srcType) {
        case "apub":
            srcAddr = document.getElementById("actor").value;
            if (srcAddr.length < 6) {
                alert(`Source address ${srcAddr} is not valid actor address`)
                return;
            }
            break
        case "tgbc":
            return
        case "tgch":
            srcAddr = document.getElementById("chan_name").value;
            if (srcAddr.length < 6) {
                alert(`Source address ${srcAddr} is not valid telegram channel name`)
                return;
            }
            break
        case "feed":
            srcAddr = document.getElementById("feed_url").value;
            if (srcAddr.length < 9) {
                alert(`Source address ${srcAddr} is not valid feed URL`)
                return;
            }
            break
        default:
            return;
    }
    const headers = getAuthHeaders();
    const feedUpdFreq = parseInt(document.getElementById("feed_upd_freq").value);
    document.getElementById("wait").style.display = "block";
    Sources
        .add(srcType, srcAddr, feedUpdFreq, headers)
        .then(resp => resp.text().then(msg => {
            if (resp.ok) {
                if (msg.length === 0) {
                    msg = "success";
                }
                alert(`Source added: ${msg}`);
            } else {
                handleResponseStatus(srcAddr, resp.status);
            }
            return resp;
        }))
        .then(resp => {
            if (resp.ok) {
                loadForm(); // reset
            }
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });
}
