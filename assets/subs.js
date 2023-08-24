function subsLoad() {
    let userEmail = sessionStorage.getItem("userEmail")
    let optsReq = {
        method: "GET",
        headers: {
            "X-Awakari-User-Id": userEmail,
        },
        cache: "default",
    }
}
