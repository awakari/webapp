const defaultGroupId = "default";

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
    }
});

function loadSubscription() {
    //
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    document.getElementById("subId").innerHTML = urlParams.get("id");
    //
    const data = {"description":"Exoplanets","enabled":true,"cond":{"gc":{"logic":"Or","group":[{"tc":{"id":"txt_651f009c25fef58d2c176c06","term":"exoplanet экзопланета экзопланет экзопланеты экзопланету"}},{"gc":{"group":[{"tc":{"id":"txt_651f009c25fef58d2c176c13","term":"planet"}},{"tc":{"id":"txt_651f009c25fef58d2c176c27","term":"extrasolar"}}]}}]}},"expires":"0001-01-01T00:00:00Z"};
    editor.setValue(data.cond);
    //
    // let authToken = sessionStorage.getItem("authToken");
    // let userId = sessionStorage.getItem("userId");
    // let optsReq = {
    //     method: "GET",
    //     headers: {
    //         "Authorization": `Bearer ${authToken}`,
    //         "X-Awakari-Group-Id": defaultGroupId,
    //         "X-Awakari-User-Id": userId,
    //     },
    //     cache: "default",
    // }
    // fetch(`/v1/sub/${id}`, optsReq)
    //     .then(resp => {
    //         if (!resp.ok) {
    //             throw new Error(`Request failed with status: ${resp.status}`);
    //         }
    //         return resp.json();
    //     })
    //     .then(data => {
    //         if (data != null) {
    //             document.getElementById("subDescr").value = data.description;
    //             editor.setValue(data.cond);
    //         }
    //     })
    //     .catch(err => {
    //         alert(err);
    //     });
}
