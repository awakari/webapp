const Limits = {};

Limits.fetch = function (subj, headers) {
    return fetch(`/v1/limits/${subj}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => handleCookieExpiration(resp, headers, (h) => Limits.fetch(subj, h)))
        .then(resp => {
            if (resp) {
                if (!resp.ok) {
                    if (subj === "1" || subj === "2") {
                        handleResponseStatus(resp.status);
                    } else {
                        alert(`Invalid subject: ${subj}`);
                    }
                    return null;
                }
                return resp.json();
            } else {
                return null;
            }
        })

}
