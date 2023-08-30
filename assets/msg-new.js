templateMsgAttr = (name, type, value, required) => ` <span id="msg_attr_${name}" class="flex w-full text-xs font-mono h-[24x] min-h-[24px] items-center">
                        <input type="text" id="msg_attr_${name}_" value="${name}" disabled="disabled" class="w-[64px] min-w-[64px] truncate border focus:shadow-md outline-none"/>
                        <p id="msg_attr_${type}" class="w-[64px] min-w-[64px] px-1 truncate">${type}</p>
                        <input type="text" id="msg_attr_${value}" value="${value}" disabled="disabled" class="w-full font-mono truncate border focus:shadow-md outline-none text-slate-700"/>
                        <button type="button" title="Add Attribute" onclick="deleteMessageAttribute('${name}');" class="ml-1 text-2xl font-mono focus:outline-none text-slate-500 hover:text-slate-700 flex items-center justify-center h-[24x] max-h-[24px]">
                            ${required ? "" : "—" }
                        </button>
                    </span>`

function loadForm() {
    document.getElementById("msg_id").value = uuidv4();
    putMessageAttribute("time", "timestamp", new Date().toISOString(), true);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
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
    const userEmail = sessionStorage.getItem("userEmail");
    const payload = {
        id: document.getElementById("msg_id").value,
        specVersion: "1.0",
        source: "awakari.cloud/web",
        type: "com.github.awakari.webapp",
        attributes: JSON.parse(document.getElementById("msg_attrs").value),
        text_data: document.getElementById("msg_txt_data").value,
    }
    const optsReq = {
        method: "POST",
        headers: {
            "X-Awakari-User-Id": userEmail,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    }
    fetch("/v1/events", optsReq)
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg))
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })
        .then(_ => {
            alert("Message has been sent")
            genNewMsgAttrs()
        })
        .catch(err => {
            alert(err)
        })
}
