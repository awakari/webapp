const Sources = {};

Sources.fetchListPage = function (type, own, order, limit, filter, headers) {
    return fetch(`/v1/src/${type}/list?&own=${own}&order=${order}&limit=${limit}&filter=${filter}`, {
        method: "GET",
        headers: headers,
        cache: "force-cache",
    });
}
