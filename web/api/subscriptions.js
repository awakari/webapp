const Subscriptions = {
    urlBase: "https://reader.awakari.com/v2",
}

Subscriptions.fetchOwn = function (limit, headers) {
    return fetch(`${Subscriptions.urlBase}?limit=${limit}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => {
            if (resp) {
                if (!resp.ok) {
                    handleResponseStatus(`List subscriptions`, resp.status);
                    return null;
                }
                return resp;
            } else {
                return null;
            }
        });
}
