function handleAuthGoogle(response) {
    const credential = response.credential;
    // Decode the JWT token
    const decodedToken = jwt_decode(credential);
    // Extract the user email from the decoded token
    const userEmail = decodedToken.email;
    // show main content
    const divLogin = document.getElementById("login");
    divLogin.style.display = "none";
    const divMain = document.getElementById("subscriptions");
    divMain.style.display = "flex";
}

function logout() {
    const divLogin = document.getElementById("login");
    divLogin.style.display = "flex";
    const divMain = document.getElementById("subscriptions");
    divMain.style.display = "none";
}
