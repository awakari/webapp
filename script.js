function handleAuthGoogle(response) {
    const credential = response.credential;
    // Decode the JWT token
    const decodedToken = jwt_decode(credential);
    // Extract the user email from the decoded token
    const userEmail = decodedToken.email;
    // show main content
    const divMain = document.getElementById("main");
    divMain.style.display = "block";
}
