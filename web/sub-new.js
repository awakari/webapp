// Initialize the editor
var editor = new JSONEditor(document.getElementById("sub_cond_editor"), subCondSchema);

// Hook up the validation indicator to update its
// status whenever the editor changes
editor.on('change', function () {
    // Get an array of errors from the validator
    var errors = editor.validate();
    // Not valid
    if (errors.length) {
        console.log(errors);
        document.getElementById("button-submit").disabled = "disabled";
    }
    // Valid
    else {
        document.getElementById("button-submit").removeAttribute("disabled");
    }
});

function createSubscription() {
    let validationErr = "";
    let payload = {
        description: document.getElementById("description").value,
        enabled: true,
    }
    if (payload.description === "") {
        validationErr = "empty description";
    } else {
        payload.cond = editor.getValue(0);
    }
    if (validationErr === "") {
        let authToken = localStorage.getItem(keyAuthToken);
        let userId = localStorage.getItem(keyUserId);
        let optsReq = {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "X-Awakari-Group-Id": defaultGroupId,
                "X-Awakari-User-Id": userId,
            },
            body: JSON.stringify(payload)
        };
        fetch(`/v1/sub`, optsReq)
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg));
                    throw new Error(`Request failed ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                if (data) {
                    alert(`Created subscription: ${data.id}`);
                    window.location.assign("sub.html");
                }
            })
            .catch(err => {
                alert(err);
            })
    } else {
        window.alert(`Validation error: ${validationErr}`);
    }
}
