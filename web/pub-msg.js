templateEventAttr = (name, nameFmt, type, value, required) => `
                <fieldset class="p-2" id="msg_attr_${name}" >
                    <legend class="flex space-x-1 w-full px-1 h-5 pt-1 font-monospace">
                        <span id="msg_attr_${name}_" class="w-40">${nameFmt}</span>
                        <span class="text-slate-500 w-20" id="msg_attr_type_${name}">${type}</span>
                        <hr class="grow" style="height: 1px; margin-top: 6px; margin-right: -4px;"/>
                        <svg fill="currentColor"
                             width="16px"
                             height="16px"
                             viewBox="-3.5 0 19 19"
                             xmlns="http://www.w3.org/2000/svg"
                             class="cf-icon-svg text-stone-500 sub-cond-delete-button place-self-end"
                             style="${required ? 'display: none' : 'display: block'}"
                             onclick="deleteMessageAttribute('${name}')">
                            <path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z"/>
                        </svg>
                    </legend>
                    <pre id="msg_attr_val_${name}"
                         style="white-space: pre-wrap; word-wrap: break-word; word-break: break-all"
                         class="text-slate-700 dark:text-slate-400">${value}</pre>
                </fieldset>
`;

function autoResize(txtArea) {
    txtArea.style.height = 'auto'; // Reset height
    txtArea.style.height = txtArea.scrollHeight + 'px'; // Set new height
}

async function load() {

    const headers = getAuthHeaders();
    if (!headers["Authorization"]) {
        window.location.assign(`login.html?redirect=${encodeURIComponent(window.location)}`);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const interestId = urlParams.get("interestId");
    if (id) {
        document.getElementById("msg_txt_data_area").style.display = "none";
        if (interestId && interestId.length > 0) {
            await loadMatch(id, interestId);
        } else {
            await loadEvent(id);
        }
    } else {
        await loadFormNew();
    }
}

async function loadMatch(id, interestId){
    document.getElementById("interestIdArea").style.display = "flex";
    document.getElementById("interestId").href = `sub-details.html?id=${interestId}`;
    document.getElementById("interestId").innerText = interestId;
    document.getElementById("title").innerText = "Result Details";
    const headers = getAuthHeaders();
    try {
        return Interests
            .fetch(interestId, headers)
            .then(resp => resp ? resp.json() : null)
            .then(data => {
                let conds = [];
                if (data) {
                    const cond = data.cond;
                    if (cond.hasOwnProperty("nc") || cond.hasOwnProperty("sc") || cond.hasOwnProperty("tc")) {
                        conds.push(cond);
                    } else if (cond.hasOwnProperty("gc")) {
                        const children = cond.gc.group;
                        for (let i = 0; i < children.length; i++) {
                            conds.push(children[i]);
                        }
                    }
                }
                return conds;
            })
            .then(conds => loadEventAndHighlight(id, conds));
    } catch (e) {
        return loadEvent(id);
    }
}

async function loadEvent(id) {
    return loadEventAndHighlight(id, []);
}

async function loadEventAndHighlight(id, conds){
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
                            default: {
                                let v = data[k];
                                let lbl = k;
                                let val = v;
                                if (Number.isInteger(v)) {
                                    const [lbl, val] = highlightNumberMatch(k, v, conds);
                                    document.getElementById("msg_attrs_form").innerHTML += templateEventAttr(k, lbl,"integer", val, true);
                                } else if (typeof v === "boolean") {
                                    document.getElementById("msg_attrs_form").innerHTML += templateEventAttr(k, k, "boolean", val, true);
                                } else {
                                    const ts = new Date(v);
                                    if (isNaN(ts)) {
                                        const num = Number.parseFloat(v);
                                        if (isNaN(num)) {
                                            let txt = v;
                                            txt = txt.replace(/(<([^>]+)>)/gi, "");
                                            [lbl, val] = highlightTextMatches(k, txt, conds);
                                        } else {
                                            [lbl, val] = highlightNumberMatch(k, num, conds);
                                        }
                                        document.getElementById("msg_attrs_form").innerHTML += templateEventAttr(k, lbl,"string", val, true);
                                        autoResize(document.getElementById(`msg_attr_val_${k}`));
                                    } else {
                                        document.getElementById("msg_attrs_form").innerHTML += templateEventAttr(k, k,"timestamp", val, true);
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

function highlightNumberMatch(k, v, conds) {
    for (let i = 0; i < conds.length; i++) {
        const cond = conds[i];
        if (cond.hasOwnProperty("nc")) {
            const nc = cond.nc;
            if (nc.key === k) {
                switch (nc.op) {
                    case 1: {
                        if (v > nc.val) {
                            k = `<mark>${k}</mark>`;
                            v = `<mark>${v}</mark>`;
                        }
                        break;
                    }
                    case 2: {
                        if (v >= nc.val) {
                            k = `<mark>${k}</mark>`;
                            v = `<mark>${v}</mark>`;
                        }
                        break;
                    }
                    case 3: {
                        if (v === nc.val) {
                            k = `<mark>${k}</mark>`;
                            v = `<mark>${v}</mark>`;
                        }
                        break;
                    }
                    case 4: {
                        if (v <= nc.val) {
                            k = `<mark>${k}</mark>`;
                            v = `<mark>${v}</mark>`;
                        }
                        break;
                    }
                    case 5: {
                        if (v < nc.val) {
                            k = `<mark>${k}</mark>`;
                            v = `<mark>${v}</mark>`;
                        }
                        break;
                    }
                }
            }
        }
    }
    return [k, v];
}

function highlightTextMatches(k, v, conds) {
    for (let i = 0; i < conds.length; i++) {
        const cond = conds[i];
        if (cond.hasOwnProperty("sc") && k === "snippet") {
            v = highlightSemanticConditionMatches(v, cond.sc);
        }
        if (cond.hasOwnProperty("tc")) {
            const tc = cond.tc;
            if (!tc.hasOwnProperty("key") || tc.key === "") {
                v = highlightTextConditionMatches(v, cond.tc);
            } else if(tc.key === k) {
                k = `<mark>${k}</mark>`;
                v = highlightTextConditionMatches(v, cond.tc);
            }
        }
    }
    return [k, v];
}

function highlightSemanticConditionMatches(v, sc) {
    const seg = new Intl.Segmenter(undefined, {granularity: "word"});
    const terms = [...seg.segment(sc.query)];
    for (const i in terms) {
        const term = terms[i];
        if (term.isWordLike) {
            const kw = term.segment;
            const regex = new RegExp(`(${kw})`, 'giu');
            try {
                v = v.replace(regex, '<mark>$1</mark>');
            } catch (e) {
                console.log(e);
            }
        }
    }
    return v;
}

function highlightTextConditionMatches(v, tc) {
    if (tc.exact) {
        if (tc.term === v) {
            v = `<mark>${v}</mark>`;
        }
    } else {
        const seg = new Intl.Segmenter(undefined, {granularity: "word"});
        const terms = [...seg.segment(tc.term)];
        for (const i in terms) {
            const term = terms[i];
            if (term.isWordLike) {
                const kw = term.segment;
                const regex = new RegExp(`(${kw})`, 'giu');
                try {
                    v = v.replace(regex, '<mark>$1</mark>');
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }
    return v;
}

async function loadFormNew() {
    document.getElementById("button-src-report").style.display = "none";
    document.getElementById("button-submit").style.display = "flex";
    document.getElementById("msg_attrs").value = "{}";
    document.getElementById("msg_attrs_form").innerHTML = "";
    document.getElementById("msg_id").value = Events.newId();
    putMessageAttribute("time", "timestamp", new Date().toISOString(), true);

    document.getElementById("msg_attr_name").oninput = msgAttrNameChanged;

    loadAttributeTypes().then(() => {
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
    });
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
    return Metrics
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
        document.getElementById("msg_attr_type").value = "string";
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
    document.getElementById("msg_attrs_form").innerHTML += templateEventAttr(name, name, type, value, required);
    autoResize(document.getElementById(`msg_attr_val_${name}`));
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
        text_data: document.getElementById("msg_txt_data").innerText,
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
