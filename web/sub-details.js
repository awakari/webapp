let conds = [];
const countCondsMax = 6;

const templateCondHeader = (label, idx, countConds, isNot, key) => `
                <fieldset class="flex p-2">
                    <legend class="flex space-x-1 w-full">
                        <span class="mx-2">${label}</span>
                        <label class="flex align-middle space-x-1">
                            <input type="checkbox" 
                                   class="h-4 w-4 sub-cond-not" 
                                   style="margin-right: 0.125rem"
                                   onchange="setConditionNot(${idx}, this)"
                                   ${countConds > 1 ? '' : 'disabled="disabled"'}
                                   ${isNot ? 'checked="checked"' : ''}/>
                            <span>Not</span>
                        </label>
                        <hr class="grow mt-2" style="height: 1px"/>
                        <svg fill="currentColor"
                             width="16px"
                             height="16px"
                             viewBox="-3.5 0 19 19"
                             xmlns="http://www.w3.org/2000/svg"
                             class="cf-icon-svg text-stone-500 sub-cond-delete-button place-self-end"
                             style="${countConds > 1 ? 'display: block': 'display: none'}"
                             onclick="deleteCondition(${idx})">
                            <path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z"/>
                        </svg>
                    </legend>
                    <div class="flex space-x-2 w-full">
                        <fieldset class="px-1 h-10 autocomplete ${label === "Text"? 'autocomplete-key-txt' : 'autocomplete-key-int' }">
                            <legend class="px-1 h-5">
                                <div style="margin-top: 2px">Attribute</div>
                            </legend>
                            <input type="text"
                                   list="attrKeys${idx}" 
                                   class="border-none w-24 sm:w-32 autocomplete-input" 
                                   style="height: 20px; background-color: inherit"
                                   ${label === "Text"? 'placeholder="any"' : 'placeholder="required"'}
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
    templateCondHeader("Text", idx, countConds, isNot, key) + `
                        <fieldset class="px-1 tc h-10 w-full">
                            <legend class="flex px-1">
                                <select class="rounded-sm w-20 h-5 border-none"
                                        onchange="setConditionTextExact(${idx}, this.value === '2')">
                                    <option value="1" ${isExact===false? 'selected="selected"' : ''}>Contains</option>
                                    <option value="2" ${isExact===true ? 'selected="selected"' : ''}>Equals</option>
                                </select>
                            </legend>
                            <input type="text" 
                                   id="attrValTxtInput${idx}"
                                   list="attrValTxt${idx}"
                                   class="border-none w-full" 
                                   style="height: 20px; background-color: inherit"
                                   oninput="setConditionTextTerms(${idx}, this.value)"
                                   placeholder="${isExact? 'completely and exactly' : 'any of space-separated words'}"
                                   value="${terms}"/>
                            <datalist id="attrValTxt${idx}"></datalist>
                        </fieldset>` +
    condFooter;

const templateCondNumber = (isNot, key, op, value, idx, countConds) =>
    templateCondHeader("Number", idx, countConds, isNot, key) + `
                        <fieldset class="px-1 nc h-10 w-full">
                            <legend class="flex px-1">
                                <select class="rounded-sm w-10 px-1 h-5 border-none"
                                        onchange="setConditionNumberOp(${idx}, this.value)">
                                    <option value="1" ${op === 1 ? 'selected="selected"' : ''}>&gt;</option>
                                    <option value="2" ${op === 2 ? 'selected="selected"' : ''}>&ge;</option>
                                    <option value="3" ${op === 3 ? 'selected="selected"' : ''}>=</option>
                                    <option value="4" ${op === 4 ? 'selected="selected"' : ''}>&le;</option>
                                    <option value="5" ${op === 5 ? 'selected="selected"' : ''}>&lt;</option>
                                </select>                                        
                            </legend>
                            <input type="number"
                                   class="border-none w-full"
                                   style="height: 20px; background-color: inherit"
                                   oninput="setConditionNumberValue(${idx}, this.value)"
                                   value="${value}"/>
                        </fieldset>` +
    condFooter;

async function loadSubDetails() {
    await loadAttributeTypes();
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const q = urlParams.get("args");
    const example = urlParams.get("example");
    if (id) {
        loadSubDetailsById(id);
    } else if (example) {
        loadSubDetailsByExample(example);
    } else if (q) {
        loadSubDetailsByQuery(q);
    } else {
        loadSubDetailsByQuery("");
    }
}

_ = loadSubDetails();

const srcPageLimitPerType = 10;

const templateDiscoveredSrc = (addr, type) => `
<p class="w-[334px] sm:w-[624px] truncate">
    <a class="w-full truncate text-blue-500" href="pub-src-details.html?type=${type}&addr=${encodeURIComponent(addr)}">${addr}</a>
</p>`;

function loadSubDetailsById(id) {
    document.getElementById("id").value = id;
    document.getElementById("area-id").style.display = "flex";
    document.getElementById("button-delete").style.display = "flex";
    document.getElementById("sub-discovered-sources").style.display = "block";
    const headers = getAuthHeaders();
    const authProvider = localStorage.getItem(keyAuthProvider);
    switch (authProvider) {
        case "Telegram":
            break;
        default:
            let subFeedLinkElement = document.getElementById("sub-feed-link");
            subFeedLinkElement.href = `https://reader.awakari.com/v1/sub/rss/${id}`;
            subFeedLinkElement.style.display = "block";
            break;
    }
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
                    for (let i = 0; i < children.length; i++) {
                        conds.push(children[i]);
                    }
                }
            }
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
            displayConditions();
        });

    const srcListElement = document.getElementById("sub-discovered-sources");
    Sources
        .fetchListPageResponse("apub", false, "ASC", srcPageLimitPerType, "", headers, id)
        .then(resp => {
            if (!resp.ok) {
                handleResponseStatus(resp.status);
                return null;
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                for (const addr of data) {
                    srcListElement.innerHTML += templateDiscoveredSrc(addr, "apub");
                }
            }
        });
    Sources
        .fetchListPageResponse("feed", false, "ASC", srcPageLimitPerType, "", headers, id)
        .then(resp => {
            if (!resp.ok) {
                handleResponseStatus(resp.status);
                return null;
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                for (const addr of data) {
                    srcListElement.innerHTML += templateDiscoveredSrc(addr, "feed");
                }
            }
        });
    Sources
        .fetchListPageResponse("tgch", false, "ASC", srcPageLimitPerType, "", headers, id)
        .then(resp => {
            if (!resp.ok) {
                handleResponseStatus(resp.status);
                return null;
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                for (const addr of data) {
                    srcListElement.innerHTML += templateDiscoveredSrc(addr, "tgch");
                }
            }
        });
}

function loadSubDetailsByExample(exampleName) {
    document.getElementById("area-id").style.display = "none";
    document.getElementById("button-delete").style.display = "none";
    switch (exampleName) {
        case "cat-images": {
            document.getElementById("description").value = "Cat Images";
            addConditionText(false, "","cat gato قطة katze кошка chatte katt kissa köttur", false);
            addConditionText(false, "imageurl", "http https", false);
            document.getElementById("sub-discover-sources").checked = false;
            break;
        }
        case "cheap-iphone-alert": {
            document.getElementById("description").value = "Cheap iPhone alert";
            addConditionText(false, "","iphone", false);
            addConditionNumber(false, "offersprice", 4, 1000);
            addConditionText(false, "offerspricecurrency","USD", true);
            break;
        }
        case "japanese": {
            document.getElementById("description").value = "In Japanese language";
            addConditionText(false, "language","ja ja-JP", false);
            document.getElementById("sub-discover-sources").checked = false;
            break;
        }
        case "exclude-topics": {
            document.getElementById("description").value = "Tech News: not Apple neither Microsoft";
            addConditionText(false, "", "tech news", false);
            addConditionText(true, "", "apple microsoft", false);
            break;
        }
        case "job-alert": {
            document.getElementById("description").value = "Javascript Job alert";
            addConditionText(false, "", "job", false);
            addConditionText(false, "", "javascript", false);
            addConditionText(true, "", "java", false);
            break;
        }
        case "mentions-of-me": {
            document.getElementById("description").value = "Mentions of Me";
            const userName = localStorage.getItem(keyUserName);
            let userNameParts = [];
            if (userName) {
                userNameParts = userName.split(/\s+/);
            }
            switch (userNameParts.length) {
                case 0: {
                    addConditionText(false, "", "first name", false);
                    addConditionText(false, "", "last name", false);
                    break;
                }
                case 1: {
                    addConditionText(false, "", userNameParts[0], false);
                    addConditionText(false, "", "last name", false);
                    break;
                }
                default: {
                    for (const p of userNameParts) {
                        addConditionText(false, "", p, false);
                    }
                }
            }
            break;
        }
        case "specific-source": {
            document.getElementById("description").value = "From r/Science only";
            addConditionText(false, "source", "https://www.reddit.com/r/science/.rss", true);
            document.getElementById("sub-discover-sources").checked = false;
            break;
        }
    }
    displayConditions();
}

function loadSubDetailsByQuery(q) {
    document.getElementById("description").value = q;
    document.getElementById("area-id").style.display = "none";
    document.getElementById("button-delete").style.display = "none";
    addConditionText(false, "", q, false);
    displayConditions();
}

function addConditionText(not, k, term, exact) {
    conds.push({
        "not": not,
        "tc": {
            "key": k,
            "term": term,
            "exact": exact,
        }
    });
}

function addConditionNumber(not, k, op, v) {
    conds.push({
        "not": not,
        "nc": {
            "key": k,
            "op": op,
            "val": v,
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
            console.error(`Target condition #${idx} is not a text or a number condition`);
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
            if (exact) {
                document.getElementById(`attrValTxtInput${idx}`).placeholder = "completely and exactly";
            } else {
                document.getElementById(`attrValTxtInput${idx}`).placeholder = "any of space-separated words";
            }
        } else {
            console.error(`Target condition #${idx} is not a text condition`);
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
            console.error(`Target condition #${idx} is not a text condition`);
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
    .addEventListener("click", (_) => { addConditionText(false, "", "", false); displayConditions(); });

document
    .getElementById("button-add-cond-num")
    .addEventListener("click", (_) => { addConditionNumber(false, "offersprice", 3, 0); displayConditions(); });

function deleteSubscription() {
    const id = document.getElementById("id").value;
    if (id && confirm(`Delete the interest ${id}?`)) {
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        Subscriptions
            .delete(id, headers)
            .then(deleted => {
                if (deleted) {
                    alert(`Deleted the interest ${id}`);
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
    if (cond != null && confirm(`Update the interest ${id}?`)) {
        const descr = document.getElementById("description").value;
        if (!descr) {
            alert("Empty interest description");
            return;
        }
        let expires = document.getElementById("expires").value;
        if (expires && expires !== "") {
            const d = new Date(expires);
            expires = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
        } else {
            expires = null;
        }
        const discoverSourcesFlag = document.getElementById("sub-discover-sources").checked;
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        Subscriptions
            .update(id, descr, true, expires, cond, discoverSourcesFlag, headers)
            .then(updated => {
                if (updated) {
                    alert(`Updated the interest: ${id}`);
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
            alert("Empty interest description");
            return;
        }
        const discoverSourcesFlag = document.getElementById("sub-discover-sources").checked;
        const headers = getAuthHeaders();
        const userId = headers["X-Awakari-User-Id"];
        document.getElementById("wait").style.display = "block";
        Subscriptions
            .create(descr, true, expires, cond, discoverSourcesFlag, headers)
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
                                window.open(`https://reader.awakari.com/v1/sub/rss/${id}`, '_blank');
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
        alert("Interest should have at least 1 condition");
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
