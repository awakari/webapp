const Status = {};

Status.fetchAttributeTypes = function () {
    const optsReq = {
        method: "GET",
        cache: "default",
        headers: getAuthHeaders(),
    };
    return fetch(`/v1/status/attr/types`, optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        });
}

Status.fetchAttributeValues = function (name) {
    return fetch(`/v1/status/attr/values/${name}`, {
        method: "GET",
        cache: "default",
    })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                console.log(`Failed to load sample values for attribute ${name}, response status: ${resp.status}`);
            }
            return [];
        });
}
