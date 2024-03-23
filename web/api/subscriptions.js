const Subscriptions = {};

Subscriptions.fetchListPage = function (cursor, order, filter, headers) {
    return fetch(`/v1/sub?limit=${pageLimit}&cursor=${cursor}&order=${order}&filter=${encodeURIComponent(filter)}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Subscriptions list request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
}
