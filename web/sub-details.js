// Initialize the editor
const editor = new JSONEditor(document.getElementById("sub_cond_editor"), subCondSchema);
loadAttributeTypes();

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

window.JSONEditor.defaults.callbacks = {
    "autocomplete": {
        "autoCompleteKeyInt": function search(editor, input) {
            return new Promise(function (resolve) {
                let keys = [];
                for (const k of EventAttrKeysInt) {
                    if (k.startsWith(input)) {
                        keys.push(k);
                    }
                }
                return resolve(keys);
            });
        },
        "autoCompleteKeyTxt": function search(editor, input) {
            return new Promise(function (resolve) {
                let keys = [];
                for (const k of EventAttrKeysTxt) {
                    if (k.startsWith(input)) {
                        keys.push(k);
                    }
                }
                return resolve(keys);
            });
        },
        "autoCompleteVal": loadAttributeValues,
    },
};

function loadSubscription() {
    //
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    document.getElementById("id").value = id;
    //
    // const data = {"description":"Exoplanets","enabled":true,"cond":{"gc":{"logic":"Or","group":[{"tc":{"id":"txt_651f009c25fef58d2c176c06","term":"exoplanet экзопланета экзопланет экзопланеты экзопланету"}},{"gc":{"group":[{"tc":{"id":"txt_651f009c25fef58d2c176c13","term":"planet"}},{"tc":{"id":"txt_651f009c25fef58d2c176c27","term":"extrasolar"}}]}}]}},"expires":"0001-01-01T00:00:00Z"};
    // editor.setValue(data.cond);
    //
    let headers = {
        "X-Awakari-Group-Id": defaultGroupId,
    }
    const authToken = localStorage.getItem(keyAuthToken);
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }
    const userId = localStorage.getItem(keyUserId);
    if (userId) {
        headers["X-Awakari-User-Id"] = userId;
    }
    let optsReq = {
        method: "GET",
        headers: headers,
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
                document.getElementById("enabled").checked = data.enabled;
                const expires = new Date(data.expires);
                if (!isNaN(expires) && expires > 0) {
                    document.getElementById("expires").value = data.expires.substring(0, 16);
                }
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
        let payload = {
            id: id,
            description: document.getElementById("description").value,
            enabled: document.getElementById("enabled").checked,
            cond: editor.getValue(0),
        }
        const expires = document.getElementById("expires").value;
        if (expires && expires !== "") {
            const d = new Date(expires);
            payload.expires = new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString();
        } else {
            payload.expires = null;
        }

        let headers = {
            "X-Awakari-Group-Id": defaultGroupId,
        }
        const authToken = localStorage.getItem(keyAuthToken);
        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }
        const userId = localStorage.getItem(keyUserId);
        if (userId) {
            headers["X-Awakari-User-Id"] = userId;
        }

        let optsReq = {
            method: "PUT",
            headers: headers,
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
        let headers = {
            "X-Awakari-Group-Id": defaultGroupId,
        }
        const authToken = localStorage.getItem(keyAuthToken);
        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }
        const userId = localStorage.getItem(keyUserId);
        if (userId) {
            headers["X-Awakari-User-Id"] = userId;
        }
        let optsReq = {
            method: "DELETE",
            headers: headers,
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
