const defaultGroupId = "default"

function handleAuthGoogle(response) {
    const tokenEncoded = response.credential;
    // Decode the JWT token
    const tokenDecoded = jwt_decode(tokenEncoded);
    sessionStorage.setItem("userId", `${tokenDecoded.iss}/${tokenDecoded.sub}`);
    sessionStorage.setItem("authToken", tokenEncoded);
    // go to subscriptions list
    window.location.assign("subs.html");
}

function handleAuthTelegram(user) {
    sessionStorage.setItem("userId", `tg://user?id=${user.id}`);
    const token = btoa(JSON.stringify(user));
    sessionStorage.setItem("authToken", token);
    // go to subscriptions list
    window.location.assign("subs.html");
}

function logout() {
    if (confirm("Confirm exit?")) {
        sessionStorage.removeItem("userId");
        window.location.assign("index.html");
    }
}