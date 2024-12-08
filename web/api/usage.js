const Usage = {};

Usage.fetch = function (subj, headers) {
    return fetch(`https://usage.awakari.com/v1/usage/${subj}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => {
            if (resp) {
                if (resp.ok) {
                    return resp;
                }
                if (subj === "1" || subj === "2") {
                    handleResponseStatus(`Get subject ${subj} usage`, resp.status);
                } else {
                    alert(`Invalid usage subject: ${subj}`);
                }
                return null;
            } else {
                return null;
            }
        });
}
