function handleResponseStatus(code) {
    switch (code) {
        case 401:
            alert("Access failure. Sign in or clean cookies.");
            break;
        case 429:
            alert("Limit reached. Request to increase.");
            break;
        default:
            alert(`Operation failed, response status: ${code}`);
            break;
    }
}
