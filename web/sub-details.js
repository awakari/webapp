// Initialize the editor
const editor = new JSONEditor(document.getElementById("sub_cond_editor"), subCondSchema);

// Hook up the validation indicator to update its
// status whenever the editor changes
editor.on('change', function () {
    // Get an array of errors from the validator
    const errors = editor.validate();
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

function loadSubscription() {
    //
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    document.getElementById("id").value = id;
    //
    // const data = {"description":"Exoplanets","enabled":true,"cond":{"gc":{"logic":"Or","group":[{"tc":{"id":"txt_651f009c25fef58d2c176c06","term":"exoplanet экзопланета экзопланет экзопланеты экзопланету"}},{"gc":{"group":[{"tc":{"id":"txt_651f009c25fef58d2c176c13","term":"planet"}},{"tc":{"id":"txt_651f009c25fef58d2c176c27","term":"extrasolar"}}]}}]}},"expires":"0001-01-01T00:00:00Z"};
    // editor.setValue(data.cond);
    //
    let authToken = localStorage.getItem(keyAuthToken);
    let userId = localStorage.getItem(keyUserId);
    let optsReq = {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
        },
        cache: "default",
    }

    document.getElementById("wait").style.display = "block";
    fetch(`/v1/sub/${id}`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null) {
                document.getElementById("description").value = data.description;
                editor.setValue(data.cond);
            }
        })
        .catch(err => {
            alert(err);
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });
}

function updateSubscription() {
    const id = document.getElementById("id").value;
    if (confirm(`Confirm update subscription ${id}?`)) {
        let authToken = localStorage.getItem(keyAuthToken);
        let userId = localStorage.getItem(keyUserId);
        let payload = {
            id: id,
            description: document.getElementById("description").value,
            enabled: true,
            cond: editor.getValue(0),
        }
        let optsReq = {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "X-Awakari-Group-Id": defaultGroupId,
                "X-Awakari-User-Id": userId,
            },
            body: JSON.stringify(payload)
        }

        document.getElementById("wait").style.display = "block";
        fetch(`/v1/sub/${id}`, optsReq)
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg))
                    throw new Error(`Request failed ${resp.status}`);
                }
                return resp.json();
            })
            .then(_ => {
                alert(`Updated subscription: ${id}`);
                window.location.assign("sub.html");
            })
            .catch(err => {
                alert(err)
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    }
}

function deleteSubscription() {
    const id = document.getElementById("id").value;
    if (confirm(`Confirm delete subscription ${id}?`)) {
        let authToken = localStorage.getItem(keyAuthToken);
        let userId = localStorage.getItem(keyUserId);
        let optsReq = {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "X-Awakari-Group-Id": defaultGroupId,
                "X-Awakari-User-Id": userId,
            },
            cache: "default",
        }
        document.getElementById("wait").style.display = "block";
        fetch(`/v1/sub/${id}`, optsReq)
            .then(resp => {
                if (!resp.ok) {
                    throw new Error(`Request failed with status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(_ => {
                alert(`Deleted subscription ${id}`);
                window.location.assign("sub.html");
            })
            .catch(err => {
                alert(err);
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    }
}
