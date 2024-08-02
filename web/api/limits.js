const Limits = {};

Limits.fetch = function (subj, headers) {
    return fetch(`/v1/limits/${subj}`, {
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
                    handleResponseStatus("Get usage limit", resp.status);
                } else {
                    alert(`Invalid subject: ${subj}`);
                }
                return null;
            } else {
                return null;
            }
        })

}
