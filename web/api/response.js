function handleResponseStatus(code) {
    switch (code) {
        case 429:
            alert("Limit reached. Request to increase.");
            break;
        default:
            alert(`Operation failed, response status: ${code}`);
            break;
    }
}

function handleCookieExpiration(resp, reqHeaders, retry) {
    if ((resp.status === 401 || resp.status === 503) && !reqHeaders["Authorization"] && !reqHeaders["X-Awakari-Retry"] && resp.headers.get("Set-Cookie")) {
        reqHeaders["X-Awakari-Retry"] = "1";
        return retry(reqHeaders);
    }
    return resp;
}
