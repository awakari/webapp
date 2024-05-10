let conds = [];
const countCondsMax = 6;

const templateCondHeader = (label, idx, countConds, isNot, key) => `
                <fieldset class="flex p-2">
                    <legend class="flex space-x-2 px-1">
                        <span class="w-14">${label}</span>
                        <label class="flex align-middle">
                            <input type="checkbox" 
                                   class="h-4 w-4 sub-cond-not" 
                                   style="margin-right: 0.125rem"
                                   onchange="setConditionNot(${idx}, this)"
                                   ${countConds > 1 ? '' : 'disabled="disabled"'}
                                   ${isNot ? 'checked="checked"' : ''}/>
                            <span>Not</span>
                        </label>
                        <svg fill="currentColor"
                             width="16px"
                             height="16px"
                             viewBox="-3.5 0 19 19"
                             xmlns="http://www.w3.org/2000/svg"
                             class="cf-icon-svg text-stone-500 sub-cond-delete-button"
                             style="${countConds > 1 ? 'display: block': 'display: none'}"
                             onclick="deleteCondition(${idx})">
                            <path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z"/>
                        </svg>
                    </legend>
                    <div class="flex space-x-2">
                        <fieldset class="px-1 h-9 autocomplete ${label === "Keywords"? 'autocomplete-key-txt' : 'autocomplete-key-int' }">
                            <legend class="px-1">Attribute</legend>
                            <input type="text"
                                   list="attrKeys${idx}" 
                                   class="border-none w-24 sm:w-32 autocomplete-input" 
                                   style="height: 18px; background-color: inherit"
                                   ${label === "Keywords"? 'placeholder="empty: all"' : 'placeholder="required"'}
                                   oninput="setConditionAttrName(${idx}, this.value)"
                                   onchange="setConditionAttrValueOpts(${idx}, this.value)"
                                   value="${key}"/>
                            <datalist id="attrKeys${idx}">
                            </datalist>
                        </fieldset>
`;

const condFooter= `
                    </div>
                </fieldset>
`;

const templateCondText = (isNot, key, terms, isExact, idx, countConds) =>
    templateCondHeader("Keywords", idx, countConds, isNot, key) + `
                        <fieldset class="px-1 h-9 tc">
                            <legend class="flex px-1 space-x-1">
                                <span>Any of keywords</span>
                                <label class="flex">
                                    <input type="checkbox" 
                                           class="h-4 w-4" 
                                           style="margin-right: 0.125rem"
                                           onchange="setConditionTextExact(${idx}, this.checked)"
                                           ${isExact ? 'checked="checked"' : '' }/>
                                    <span>Exact</span>
                                </label>
                            </legend>
                            <input type="text" 
                                   list="attrValTxt${idx}"
                                   class="border-none min-w-[200px] sm:w-68" 
                                   style="height: 18px; background-color: inherit"
                                   oninput="setConditionTextTerms(${idx}, this.value)"
                                   value="${terms}"/>
                            <datalist id="attrValTxt${idx}"></datalist>
                        </fieldset>` +
    condFooter;

const templateCondNumber = (isNot, key, op, value, idx, countConds) =>
    templateCondHeader("Number", idx, countConds, isNot, key) + `
                        <div class="flex space-x-2 nc">
                            <select class="rounded-sm w-10 px-1 mt-4 h-5 border-none"
                                    onchange="setConditionNumberOp(${idx}, this.value)">
                                <option value="1" ${op === 1 ? 'selected="selected"' : ''}>&gt;</option>
                                <option value="2" ${op === 2 ? 'selected="selected"' : ''}>&ge;</option>
                                <option value="3" ${op === 3 ? 'selected="selected"' : ''}>=</option>
                                <option value="4" ${op === 4 ? 'selected="selected"' : ''}>&le;</option>
                                <option value="5" ${op === 5 ? 'selected="selected"' : ''}>&lt;</option>
                            </select>
                            <fieldset class="px-1 h-9">
                                <legend class="px-1">Number</legend>
                                <input type="number"
                                       class="border-none w-[152px]"
                                       style="height: 18px; background-color: inherit"
                                       oninput="setConditionNumberValue(${idx}, this.value)"
                                       value="${value}"/>
                            </fieldset>
                        </div>` +
    condFooter;

async function loadSubDetails() {
    await loadAttributeTypes();
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const q = urlParams.get("args");
    if (id) {
        loadSubDetailsById(id);
    } else if (q) {
        loadSubDetailsByQuery(q);
    } else {
        loadSubDetailsByQuery("");
    }
}

_ = loadSubDetails();

function loadSubDetailsById(id) {
    document.getElementById("id").value = id;
    document.getElementById("area-id").style.display = "flex";
    document.getElementById("button-delete").style.display = "flex";
    const headers = getAuthHeaders();
    Subscriptions
        .fetch(id, headers)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            if (data && data.hasOwnProperty("description")) {
                document.getElementById("description").value = data.description;
                let expires = new Date(data.expires);
                if (!isNaN(expires) && expires > 0) {
                    expires = new Date(expires.getTime() - 60_000 * expires.getTimezoneOffset());
                    document.getElementById("expires").value = expires.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
                }
                const cond = data.cond;
                if (cond.hasOwnProperty("nc") || cond.hasOwnProperty("tc")) {
                    conds.push(cond);
                } else if (cond.hasOwnProperty("gc")) {
                    const children = cond.gc.group;
                    for (let i = 0; i < children.length; i ++) {
                        conds.push(children[i]);
                    }
                }
            }
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
            displayConditions();
        });
}

function loadSubDetailsByQuery(q) {
    document.getElementById("description").value = q;
    document.getElementById("area-id").style.display = "none";
    document.getElementById("button-delete").style.display = "none";
    addConditionText(q);
    displayConditions();
}

function addConditionText(q) {
    conds.push({
        "not": false,
        "tc": {
            "key": "",
            "term": q,
            "exact": false,
        }
    });
}

function addConditionNumber() {
    conds.push({
        "not": false,
        "nc": {
            "key": "offersprice",
            "op": 3, // =
            "val": 0,
        }
    });
}

function deleteCondition(idx) {
    if (conds.length > idx) {
        conds.splice(idx, 1)
    }
    if (conds.length === 1) {
        conds[0].not = false;
    }
    displayConditions();
}

function setConditionNot(idx, e) {
    if (conds.length > idx) {
        let countCondsPositive = 0;
        for (let i = 0; i < conds.length; i++) {
            if (!conds[i].not) {
                countCondsPositive++;
            }
        }
        if (!e.checked || countCondsPositive > 1) {
            conds[idx].not = e.checked;
        } else {
            alert("At least one non-negative condition is required");
            e.checked = false;
        }
    }
}

function setConditionAttrName(idx, name) {
    if (conds.length > idx) {
        const cond = conds[idx];
        if (cond.hasOwnProperty("tc")) {
            cond.tc.key = name;
        } else if (cond.hasOwnProperty("nc")) {
            cond.nc.key = name;
        } else {
            console.error(`Target condition #${idx} is not a keywords or a number condition`);
        }
    }
}

function setConditionAttrValueOpts(idx, key) {
    if (conds.length > idx) {
        const cond = conds[idx];
        if (cond.hasOwnProperty("tc")) {
            loadAttributeValues(key, "", getAuthHeaders()).then(opts => {
                const optsElement = document.getElementById(`attrValTxt${idx}`);
                optsElement.innerHTML = "";
                if (opts) {
                    for (const opt of opts) {
                        optsElement.innerHTML += `<option>${opt}</option>\n`;
                    }
                }
            });
        }
    }
}

function setConditionTextExact(idx, exact) {
    if (conds.length > idx) {
        const cond = conds[idx];
        if (cond.hasOwnProperty("tc")) {
            cond.tc.exact = exact;
        } else {
            console.error(`Target condition #${idx} is not a keywords condition`);
        }
    }
}

function setConditionTextTerms(idx, terms) {
    if (conds.length > idx) {
        const cond = conds[idx];
        if (cond.hasOwnProperty("tc")) {
            cond.tc.term = terms;
            loadAttributeValues(cond.tc.key, terms, getAuthHeaders()).then(opts => {
                if (opts) {
                    const optsElement = document.getElementById(`attrValTxt${idx}`);
                    optsElement.innerHTML = "";
                    for (const opt of opts) {
                        optsElement.innerHTML += `<option>${opt}</option>\n`;
                    }
                }
            });
        } else {
            console.error(`Target condition #${idx} is not a keywords condition`);
        }
    }
}

function setConditionNumberOp(idx, op) {
    if (conds.length > idx) {
        const cond = conds[idx];
        if (cond.hasOwnProperty("nc")) {
            cond.nc.op = parseInt(op);
        } else {
            console.error(`Target condition #${idx} is not a number condition`);
        }
    }
}

function setConditionNumberValue(idx, val) {
    if (conds.length > idx) {
        const cond = conds[idx];
        if (cond.hasOwnProperty("nc")) {
            cond.nc.val = Number(val);
        } else {
            console.error(`Target condition #${idx} is not a number condition`);
        }
    }
}

function displayConditions() {
    const elemConds = document.getElementById("conditions");
    elemConds.innerHTML = "";
    const countConds = conds.length;
    for (let i = 0; i < countConds; i ++) {
        const cond = conds[i];
        let not = false;
        if (cond.hasOwnProperty("not")) {
            not = cond.not;
        }
        if (cond.hasOwnProperty("tc")) {
            const tc = cond.tc;
            let key = "";
            if (tc.hasOwnProperty("key")) {
                key = tc.key;
            }
            let exact = false;
            if (tc.hasOwnProperty("exact")) {
                exact = tc.exact;
            }
            elemConds.innerHTML += templateCondText(not, key, tc.term, exact, i, countConds);
            const attrKeysTxt = document.getElementById(`attrKeys${i}`);
            for (const attKeyTxt of EventAttrKeysTxt) {
                attrKeysTxt.innerHTML += `<option>${attKeyTxt}</option>\n`;
            }
        } else if (cond.hasOwnProperty("nc")) {
            const nc = cond.nc;
            const op = nc.op;
            let key = "";
            if (nc.hasOwnProperty("key")) {
                key = nc.key;
            }
            let val = 0;
            if (nc.hasOwnProperty("val")) {
                val = nc.val;
            }
            elemConds.innerHTML += templateCondNumber(not, key, op, val, i, countConds);
            const attrKeysInt = document.getElementById(`attrKeys${i}`);
            for (const attKeyInt of EventAttrKeysInt) {
                attrKeysInt.innerHTML += `<option>${attKeyInt}</option>\n`;
            }
        }
    }
    //
    if (countConds < countCondsMax) {
        document.getElementById("button-add-cond-txt").removeAttribute("disabled");
        document.getElementById("button-add-cond-num").removeAttribute("disabled");
    } else {
        document.getElementById("button-add-cond-txt").disabled = "disabled";
        document.getElementById("button-add-cond-num").disabled = "disabled";
    }
}

document
    .getElementById("button-add-cond-txt")
    .addEventListener("click", (_) => { addConditionText(""); displayConditions(); });

document
    .getElementById("button-add-cond-num")
    .addEventListener("click", (_) => { addConditionNumber(); displayConditions(); });

function deleteSubscription() {
    const id = document.getElementById("id").value;
    if (id && confirm(`Delete the subscription ${id}?`)) {
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        Subscriptions
            .delete(id, headers)
            .then(deleted => {
                if (deleted) {
                    alert(`Deleted the subscription ${id}`);
                    window.location.assign("sub.html");
                }
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    }
}

function submitSubscription() {
    const id = document.getElementById("id").value;
    if (id) {
        updateSubscription(id);
    } else {
        createSubscription();
    }
}

function updateSubscription(id) {
    const cond = getRootCondition();
    if (cond != null && confirm(`Update the subscription ${id}?`)) {
        const descr = document.getElementById("description").value;
        if (!descr) {
            alert("Empty subscription description");
            return;
        }
        let expires = document.getElementById("expires").value;
        if (expires && expires !== "") {
            const d = new Date(expires);
            expires = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
        } else {
            expires = null;
        }
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        Subscriptions
            .update(id, descr, true, expires, cond, headers)
            .then(updated => {
                if (updated) {
                    alert(`Updated the subscription: ${id}`);
                    window.location.assign("sub.html");
                }
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    }
}

function createSubscription() {
    const cond = getRootCondition();
    if (cond != null) {
        let expires = document.getElementById("expires").value;
        if (expires && expires !== "") {
            const d = new Date(expires);
            expires = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
        } else {
            expires = null;
        }
        const descr = document.getElementById("description").value;
        if (descr === "") {
            alert("Empty subscription description");
            return;
        }
        const headers = getAuthHeaders();
        const userId = headers["X-Awakari-User-Id"];
        document.getElementById("wait").style.display = "block";
        Subscriptions
            .create(descr, true, expires, cond, headers)
            .then(id => {
                if (id) {
                    document.getElementById("sub-new-success-dialog").style.display = "block";
                    document.getElementById("new-sub-id").innerText = id;
                    if (userId) {
                        if (userId.startsWith("tg://user?id=")) {
                            document.getElementById("sub-new-success-btn-tg").style.display = "block";
                        } else {
                            document.getElementById("sub-new-success-btn-feed").style.display = "block";
                            document.getElementById("sub-new-success-btn-feed").onclick = () => {
                                window.open(`https://awakari.com/v1/sub/feed/${id}`, '_blank');
                            }
                        }
                    }
                }
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    }
}

function getRootCondition() {
    let cond = null;
    if (conds.length === 1) {
        cond = conds[0];
        cond = validateCondition(cond);
    } else if (conds.length > 1) {
        for (let i = 0; i < conds.length; i ++) {
            if (null == validateCondition(conds[i])) {
                return null;
            }
        }
        cond = {
            not: false,
            gc: {
                logic: 0,
                group: conds,
            }
        }
    } else {
        alert("Subscription should have at least 1 condition");
    }
    return cond;
}

function validateCondition(cond) {
    if (cond.hasOwnProperty("nc")) {
        if (!cond.nc.key || cond.nc.key === "") {
            alert("Number condition should have a non-empty attribute name");
            return null;
        }
        if (cond.nc.op === 0) {
            alert("Number condition operator is not recognized");
            return null;
        }
    } else if (cond.hasOwnProperty("tc")) {
        if (cond.tc.term.length < 3) {
            // TODO check meaningful characters
            alert("Keywords length should be at least 3 symbols");
            return null;
        }
    } else {
        alert("Unrecognized condition type");
        return null;
    }
    return cond;
}
