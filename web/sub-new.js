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

let keyOptsInt = [];
let keyOptsTxt = [];

function loadAttributeTypes() {
    let optsReq = {
        method: "GET",
    };
    return fetch(`/v1/status/attr/types`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            let typesByKey = null;
            if (data) {
                typesByKey = data.typesByKey;
            }
            if (typesByKey) {
                for (const key of Object.keys(typesByKey)) {
                    const types = typesByKey[key];
                    for (const type of types) {
                        if (type === "int32") {
                            keyOptsInt.push(key);
                        }
                        if (type === "string") {
                            keyOptsTxt.push(key);
                        }
                    }
                }
            }
        })
        .catch(err => {
            console.log(err);
        });
}

window.JSONEditor.defaults.callbacks = {
    "autocomplete": {
        "autoCompleteKeyInt": function search(editor, input) {
            return new Promise(function (resolve) {
                return resolve(keyOptsInt);
            });
        },
        "autoCompleteKeyTxt": function search(editor, input) {
            return new Promise(function (resolve) {
                return resolve(keyOptsTxt);
            });
        },
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
