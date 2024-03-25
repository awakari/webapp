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
    const headers = getAuthHeaders();
    Subscriptions
        .fetch(id, headers)
        .then(data => {
            if (data && data.hasOwnProperty("description")) {
                document.getElementById("description").value = data.description;
                document.getElementById("enabled").checked = data.enabled;
                let expires = new Date(data.expires);
                if (!isNaN(expires) && expires > 0) {
                    expires = new Date(expires.getTime() - 60_000 * expires.getTimezoneOffset());
                    document.getElementById("expires").value = expires.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
                }
                editor.setValue(data.cond);
            }
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });
}

function updateSubscription() {
    const id = document.getElementById("id").value;
    if (confirm(`Update subscription ${id}?`)) {
        const descr = document.getElementById("description").value;
        const enabled = document.getElementById("enabled").checked;
        const cond = editor.getValue(0);
        let expires = document.getElementById("expires").value;
        if (expires && expires !== "") {
            const d = new Date(expires);
            expires = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
        } else {
            expires = null;
        }
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        Subscriptions
            .update(id, descr, enabled, expires, cond, headers)
            .then(updated => {
                if (updated) {
                    alert(`Updated subscription: ${id}`);
                    window.location.assign("sub.html");
                }
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    }
}

function deleteSubscription() {
    const id = document.getElementById("id").value;
    if (confirm(`Delete subscription ${id}?`)) {
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        Subscriptions
            .delete(id, headers)
            .then(deleted => {
                if (deleted) {
                    alert(`Deleted subscription ${id}`);
                    window.location.assign("sub.html");
                }
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    }
}
