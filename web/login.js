const defaultGroupId = "default";
const keyUserId = "userId";
const keyUserName = "userName";
const keyAuthProvider = "authProvider";
const keyAuthToken = "authToken";

function handleAuthGoogle(response) {
    const tokenEncoded = response.credential;
    // Decode the JWT token
    const tokenDecoded = jwt_decode(tokenEncoded);
    localStorage.setItem(keyUserId, `${tokenDecoded.iss}/${tokenDecoded.sub}`);
    localStorage.setItem(keyAuthToken, tokenEncoded);
    window.location.assign("pub.html");
}

function handleAuthTelegram(user) {
    localStorage.setItem(keyUserId, `tg://user?id=${user.id}`);
    localStorage.setItem(keyUserName, user.first_name);
    localStorage.setItem(keyAuthProvider, "Telegram");
    const userJson = JSON.stringify(user);
    const token = btoa(userJson.replace(/[\u00A0-\u2666]/g, function(c) {
        return "&#" + c.charCodeAt(0) + ";";
    }));
    localStorage.setItem(keyAuthToken, token);
    window.location.assign("pub.html");
}

function logout() {
    const userName = localStorage.getItem(keyUserName);
    const authProvider = localStorage.getItem(keyAuthProvider);
    if (confirm(`Confirm exit for user ${userName} (${authProvider})?`)) {
        localStorage.removeItem(keyUserName);
        localStorage.removeItem(keyUserId);
        localStorage.removeItem(keyAuthToken)
        window.location.assign("login.html");
    }
}

function checkSessionExists() {
    const userId = localStorage.getItem(keyUserId);
    if (userId != null) {
        // already logged in
        window.location.assign("pub.html");
    }
}
