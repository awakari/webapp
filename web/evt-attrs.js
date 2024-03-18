let EventAttrKeysInt = [];
let EventAttrKeysTxt = [];

async function loadAttributeTypes() {
    let optsReq = {
        method: "GET",
        cache: "force-cache",
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

function loadAttributeValues(editor, input) {
    const k = editor.parent.editors.key.input.value;
    switch (k) {
        case "source":
            const authToken = localStorage.getItem(keyAuthToken);
            const userId = localStorage.getItem(keyUserId);
            return Promise.all([
                fetch(`/v1/src/apub/list?&own=false&order=ASC&limit=3&filter=${encodeURIComponent(input)}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "X-Awakari-Group-Id": defaultGroupId,
                        "X-Awakari-User-Id": userId,
                    },
                    cache: "force-cache",
                }),
                fetch(`/v1/src/feed/list?&own=false&order=ASC&limit=3&filter=${encodeURIComponent(input)}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "X-Awakari-Group-Id": defaultGroupId,
                        "X-Awakari-User-Id": userId,
                    },
                    cache: "force-cache",
                }),
                fetch(`/v1/src/site/list?&own=false&order=ASC&limit=3&filter=${encodeURIComponent(input)}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "X-Awakari-Group-Id": defaultGroupId,
                        "X-Awakari-User-Id": userId,
                    },
                    cache: "force-cache",
                }),
                fetch(`/v1/src/tgbc/list?&own=false&order=ASC&limit=3&filter=${encodeURIComponent(input)}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "X-Awakari-Group-Id": defaultGroupId,
                        "X-Awakari-User-Id": userId,
                    },
                    cache: "force-cache",
                }),
                fetch(`/v1/src/tgch/list?&own=false&order=ASC&limit=3&filter=${encodeURIComponent(input)}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${authToken}`,
                        "X-Awakari-Group-Id": defaultGroupId,
                        "X-Awakari-User-Id": userId,
                    },
                    cache: "force-cache",
                }),
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
            return fetch(`/v1/status/attr/values/${k}`, {
                method: "GET",
                cache: "force-cache",
            })
                .then(resp => {
                    if (resp.ok) {
                        return resp.json();
                    } else {
                        console.log(`Failed to load sample values for key ${k}, response status: ${resp.status}`);
                    }
                    return [];
                });
    }
}
