const defaultGroupId = "default";
const keyUserId = "userId";
const keyUserName = "userName";
const keyAuthProvider = "authProvider";
const keyAuthToken = "authToken";

function load() {
    if (localStorage.getItem(keyUserName)) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redirect");
        if (redirect) {
            const args = urlParams.get("args");
            if (args) {
                window.location.assign(`${redirect}?args=${args}`)
            } else {
                window.location.assign(`${redirect}`)
            }
        } else {
            window.location.assign('sub.html')
        }
    }
}

function handleAuthGoogle(response) {
    const tokenEncoded = response.credential;
    // Decode the JWT token
    const tokenDecoded = jwt_decode(tokenEncoded);
    localStorage.setItem(keyUserId, `${tokenDecoded.iss}/${tokenDecoded.sub}`);
    localStorage.setItem(keyUserName, tokenDecoded.name);
    localStorage.setItem(keyAuthToken, tokenEncoded);
    localStorage.setItem(keyAuthProvider, "Google")
    load();
}

function handleAuthTelegram(user) {
    localStorage.setItem(keyUserId, `tg://user?id=${user.id}`);
    localStorage.setItem(keyUserName, `${user.first_name} ${user.last_name}`);
    localStorage.setItem(keyAuthProvider, "Telegram");
    const token = Base64.encode(JSON.stringify(user));
    localStorage.setItem(keyAuthToken, token);
    load();
}

function logout() {
    const userName = localStorage.getItem(keyUserName);
    const authProvider = localStorage.getItem(keyAuthProvider);
    if (confirm(`Confirm exit for user ${userName} (${authProvider})?`)) {
        logoutConfirmed();
    }
}

function logoutConfirmed() {
    localStorage.removeItem(keyUserName);
    localStorage.removeItem(keyUserId);
    localStorage.removeItem(keyAuthToken);
    localStorage.removeItem(keyAuthProvider);
    window.location.assign("index.html");
}

function getAuthHeaders() {
    let headers = {
        "X-Awakari-Group-Id": defaultGroupId,
    }
    const authToken = localStorage.getItem(keyAuthToken);
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }
    const userId = localStorage.getItem(keyUserId);
    if (userId) {
        headers["X-Awakari-User-Id"] = userId;
    }
    return headers;
}
