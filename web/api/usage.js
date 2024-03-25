const Usage = {};

Usage.fetch = function (subj, headers) {
    return fetch(`/v1/usage/${subj}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => handleCookieExpiration(resp, headers, (h) => Usage.fetch(subj, h)))
        .then(resp => {
            if (!resp.ok) {
                if (subj === "1" || subj === "2") {
                    handleResponseStatus(resp.status);
                } else {
                    alert(`Invalid usage subject: ${subj}`);
                }
                return null;
            }
            return resp.json();
        });
}
