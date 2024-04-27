let EventAttrKeysInt = [];
let EventAttrKeysTxt = [];

async function loadAttributeTypes() {
    return Status
        .fetchAttributeTypes()
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
