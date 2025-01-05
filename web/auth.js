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

function logout(redirect) {
    const userName = localStorage.getItem(keyUserName);
    const authProvider = localStorage.getItem(keyAuthProvider);
    if (confirm(`Confirm exit for user ${userName} (${authProvider})?`)) {
        logoutConfirmed(redirect);
    }
}

function logoutConfirmed(redirect) {
    localStorage.removeItem(keyUserName);
    localStorage.removeItem(keyUserId);
    localStorage.removeItem(keyAuthToken);
    localStorage.removeItem(keyAuthProvider);
    if (redirect) {
        window.location.assign(redirect);
    }
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
const patreonRedirectUri = encodeURIComponent('https://patreon.awakari.com/v1/token');
const patreonScope = 'identity identity.memberships campaigns.members';

function loginWithPatreon() {
    let state = "";
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get("redirect");
    if (redirect) {
        state = redirect;
        const args = urlParams.get("args");
        if (args) {
            state = `${state}&args=${args}`;
        }
    }
    state = encodeURIComponent(state);
    // Construct the OAuth authorization URL
    const oauthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${patreonClientId}&redirect_uri=${patreonRedirectUri}&scope=${patreonScope}&state=${state}`;
    // Redirect the user to Patreon's OAuth page
    window.location.href = oauthUrl;
}
