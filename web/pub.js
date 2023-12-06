function load() {

    const authToken = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    const headers = {
        "Authorization": `Bearer ${authToken}`,
        "X-Awakari-Group-Id": defaultGroupId,
        "X-Awakari-User-Id": userId,
    }

    fetch("/v1/usage/2", {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Daily publishing usage request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("count")) {
                document.getElementById("count").innerText = data.count;
            }
        })
        .catch(err => {
            alert(err);
        })

    fetch("/v1/limits/2", {
        method: "GET",
        headers: headers,
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Daily publishing limit request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null && data.hasOwnProperty("count")) {
                document.getElementById("limit").innerText = data.count;
            }
            return data.count;
        })
        .catch(err => {
            alert(err);
        })

    loadSources();
}

function loadSources() {

    const authToken = sessionStorage.getItem("authToken");
    const userId = sessionStorage.getItem("userId");
    const headers = {
        "Authorization": `Bearer ${authToken}`,
        "X-Awakari-Group-Id": defaultGroupId,
        "X-Awakari-User-Id": userId,
    }


}
