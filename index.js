function handleAuthGoogle(response) {
    const credential = response.credential;
    // Decode the JWT token
    const decodedToken = jwt_decode(credential);
    // Extract the user email from the decoded token
    const userEmail = decodedToken.email;
    sessionStorage.setItem("userEmail", userEmail)
    // go to subscriptions list
    window.location.assign("/subs.html")
}

function logout() {
    sessionStorage.removeItem("userEmail")
    window.location.assign("/")
}
