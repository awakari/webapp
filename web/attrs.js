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

function loadAttributeValues(editor, input) {
    const k = editor.parent.editors.key.input.value;
    switch (k) {
        case "source":
            const headers = getAuthHeaders();
            return Promise.all([
                Sources.fetchListPage("apub", false, "ASC", 3, encodeURIComponent(input), headers),
                Sources.fetchListPage("feed", false, "ASC", 3, encodeURIComponent(input), headers),
                Sources.fetchListPage("site", false, "ASC", 3, encodeURIComponent(input), headers),
                Sources.fetchListPage("tgbc", false, "ASC", 3, encodeURIComponent(input), headers),
                Sources.fetchListPage("tgch", false, "ASC", 3, encodeURIComponent(input), headers),
            ])
                .then(resps => {
                    let promises = [];
                    for (const resp of resps) {
                        if (resp.ok) {
                            promises.push(resp.json());
                        } else {
                            console.log(`Failed to load sample values for key ${k}, response status: ${resp.status}`);
                        }
                    }
                    return Promise.all(promises);
                })
                .then(data => {
                    let addrs = [];
                    for (const list of data) {
                        if (list) {
                            for (const addr of list) {
                                addrs.push(addr);
                            }
                        }
                    }
                    addrs.sort();
                    return addrs;
                })
        default:
            return Status.fetchAttributeValues(k);
    }
}
