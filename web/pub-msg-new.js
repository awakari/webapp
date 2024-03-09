templateMsgAttr = (name, type, value, required) => ` <span id="msg_attr_${name}" class="mt-1 flex w-full text-sm h-[24x] min-h-[24px] items-center space-x-1">
                        <input type="text" id="msg_attr_${name}_" value="${name}" disabled="disabled" class="min-w-[64px] truncate border focus:shadow-md outline-none"/>
                        <p id="msg_attr_${type}" class="min-w-[64px] truncate">${type}</p>
                        <input type="text" id="msg_attr_${value}" value="${value}" disabled="disabled" class="${required ? 'min-w-[124px]' : ''} w-full truncate border focus:shadow-md outline-none text-slate-700"/>
                        <div style="${required ? 'display: none': ''}">
                            <button type="button" title="Add Attribute" onclick="deleteMessageAttribute('${name}');" class="text-2xl focus:outline-none flex items-center justify-center h-[24px] max-h-[24px] font-mono">
                                -
                            </button>
                        </div>
                    </span>`

function loadForm() {

    document.getElementById("msg_attrs").value = "{}";
    document.getElementById("msg_attrs_form").innerHTML = "";
    document.getElementById("msg_id").value = uuidv4();
    putMessageAttribute("time", "timestamp", new Date().toISOString(), true);

    const authProvider = localStorage.getItem(keyAuthProvider);
    switch (authProvider) {
        case "Telegram":
            document.getElementById("pub-tg").style.display = "block";
            break
    }

    document.getElementById("msg_attr_name").oninput = msgAttrNameChanged;
}

function msgAttrNameChanged(evt) {
    const attrType = document.getElementById("msg_attr_type");
    const attrVal = document.getElementById("msg_attr_value");
    switch (evt.target.value) {
        case "author":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "John Doe");
            break
        case "categories":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "news jobs homes");
            break
        case "contact":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "awakari@awakari.com");
            break
        case "currency":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "USD");
            break
        case "language":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "fi");
            break
        case "latitude":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "-41.94093");
            break
        case "longitude":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "171.523619");
            break
        case "pricemax":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "12.34");
            break
        case "pricemin":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "12.34");
            break
        case "quantitymax":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "1.234");
            break
        case "quantitymin":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "1.234");
            break
        case "quantityunit":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "kg");
            break
        case "secret":
            attrType.value = "bytes";
            attrVal.setAttribute("placeholder", "Ynl0ZXMsIGJhc2U2NCBlbmNvZGVk");
            break
        case "subject":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "breaking");
            break
        case "summary":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "Seasoned software engineer with 10 years of experience");
            break
        case "title":
            attrType.value = "string";
            attrVal.setAttribute("placeholder", "New iPhone 42");
            break
    }
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
    const authToken = localStorage.getItem(keyAuthToken);
    const userId = localStorage.getItem(keyUserId);
    const payload = {
        id: document.getElementById("msg_id").value,
        specVersion: "1.0",
        source: "awakari.com",
        type: "com.github.awakari.webapp",
        attributes: JSON.parse(document.getElementById("msg_attrs").value),
        text_data: document.getElementById("msg_txt_data").value,
    }
    document.getElementById("wait").style.display = "block";
    fetch("/v1/pub", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
        },
        body: JSON.stringify(payload),
    })
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })
        .then(_ => {
            alert("Message has been sent");
            loadForm(); // reset
        })
        .catch(err => {
            alert(err);
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });
}
