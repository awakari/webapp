// Initialize the editor
let editor = new JSONEditor(document.getElementById("sub_cond_editor"), subCondSchema);
const urlParams = new URLSearchParams(window.location.search);
const args = urlParams.get("args");
if (args) {
    document.getElementById("description").value = args;
    editor.on('ready', function () {
        editor.setValue({
            not: false,
            tc: {
                key: "",
                exact: false,
                term: args,
            },
        });
    });
}

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
    let expires = document.getElementById("expires").value;
    if (expires && expires !== "") {
        const d = new Date(expires);
        expires = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
    } else {
        expires = null;
    }
    const cond = editor.getValue(0);
    const descr = document.getElementById("description").value;
    if (descr === "") {
        validationErr = "empty description";
    }
    if (validationErr === "") {
        const headers = getAuthHeaders();
        const userId = headers["X-Awakari-User-Id"];
        document.getElementById("wait").style.display = "block";
        Subscriptions
            .create(descr, true, expires, cond, headers)
            .then(id => {
                if (id) {
                    document.getElementById("sub-new-success-dialog").style.display = "block";
                    document.getElementById("new-sub-id").innerText = id;
                    if (userId && userId.startsWith("tg://user?id=")) {
                        document.getElementById("sub-new-success-btn-tg").style.display = "block";
                    }
                }
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    } else {
        window.alert(`Validation error: ${validationErr}`);
    }
}
