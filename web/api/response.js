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

const retriesMax = 10;

async function handleCookieExpiration(resp, reqHeaders, funcRetry) {
    if ((resp.status === 401 || resp.status === 503) && !reqHeaders["Authorization"]) {
        const retry = reqHeaders["X-Awakari-Retry"];
        let retryNum = 0;
        if (retry) {
            try {
                retryNum = parseInt(retry);
            } catch (e) {
                console.error(`Failed to parse the retry number: ${retry}`);
            }
        }
        retryNum ++;
        if (retryNum < retriesMax) {
            reqHeaders["X-Awakari-Retry"] = `${retryNum}`;
            await new Promise(r => setTimeout(r, 1_000));
            return funcRetry(reqHeaders);
        } else {
            console.error("Retries number limit reached.");
        }
        return resp;
    }
    return resp;
}
