function load() {
    const urlParams = new URLSearchParams(window.location.search);
    document.getElementById("id").innerText = urlParams.get("id");
    switch (localStorage.getItem(keyAuthProvider)) {
        case "Telegram":
            document.getElementById("telegram").style.display = "block";;
    }
}
