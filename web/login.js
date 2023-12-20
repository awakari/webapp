const defaultGroupId = "default";
const keyUserId = "userId";
const keyUserName = "userName";
const keyAuthToken = "authToken";

function handleAuthGoogle(response) {
    const tokenEncoded = response.credential;
    // Decode the JWT token
    const tokenDecoded = jwt_decode(tokenEncoded);
    sessionStorage.setItem(keyUserId, `${tokenDecoded.iss}/${tokenDecoded.sub}`);
    sessionStorage.setItem(keyAuthToken, tokenEncoded);
    window.location.assign("pub.html");
}

function handleAuthTelegram(user) {
    sessionStorage.setItem(keyUserId, `tg://user?id=${user.id}`);
    sessionStorage.setItem(keyUserName, `${user.first_name} (Telegram)`);
    const token = btoa(JSON.stringify(user));
    sessionStorage.setItem(keyAuthToken, token);
    window.location.assign("pub.html");
}

function logout() {
    const userName = sessionStorage.getItem(keyUserName);
    if (confirm(`Confirm exit for user ${userName}?`)) {
        sessionStorage.removeItem(keyUserName);
        sessionStorage.removeItem(keyUserId);
        sessionStorage.removeItem(keyAuthToken)
        window.location.assign("login.html");
    }
}

function checkSessionExists() {
    const userId = sessionStorage.getItem(keyUserId);
    if (userId != null) {
        // already logged in
        window.location.assign("pub.html");
    }
}
