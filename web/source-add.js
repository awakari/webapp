window.Telegram.WebApp.expand();

function loadForm() {
    document.getElementById("src_type").onchange = showSrcDetails;
    showSrcDetails();
}

function showSrcDetails() {
    let opt = document.getElementById("src_type").value
    switch (opt) {
        case "tgch":
            document.getElementById("tgch").style.display = "grid";
            document.getElementById("feed").style.display = "none";
            document.getElementById("site").style.display = "none";
            break
        case "feed":
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "grid";
            document.getElementById("site").style.display = "none";
            break
        case "site":
            document.getElementById("tgch").style.display = "none";
            document.getElementById("feed").style.display = "none";
            document.getElementById("site").style.display = "grid";
            break
    }
}

window.Telegram.WebApp.expand();
window.Telegram.WebApp.MainButton.setText("✓ SUBMIT")
window.Telegram.WebApp.MainButton.show();
window.Telegram.WebApp.MainButton.onClick(() => {
    const srcType = document.getElementById("src_type").value;
    let srcAddr;
    switch (srcType) {
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
            "type": srcType,
        }
    }
    window.Telegram.WebApp.sendData(JSON.stringify(payload));
    window.Telegram.WebApp.close();
});
