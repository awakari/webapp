const defaultGroupId = "default";

function handleAuthGoogle(response) {
    const tokenEncoded = response.credential;
    // Decode the JWT token
    const tokenDecoded = jwt_decode(tokenEncoded);
    sessionStorage.setItem("userId", `${tokenDecoded.iss}/${tokenDecoded.sub}`);
    sessionStorage.setItem("authToken", tokenEncoded);
    // go to subscriptions list
    window.location.assign("sub.html");
}

function handleAuthTelegram(user) {
    sessionStorage.setItem("userId", `tg://user?id=${user.id}`);
    const token = btoa(JSON.stringify(user));
    sessionStorage.setItem("authToken", token);
    // go to subscriptions list
    window.location.assign("sub.html");
}

function logout() {
    const userId = sessionStorage.getItem("userId")
    if (confirm(`User is "${userId}". Confirm exit?`)) {
        sessionStorage.removeItem("userId");
        window.location.assign("index.html");
    }
}
