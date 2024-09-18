function loadForm() {
    const headers = getAuthHeaders();
    if (!headers["Authorization"]) {
        //window.location.assign(`login.html?redirect=${window.location}`);
    } else {
        const f = document.getElementById("formTgClientLogin");
        f.addEventListener("submit", async function(evt)  {
            evt.preventDefault();
            const fd = new FormData(f);
            TgClient
                .Login(fd, headers)
                .then(resp => {
                    if (resp.ok) {
                        alert("Success");
                    } else {
                        handleResponseStatus("Telegram Client Login", resp.status);
                    }
                })
        });
    }
}
