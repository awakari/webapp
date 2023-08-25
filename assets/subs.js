function subsLoad() {
    let userEmail = sessionStorage.getItem("userEmail")
    let optsReq = {
        method: "GET",
        headers: {
            "X-Awakari-User-Id": userEmail,
        },
        cache: "default",
    }
    fetch("/v1/subscriptions", optsReq)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            console.log("Response data:", data);
        })
        .catch(err => {
            console.error("Error: ", err)
        })
}
