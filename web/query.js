document
    .getElementById("form_search")
    .addEventListener("submit", function (evt){
        evt.preventDefault();
        const q = Base64.encodeURI(document.getElementById("query").value);
        window.location.assign(`login.html?redirect=sub-details.html&args=${q}`);
    });

document
    .getElementById("mode-simple")
    .addEventListener("submit", async function (evt){
        evt.preventDefault();
        const q = document.getElementById("query").value;
        const discoverSourcesFlag = document.getElementById("sub-discover-sources-simple").checked;
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        await Interests
            .create("", q, undefined, false, cond, discoverSourcesFlag, headers)
            .then(data => {
                if (data != null) {
                    alert("Interest created");
                    window.location.assign("sub.html");
                }
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    });