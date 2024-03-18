let EventAttrKeysInt = [];
let EventAttrKeysTxt = [];

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
                            EventAttrKeysInt.push(key);
                        }
                        if (type === "string") {
                            EventAttrKeysTxt.push(key);
                        }
                    }
                }
            }
        })
        .catch(err => {
            console.log(err);
        });
}
