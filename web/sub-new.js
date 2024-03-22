// Initialize the editor
let editor = new JSONEditor(document.getElementById("sub_cond_editor"), subCondSchema);
loadAttributeTypes();

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

function createSubscription() {
    let validationErr = "";
    let payload = {
        description: document.getElementById("description").value,
        enabled: true,
        cond: {
            not: false,
            gc: {
                logic: 0,
                group: []
            }
        },
    }
    const expires = document.getElementById("expires").value;
    if (expires && expires !== "") {
        const d = new Date(expires);
        payload.expires = new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString();
    }
    if (payload.description === "") {
        validationErr = "empty description";
    } else {
        payload.cond = editor.getValue(0);
    }
    if (validationErr === "") {
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
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        };
        document.getElementById("wait").style.display = "block";
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
                    document.getElementById("sub-new-success-dialog").style.display = "block";
                    document.getElementById("new-sub-id").innerText = data.id;
                    if (userId && userId.startsWith("tg://user?id=")) {
                        document.getElementById("sub-new-success-btn-tg").style.display = "block";
                    }
                }
            })
            .catch(err => {
                alert(err);
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    } else {
        window.alert(`Validation error: ${validationErr}`);
    }
}
