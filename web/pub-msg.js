templateMsgAttr = (name, type, value, required) => ` <span id="msg_attr_${name}" class="mt-1 flex w-full text-sm h-[24x] min-h-[24px] items-center space-x-1">
                        <input type="text" id="msg_attr_${name}_" value="${name}" disabled="disabled" class="${required ? 'border-none' : 'border'} min-w-[64px] truncate focus:shadow-md outline-none"/>
                        <p id="msg_attr_type_${name}" class="min-w-[64px] truncate">${type}</p>
                        <input type="text" id="msg_attr_val_${name}" value="${value}" disabled="disabled" class="${required ? 'min-w-[124px] border-none' : 'border'} w-full truncate focus:shadow-md outline-none text-slate-700"/>
                        <div style="${required ? 'display: none': ''}">
                            <button type="button" title="Delete Attribute" onclick="deleteMessageAttribute('${name}');" class="text-md focus:outline-none flex items-center justify-center h-[24px] max-h-[24px]">
                                <span class="px-1">‒</span>
                            </button>
                        </div>
                    </span>`

async function load() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
        await loadEvent(id);
    } else {
        await loadFormNew();
    }
}

async function loadEvent(id){
    document.getElementById("msg_id").value = id;
    document.getElementById("button-submit").style.display = "none";
    document.getElementById("button-src-report").style.display = "flex";
    document.getElementById("attr-add").style.display = "none";
    document.getElementById("wait").style.display = "block";
    Events
        .fetch(id)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            if (data) {
                document.getElementById("button-src-report").onclick = () => {
                    reportPublicationInappropriate(data.source, data.objecturl, data.id);
                };
                Object
                    .keys(data)
                    .forEach(k => {
                        switch (k) {
                            case "id": {
                                break;
                            }
                            case "data": {
                                document.getElementById("msg_txt_data").value = data.data;
                                break;
                            }
                            default: {
                                const v = data[k];
                                if (Number.isInteger(v)) {
                                    document.getElementById("msg_attrs_form").innerHTML += templateMsgAttr(k, "integer", data[k], true);
                                } else if (typeof v === "boolean") {
                                    document.getElementById("msg_attrs_form").innerHTML += templateMsgAttr(k, "boolean", data[k], true);
                                } else {
                                    const ts = new Date(v);
                                    if (isNaN(ts)) {
                                        let txt = data[k];
                                        txt = txt.replace(/(<([^>]+)>)/gi, "");
                                        document.getElementById("msg_attrs_form").innerHTML += templateMsgAttr(k, "string", txt, true);
                                    } else {
                                        document.getElementById("msg_attrs_form").innerHTML += templateMsgAttr(k, "timestamp", data[k], true);
                                    }
                                }
                                break;
                            }
                        }
                    });
            }
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });
}

async function loadFormNew() {
    document.getElementById("button-src-report").style.display = "none";
    document.getElementById("button-submit").style.display = "flex";
    document.getElementById("msg_attrs").value = "{}";
    document.getElementById("msg_attrs_form").innerHTML = "";
    document.getElementById("msg_id").value = Events.newId();
    putMessageAttribute("time", "timestamp", new Date().toISOString(), true);

    const authProvider = localStorage.getItem(keyAuthProvider);
    switch (authProvider) {
        case "Telegram":
            document.getElementById("pub-tg").style.display = "block";
            break
    }

    document.getElementById("msg_attr_name").oninput = msgAttrNameChanged;

    await loadAttributeTypes();
    let allKeys = [];
    for (const k of EventAttrKeysTxt) {
        allKeys.push(k);
    }
    for (const k of EventAttrKeysInt) {
        allKeys.push(k);
    }
    allKeys.sort();
    const keysElement = document.getElementById("msg_attr_name_opts");
    keysElement.innerHTML = "";
    for (const k of allKeys) {
        keysElement.innerHTML += `<option>${k}</option>`
    }
}

async function msgAttrNameChanged(evt) {
    //
    const k = evt.target.value;
    //
    const attrType = document.getElementById("msg_attr_type");
    switch (k) {
        case "secret":
            attrType.value = "bytes";
            break
        default:
            let typeFound = false;
            for (const keyOpt of EventAttrKeysTxt) {
                if (k === keyOpt) {
                    attrType.value = "string";
                    typeFound = true;
                    break
                }
            }
            if (!typeFound) {
                for (const keyOpt of EventAttrKeysInt) {
                    if (k === keyOpt) {
                        attrType.value = "integer";
                        typeFound = true;
                        break
                    }
                }
            }
    }
    //
    const attrVal = document.getElementById("msg_attr_value");
    return Status
        .fetchAttributeValues(k)
        .then(vals => {
            const valsHtml = document.getElementById("msg_attr_val_opts");
            valsHtml.innerHTML = "";
            attrVal.placeholder = "";
            if (vals && vals.length > 0) {
                attrVal.placeholder = vals[0];
                for (const v of vals) {
                    valsHtml.innerHTML += `<option>${v}</option>`;
                }
            }
        })
}

function isBase64Encoded(str) {
    const base64Regex = /^[A-Za-z0-9+/=]*$/;
    return base64Regex.test(str) && str.length % 4 === 0;
}

function isValidTsRfc3339(timestamp) {
    const regex = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
    return regex.test(timestamp);
}

function isValidUri(uri) {
    try {
        new URL(uri);
        return true;
    } catch (error) {
        return false;
    }
}

function isValidUriReference(uri) {
    const regex = /^(?:(?:https?|ftp):\/\/|mailto:|\/|\.|..\/|\/(?:[^\/]+\/)*)(?:[^\s:\/?#]+:)?(?:[^\s\/?#]*\/)?(?:[^\s?#]*\?[^#]*|)/i;
    return regex.test(uri);
}

function addMessageAttribute() {
    let validationPassed = true;
    const name = document.getElementById("msg_attr_name").value;
    if (name === "") {
        alert("empty attribute name")
        validationPassed = false;
    }
    const type = document.getElementById("msg_attr_type").value;
    const valStr = document.getElementById("msg_attr_value").value;
    let value;
    if (validationPassed) {
        switch (type) {
            case "boolean":
                switch (valStr) {
                    case "true":
                        value = true;
                        break;
                    case "false":
                        value = false;
                        break;
                    default:
                        validationPassed = false;
                        alert(`invalid boolean value: "${valStr}"`);
                }
                break
            case "bytes":
                if (isBase64Encoded(valStr)) {
                    value = valStr;
                } else {
                    validationPassed = false;
                    alert(`invalid bytes (base-64 encoded) value: "${valStr}"`);
                }
                break
            case "integer":
                value = parseInt(valStr, 10);
                if (isNaN(value) || value < -2147483648 || value > 2147483647) {
                    validationPassed = false;
                    alert(`invalid integer (32-bit, signed) value: "${valStr}"`);
                }
                break
            case "timestamp":
                if (isValidTsRfc3339(valStr)) {
                    value = valStr;
                } else {
                    validationPassed = false;
                    alert(`invalid timestamp (RFC3339) value: "${valStr}"`);
                }
                break
            case "uri":
                if (isValidUri(valStr)) {
                    value = valStr;
                } else {
                    validationPassed = false;
                    alert(`invalid uri (absolute) value: "${valStr}"`);
                }
                break
            case "uri_ref":
                if (isValidUriReference(valStr)) {
                    value = valStr;
                } else {
                    validationPassed = false;
                    alert(`invalid uri-ref value: "${valStr}"`);
                }
                break
            default: // string
                value = valStr;
        }
    }
    if (validationPassed) {
        putMessageAttribute(name, type, value, false);
        // reset
        document.getElementById("msg_attr_name").value = "";
        document.getElementById("msg_attr_type").value = "";
        document.getElementById("msg_attr_value").value = "";
    }
}

function putMessageAttribute(name, type, value, required) {
    let msgAttrs = JSON.parse(document.getElementById("msg_attrs").value);
    const replace = msgAttrs.hasOwnProperty(name);
    msgAttrs[name] = {};
    msgAttrs[name][`ce_${type}`] = value;
    document.getElementById("msg_attrs").value = JSON.stringify(msgAttrs, null, 2);
    if (replace) {
        document.getElementById(`msg_attr_${name}`).remove();
    }
    document.getElementById("msg_attrs_form").innerHTML += templateMsgAttr(name, type, value, required);
}

function deleteMessageAttribute(name) {
    let msgAttrs = JSON.parse(document.getElementById("msg_attrs").value);
    delete msgAttrs[name];
    document.getElementById("msg_attrs").value = JSON.stringify(msgAttrs, null, 2);
    document.getElementById(`msg_attr_${name}`).remove();
}

function submitMsg() {
    const id = document.getElementById("msg_id").value;
    const payload = {
        id: id,
        specVersion: "1.0",
        source: "https://awakari.com/pub-msg.html",
        type: "com_awakari_webapp",
        attributes: JSON.parse(document.getElementById("msg_attrs").value),
        text_data: document.getElementById("msg_txt_data").value,
    }
    document.getElementById("wait").style.display = "block";
    const headers = getAuthHeaders();
    Events
        .publish(payload, headers)
        .then(sent => {
            if (sent) {
                alert(`Message has been sent, id: ${id}`);
                load(); // reset
            }
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });
}
