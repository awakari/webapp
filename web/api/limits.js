const Limits = {};

Limits.fetch = function (subj, headers) {
    return fetch(`/v1/limits/${subj}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => {
            if (!resp.ok) {
                if (subj === "1") {
                    throw new Error(`Subscriptions limit request failed with status: ${resp.status}`);
                } else if (subj === "2") {
                    throw new Error(`Daily publishing limit request failed with status: ${resp.status}`);
                } else {
                    throw new Error(`Invalid subject: ${subj}`);
                }
            }
            return resp.json();
        })

}
