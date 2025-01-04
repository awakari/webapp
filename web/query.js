document
    .getElementById("form_search")
    .addEventListener("submit", function (evt){
        evt.preventDefault();
        const q = Base64.encodeURI(document.getElementById("query").value);
        window.location.assign(`login.html?redirect=sub-details.html&args=${q}`);
    });
