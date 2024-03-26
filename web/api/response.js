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
    if (resp.status === 401 && !reqHeaders["Authorization"] && reqHeaders["Cookie"] !== "") {
        return browser
            .cookies
            .remove({
                url: location.href,
                name: "tmpuser-",
            })
            .then((_) => retry(reqHeaders));
    } else {
        return resp;
    }
}
