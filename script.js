google.accounts.id.initialize({
    client_id: '131943559095-6uojftc7uoscij6b4j2jm0ifo4cd6obc.apps.googleusercontent.com',
    callback: handleAuthGoogle
});
const parent = document.getElementById('g_id_onload');
google.accounts.id.renderButton(parent, { theme: 'filled_black' });


function handleAuthGoogle(response) {
    const credential = response.credential;
    // Decode the JWT token
    const decodedToken = jwt_decode(credential);
    // Extract the user email from the decoded token
    const userEmail = decodedToken.email;
    // TODO request to issue a client certificate by the email
    alert(userEmail)
}
