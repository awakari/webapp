const Past = {};

Past.search = function (q, headers) {
    return fetch(`/v1/past/search?q=${encodeURIComponent(q)}`, {
        method: "GET",
        headers: headers,
        cache: "no-cache",
    })
        .then(resp => handleCookieAuth(resp, headers, (h) => Past.search(q, h)));
}
