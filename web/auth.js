const defaultGroupId = "default";
const keyUserId = "userId";
const keyUserName = "userName";
const keyAuthProvider = "authProvider";
const keyAuthToken = "authToken";

function load() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");
    if (localStorage.getItem(keyUserName)) {
        if (redirect) {
            const args = urlParams.get("args");
            if (args) {
                window.location.assign(`${redirect}?args=${args}`)
            } else {
                window.location.assign(`${redirect}`)
            }
        } else {
            window.location.assign("sub.html");
        }
    } else {
        const userId = urlParams.get(keyUserId);
        if (userId) {
            localStorage.setItem(keyUserId, userId);
            localStorage.setItem(keyUserName, urlParams.get(keyUserName));
            localStorage.setItem(keyAuthToken, urlParams.get(keyAuthToken));
            localStorage.setItem(keyAuthProvider, urlParams.get(keyAuthProvider));
            const state = urlParams.get("state");
            if (state) {
                window.location.assign(state);
            } else {
                window.location.assign("sub.html");
            }
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

const patreonClientId = 'y1fnxWXTuBVi8_fkDnt-F4GwG3qz7qVrUvFLbvPTtU3jHHYylQR2Wluyn4EKYpag';
const patreonRedirectUri = encodeURIComponent('https://awakari.com/v1/patreon/token');
const patreonScope = 'identity identity.memberships'; // Request scopes (customize as needed)

function loginWithPatreon() {
    // Define your Patreon client ID and redirect URI
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");
    let state = "";
    if (redirect) {
        const args = urlParams.get("args");
        if (args) {
            state = encodeURIComponent(`${redirect}&args=${args}`);
        } else {
            state = encodeURIComponent(`${redirect}`);
        }
    }
    // Construct the OAuth authorization URL
    const oauthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${patreonClientId}&redirect_uri=${patreonRedirectUri}&scope=${patreonScope}&state=${state}`;
    // Redirect the user to Patreon's OAuth page
    window.location.href = oauthUrl;
}
