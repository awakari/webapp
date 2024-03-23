const Usage = {};

Usage.fetch = function (subj, headers) {
    return fetch(`/v1/usage/${subj}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => {
            if (!resp.ok) {
                if (subj === "1") {
                    throw new Error(`Subscriptions usage request failed with status: ${resp.status}`);
                } else if (subj === "2") {
                    throw new Error(`Publishing usage request failed with status: ${resp.status}`);
                } else {
                    throw new Error(`Invalid usage subject: ${subj}`);
                }
            }
            return resp.json();
        })
}
