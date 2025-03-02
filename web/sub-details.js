let conds = [];
const countCondsMax = 6;
const srcPageLimitPerType = 10;

const templateCondHeader = (label, idx, countConds, isNot, key) => `
                <fieldset class="flex p-2">
                    <legend class="flex space-x-1 w-full px-1">
                        <label class="flex space-x-1">
                            <span>${label} in</span>
                            <input type="text"
                                   pattern="[a-z0-9]{0,20}"
                                   autocapitalize="none"
                                   list="attrKeys${idx}" 
                                   class="${label === "Text"? "w-[144px]" : "w-[120px]"} autocomplete-input" 
                                   style="margin-top: -2px; border-top: none; border-left: none; border-right: none; height: 20px"
                                   ${label === "Text"? 'placeholder="empty: any attribute"' : 'placeholder="attribute"'}
                                   oninput="setConditionAttrName(${idx}, this.value)"
                                   onchange="setConditionAttrValueOpts(${idx}, this.value); updateDescription()"
                                   value="${key}"/>
                            <datalist id="attrKeys${idx}">
                            </datalist>
                        </label>
                        <label class="flex align-middle space-x-1 pl-2">
                            <input type="checkbox" 
                                   class="h-4 w-4 sub-cond-not pt-1"
                                   onchange="setConditionNot(${idx}, this); updateDescription()"
                                   ${countConds > 1 ? '' : 'disabled="disabled"'}
                                   ${isNot ? 'checked="checked"' : ''}/>
                            <span>Not</span>
                        </label>
                        <hr class="grow" style="height: 1px; margin-top: 9px; margin-right: -4px;"/>
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
`;

const templateCondText = (isNot, key, terms, isExact, idx, countConds) =>
    templateCondHeader("Text", idx, countConds, isNot, key) + `
                        <legend class="flex px-1">
                            <select class="rounded-sm w-28 h-5 border-none"
                                    onchange="setConditionTextExact(${idx}, this.value === '2')">
                                <option value="1" ${isExact===false? 'selected="selected"' : ''}>Contains Any</option>
                                <option value="2" ${isExact===true ? 'selected="selected"' : ''}>Equals to</option>
                            </select>
                        </legend>
                        <input type="text" 
                               autocapitalize="none"
                               id="attrValTxtInput${idx}"
                               list="attrValTxt${idx}"
                               class="w-full"
                               minlength="2"
                               style="height: 20px; border-right: none; border-left: none; border-top: none"
                               oninput="setConditionTextTerms(${idx}, this.value); updateDescription()"
                               placeholder="${isExact? 'exact complete text' : 'keyword1 keyword2 ...'}"
                               value="${terms}"/>
                        <datalist id="attrValTxt${idx}"></datalist>
                    </div>
                </fieldset>
`;

const templateCondNumber = (isNot, key, op, value, idx, countConds) =>
    templateCondHeader("Number", idx, countConds, isNot, key) + `
                        <legend class="flex px-1">
                            <select class="rounded-sm w-10 px-1 h-5 border-none"
                                    onchange="setConditionNumberOp(${idx}, this.value); updateDescription()">
                                <option value="1" ${op === 1 ? 'selected="selected"' : ''}>&gt;</option>
                                <option value="2" ${op === 2 ? 'selected="selected"' : ''}>&ge;</option>
                                <option value="3" ${op === 3 ? 'selected="selected"' : ''}>=</option>
                                <option value="4" ${op === 4 ? 'selected="selected"' : ''}>&le;</option>
                                <option value="5" ${op === 5 ? 'selected="selected"' : ''}>&lt;</option>
                            </select>                                        
                        </legend>
                        <input type="number"
                               class="w-full"
                               style="height: 20px; border-left: none; border-right: none; border-top: none"
                               oninput="setConditionNumberValue(${idx}, this.value); updateDescription()"
                               value="${value}"/>
                    </div>
                </fieldset>
`;

async function loadSubDetails() {

    document.getElementById("mode-simple-wait-lang").display = "block";
    loadAttributeValues("language", "", getAuthHeaders())
        .then(opts => {
            if (opts) {
                const optsElement = document.getElementById("mode-simple-lang");
                let languages = [];
                for (const opt of opts) {
                    let l = opt.trim().toLowerCase();
                    if (l.length > 2) {
                        l = l.slice(0, 2);
                    }
                    if (l.length > 1) {
                        languages.push(l);
                    }
                }
                const uniqLangs = [...new Set(languages)];
                uniqLangs.sort((a, b) => a.localeCompare(b));
                let newContent = "";
                for (const l of uniqLangs) {
                    newContent += `<option value=${l} selected="selected">${l}</option>\n`;
                }
                optsElement.innerHTML = newContent;
            }
        })
        .then(() => {
            $('.multiselect').multipleSelect("refresh");
        })
        .finally(() => {
            document.getElementById("mode-simple-wait-lang").display = "none";
        });

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const q = urlParams.get("args");
    const example = urlParams.get("example");
    if (id) {
        document.getElementById("mode-toggle").style.display = "none";
        loadSubDetailsById(id);
    } else if (example) {
        document.getElementById("mode-toggle").style.display = "none";
        loadSubDetailsByExample(example);
    } else if (q) {
        document.getElementById("mode-toggle").style.display = "flex";
        try {
            loadSubDetailsByQuery(Base64.decode(q));
        } catch (e) {
            loadSubDetailsByQuery("");
        }
        setModeSimple(true, true);
    } else {
        document.getElementById("mode-toggle").style.display = "flex";
        loadSubDetailsByQuery("");
        setModeSimple(true, true);
    }
}

function setModeSimple(simple, confirmed) {
    if (!confirmed) {
        confirmed = confirm("This will drop current changes, if any. Continue?");
    }
    if (confirmed) {
        if (simple && simple !== "false") {
            document.getElementById("mode-toggle-checkbox").checked = false;
            document.getElementById("mode-simple").style.display = "block";
            document.getElementById("mode-expert").style.display = "none";
        } else {
            document.getElementById("mode-toggle-checkbox").checked = true;
            document.getElementById("mode-simple").style.display = "none";
            document.getElementById("mode-expert").style.display = "block";
        }
    }
}

_ = loadSubDetails();

const templateDiscoveredSrc = (addr, type) => `
<p class="w-[334px] sm:w-[624px] truncate">
    <a class="w-full truncate text-blue-500" href="pub-src-details.html?type=${type}&addr=${encodeURIComponent(addr)}">${addr}</a>
</p>`;

function loadSubDetailsById(id) {
    document.getElementById("id").value = id;
    document.getElementById("sub-discovered-sources").style.display = "block";
    document.getElementById("area-follow").style.display = "flex";
    document.getElementById("follow-feed").href = `https://reader.awakari.com/v1/sub/rss/${id}`;
    document.getElementById("follow-telegram").href = `https://t.me/AwakariBot?start=${id}`;
    const headers = getAuthHeaders();
    Interests
        .fetch(id, headers)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            let p;
            if (data && data.hasOwnProperty("description")) {
                document.getElementById("description").value = data.description;
                document.getElementById("interest-enabled").checked = data.enabled;
                if (data.hasOwnProperty("enabledSince") && ((new Date(data.enabledSince)) > (new Date()))) {
                    document.getElementById("suspended-until").style.display = "block";
                    let enabledSince = new Date(data.enabledSince);
                    enabledSince.setSeconds(0, 0);
                    document.getElementById("suspended-until").innerHTML = `
<p>Suspended until ${enabledSince.toISOString().slice(0, 16)} UTC.</p>
<p>This might happen due to high matching rate.</p>
<p>Review interest filters and make it more specific.</p>`;
                } else {
                    document.getElementById("suspended-until").style.display = "none";
                }
                if (data.hasOwnProperty("own") && data.own) {
                    document.getElementById("interest-enabled").disabled = false;
                    document.getElementById("button-delete").style.display = "flex";
                } else {
                    document.getElementById("button-submit").style.display = "none";
                    document.getElementById("button-delete").style.display = "none";
                }
                if (data.hasOwnProperty("public")) {
                    document.getElementById("public").checked = data.public;
                    document.getElementById("follow-bluesky").style.display = "block";
                    document.getElementById("follow-bluesky").onclick = () => {
                        const addrFediverse = `@${id}.activitypub.awakari.com.ap.brid.gy`;
                        navigator
                            .clipboard
                            .writeText(addrFediverse)
                            .then(() => {
                                alert(`Copied the address to the clipboard:\n\n${addrFediverse}\n\nOpen your Bluesky client app, paste to a search field and follow.`);
                            });
                    }
                    document.getElementById("follow-fediverse").style.display = "block";
                    document.getElementById("follow-fediverse").onclick = () => {
                        const addrFediverse = `@${id}@activitypub.awakari.com`;
                        navigator
                            .clipboard
                            .writeText(addrFediverse)
                            .then(() => {
                                alert(`Copied the address to the clipboard:\n\n${addrFediverse}\n\nOpen your Fediverse client, paste to a search field and follow.`);
                            });
                    }
                    if (navigator.share && navigator.canShare) {
                        document.getElementById("area-button-share").style.display = "block";
                        document.getElementById("button-share").onclick = () => {
                            p = navigator.share({
                                title: `Awakari Interest: ${data.description}`,
                                url: window.location.href,
                            });
                        };
                    }
                } else {
                    document.getElementById("follow-bluesky").style.display = "none";
                    document.getElementById("follow-fediverse").style.display = "none";
                }
                if (data.hasOwnProperty("followers")) {
                    document.getElementById("followers").value = data.followers;
                }
                let expires = new Date(data.expires);
                if (!isNaN(expires) && expires > 0) {
                    expires = new Date(expires.getTime() - 60_000 * expires.getTimezoneOffset());
                    document.getElementById("expires").value = expires.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
                }
                const cond = data.cond;
                if (cond.hasOwnProperty("nc") || cond.hasOwnProperty("tc")) {
                    conds.push(cond);
                    addConditionText(false, "", "", false);
                } else if (cond.hasOwnProperty("gc")) {
                    document.getElementById("logic-select").selectedIndex = cond.gc.logic;
                    const children = cond.gc.group;
                    for (let i = 0; i < children.length; i++) {
                        conds.push(children[i]);
                    }
                    if (children.length < 1) {
                        addConditionText(false, "", "", false);
                    }
                    if (children.length < 2) {
                        addConditionText(false, "", "", false);
                    }
                }
            }
            return p;
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
            displayConditions();
        });

    const srcListElement = document.getElementById("sub-discovered-sources-list");
    Sources
        .fetchListPageResponse("apub", false, "ASC", srcPageLimitPerType, "", headers, id)
        .then(resp => {
            if (!resp.ok) {
                handleResponseStatus("List ActivityPub sources", resp.status);
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
        })
        .catch(e => {
           console.log(e);
        });
    Sources
        .fetchListPageResponse("feed", false, "ASC", srcPageLimitPerType, "", headers, id)
        .then(resp => {
            if (!resp.ok) {
                handleResponseStatus("List Feed sources", resp.status);
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
        })
        .catch(e => {
            console.log(e);
        });
    Sources
        .fetchListPageResponse("tgch", false, "ASC", srcPageLimitPerType, "", headers, id)
        .then(resp => {
            if (!resp.ok) {
                console.log(`List Telegram sources: ${resp.status}, ${resp.statusText}`);
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
        })
        .catch(e => {
            console.log(e);
        });
}

function loadSubDetailsByExample(exampleName) {
    document.getElementById("button-delete").style.display = "none";
    document.getElementById("id").readOnly = false;
    document.getElementById("interest-enabled").checked = true;
    document.getElementById("interest-enabled").disabled = true;
    switch (exampleName) {
        case "cheap-iphone": {
            document.getElementById("description").value = "Cheap iPhone";
            addConditionText(false, "","iphone", false);
            addConditionNumber(false, "offersprice", 4, 1000);
            addConditionText(false, "offerspricecurrency","USD", true);
            break;
        }
        case "chinese": {
            document.getElementById("description").value = "In Chinese language";
            addConditionText(false, "language","zh", false);
            document.getElementById("sub-discover-sources").checked = false;
            break;
        }
        case "exclude-words": {
            document.getElementById("description").value = "Cloud: not Amazon neither Microsoft";
            addConditionText(false, "", "cloud", false);
            addConditionText(false, "", "compute service storage", false);
            addConditionText(true, "", "amazon aws microsoft", false);
            break;
        }
        case "job-alert": {
            document.getElementById("description").value = "Javascript Job alert";
            addConditionText(false, "", "job hiring", false);
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
        case "quake-greece": {
            document.getElementById("description").value = "Earthquakes: Greece";
            addConditionText(false, "source", "wss://www.seismicportal.eu/standing_order/websocket", true);
            document.getElementById("sub-discover-sources").checked = false;
            addConditionNumber(false, "latitude", 1, 34)
            addConditionNumber(false, "longitude", 1, 19.8)
            addConditionNumber(false, "latitude", 5, 42)
            addConditionNumber(false, "longitude", 5, 26.5)
            addConditionNumber(false, "magnitude", 2, 3)
            break;
        }
        case "sentiment": {
            document.getElementById("description").value = "AI: negative sentiment";
            addConditionText(false, "","artificial", false);
            addConditionText(false, "","intelligence", false);
            addConditionNumber(false, "sentiment", 5, 0);
            break;
        }
    }
    displayConditions();
}

function loadSubDetailsByQuery(q) {
    document.getElementById("id").readOnly = false;
    document.getElementById("description").value = q;
    document.getElementById("simple-query").value = q;
    document.getElementById("interest-enabled").checked = true;
    document.getElementById("interest-enabled").disabled = true;
    document.getElementById("button-delete").style.display = "none";
    if (q && q.length > 0) {
        const seg = new Intl.Segmenter(undefined, {granularity: "word"});
        [...seg.segment(q)]
            .filter(term => term.isWordLike)
            .forEach(term => addConditionText(false, "", term.segment, false));
    } else {
        addConditionText(false, "", "", false);
        addConditionText(false, "", "", false)
    }
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
            alert("At least one inclusive filter is required");
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
    if (conds.length > idx && key !== "") {
        const cond = conds[idx];
        if (cond.hasOwnProperty("tc")) {
            loadAttributeValues(key, "", getAuthHeaders()).then(opts => {
                const optsElement = document.getElementById(`attrValTxt${idx}`);
                let newContent = "";
                if (opts) {
                    for (const opt of opts) {
                        newContent += `<option>${opt}</option>\n`;
                    }
                }
                optsElement.innerHTML = newContent;
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
                document.getElementById(`attrValTxtInput${idx}`).placeholder = "exact complete text";
            } else {
                document.getElementById(`attrValTxtInput${idx}`).placeholder = "keyword1 keyword2 ...";
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
            if (cond.tc.key !== "") {
                loadAttributeValues(cond.tc.key, terms, getAuthHeaders()).then(opts => {
                    if (opts) {
                        const optsElement = document.getElementById(`attrValTxt${idx}`);
                        optsElement.innerHTML = "";
                        for (const opt of opts) {
                            optsElement.innerHTML += `<option>${opt}</option>\n`;
                        }
                    }
                });
            }
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
            console.error(`Target filter #${idx} is not a number filter`);
        }
    }
}

function updateDescription() {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
        return;
    }
    const q = urlParams.get("args");
    if (q) {
        return;
    }
    const example = urlParams.get("example");
    if (example) {
        return;
    }

    const countConds = conds.length;
    const descr = document.getElementById("description");
    let nextDescrTxt = "";
    for (let i = 0; i < countConds; i ++) {
        if (nextDescrTxt.length > 0) {
            nextDescrTxt += " ";
        }
        const cond = conds[i];
        let not = false;
        if (cond.hasOwnProperty("not")) {
            not = cond.not;
            if (not) {
                nextDescrTxt += "not ";
            }
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
            nextDescrTxt += tc.term
        } else if (cond.hasOwnProperty("nc")) {
            const nc = cond.nc;
            let key = "";
            if (nc.hasOwnProperty("key")) {
                key = nc.key;
            }
            nextDescrTxt += key
            const op = nc.op;
            switch (op) {
                case 1:
                    nextDescrTxt += ">";
                    break;
                case 2:
                    nextDescrTxt += "≥";
                    break;
                case 3:
                    nextDescrTxt += "=";
                    break;
                case 4:
                    nextDescrTxt += "≤"
                    break;
                case 5:
                    nextDescrTxt += "<"
                    break;
            }
            let val = 0;
            if (nc.hasOwnProperty("val")) {
                val = nc.val;
                nextDescrTxt += val;
            }
        }
        descr.value = nextDescrTxt;
    }
}

function displayConditions() {
    let promiseLoadAttrTypes = loadAttributeTypes();
    document.getElementById("add-condition").style.display = "flex";
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
            promiseLoadAttrTypes = promiseLoadAttrTypes.then(() => {
                const fragmentOpts = document.createDocumentFragment();
                for (const attKeyTxt of EventAttrKeysTxt) {
                    let elemOpt = document.createElement("option");
                    elemOpt.textContent = attKeyTxt;
                    fragmentOpts.appendChild(elemOpt);
                }
                attrKeysTxt.appendChild(fragmentOpts);
            });
        } else if (cond.hasOwnProperty("nc")) {
            const nc = cond.nc;
            let key = "";
            if (nc.hasOwnProperty("key")) {
                key = nc.key;
            }
            const op = nc.op;
            let val = 0;
            if (nc.hasOwnProperty("val")) {
                val = nc.val;
            }
            elemConds.innerHTML += templateCondNumber(not, key, op, val, i, countConds);
            const attrKeysInt = document.getElementById(`attrKeys${i}`);
            promiseLoadAttrTypes = promiseLoadAttrTypes.then(() => {
                const fragmentOpts = document.createDocumentFragment();
                for (const attKeyInt of EventAttrKeysInt) {
                    let elemOpt = document.createElement("option");
                    elemOpt.textContent = attKeyInt;
                    fragmentOpts.appendChild(elemOpt);
                }
                attrKeysInt.appendChild(fragmentOpts);
            });
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
    updateDescription();
}

document
    .getElementById("button-add-cond-txt")
    .addEventListener("click", (_) => { addConditionText(false, "", "", false); displayConditions(); });

document
    .getElementById("button-add-cond-num")
    .addEventListener("click", (_) => { addConditionNumber(false, "", 3, 0); displayConditions(); });

function deleteSubscription() {
    const id = document.getElementById("id").value;
    if (id && confirm(`Delete the interest ${id}?`)) {
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        Interests
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

async function submitSubscription(discoverSources) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
        await updateSubscription(id, discoverSources);
    } else {
        await createSubscription(discoverSources);
    }
}

async function updateSubscription(id, discoverSources) {
    const cond = getRootCondition();
    if (cond != null && confirm(`Update the interest ${id}?`)) {
        const descr = document.getElementById("description").value;
        if (!descr) {
            alert("Empty interest name");
            return;
        }
        const enabled = document.getElementById("interest-enabled").checked;
        let expires = document.getElementById("expires").value;
        if (expires && expires !== "") {
            const d = new Date(expires);
            expires = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
        } else {
            expires = null;
        }
        const isPublic = document.getElementById("public").checked;
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        const since = new Date().toISOString();
        await Interests
            .update(id, descr, enabled, expires, isPublic, cond, discoverSources, headers)
            .then(data => {
                if (data != null) {
                    alert("Interest updated");
                    window.location.assign("sub.html");
                }
            })
            .finally(() => {
                document.getElementById("button-submit").selectedIndex = 0;
                document.getElementById("wait").style.display = "none";
            });
    } else {
        document.getElementById("button-submit-simple").selectedIndex = 0;
    }
}

async function createSubscription(discoverSources) {
    const cond = getRootCondition();
    if (cond != null) {
        const name = document.getElementById("id").value;
        let expires = document.getElementById("expires").value;
        if (expires && expires !== "") {
            const d = new Date(expires);
            expires = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
        } else {
            expires = null;
        }
        const descr = document.getElementById("description").value;
        if (descr === "") {
            alert("Empty interest name");
            return;
        }
        const enabled = document.getElementById("interest-enabled").checked;
        if (!enabled) {
            alert("Creating inactive interests is not allowed");
            return;
        }
        const isPublic = document.getElementById("public").checked;
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        await Interests
            .create(name, descr, expires, isPublic, cond, discoverSources, headers)
            .then(data => {
                if (data != null) {
                    alert("Interest created");
                    window.location.assign(`sub-details.html?id=${data.id}`);
                }
            })
            .finally(() => {
                document.getElementById("button-submit").selectedIndex = 0;
                document.getElementById("wait").style.display = "none";
            });
    }
}

function getRootCondition() {
    const nonEmptyConds = getNonEmptyConditions();
    let cond = null;
    if (nonEmptyConds.length === 1) {
        cond = nonEmptyConds[0];
        cond = validateCondition(cond, 1);
    } else if (nonEmptyConds.length > 1) {
        const logic = Number(document.getElementById("logic-select").value);
        for (let i = 0; i < nonEmptyConds.length; i ++) {
            if (null == validateCondition(nonEmptyConds[i], logic === 0 ? nonEmptyConds.length : 1)) {
                return null;
            }
        }
        cond = {
            not: false,
            gc: {
                logic: logic,
                group: nonEmptyConds,
            }
        }
    } else {
        alert("Interest should have at least non-empty 1 filter");
    }
    return cond;
}

function getNonEmptyConditions() {
    let nonEmptyConds = [];
    for (let i = 0; i < conds.length; i ++) {
        const cond = conds[i];
        if (cond.hasOwnProperty("nc")) {
            if (!cond.nc.key || cond.nc.key.trim() === "") {
                continue;
            }
        }
        if (cond.hasOwnProperty("tc")) {
            if ((!cond.tc.key || cond.tc.key.trim() === "") && cond.tc.term.trim() === "") {
                continue;
            }
        }
        nonEmptyConds.push(cond);
    }
    return nonEmptyConds;
}

function validateCondition(cond, nConds) {
    if (cond.hasOwnProperty("nc")) {
        if (!cond.nc.key || cond.nc.key === "") {
            alert("Number filter should have a non-empty attribute name");
            return null;
        }
        cond.nc.key = cond.nc.key.toLowerCase();
        if (cond.nc.op === 0) {
            alert("Number filter operator is not recognized");
            return null;
        }
    } else if (cond.hasOwnProperty("tc")) {
        if (cond.tc.key) {
            cond.tc.key = cond.tc.key.trim().toLowerCase();
        }
        if (!validateTextCondition(cond.tc.term, nConds, cond.tc.exact)) {
            return null;
        }
    } else {
        alert("Unrecognized filter type");
        return null;
    }
    return cond;
}

function validateTextCondition(q, nConds, isExact) {
    let ok = true;
    if (isExact) {
        ok = q.length > 1;
    } else {
        const seg = new Intl.Segmenter(undefined, {granularity: "word"});
        const terms = [...seg.segment(q)];
        let keywordCount = 0;
        for (const i in terms) {
            const term = terms[i];
            const txt = term.segment;
            if (term.isWordLike) {
                const txtByteLen = new TextEncoder().encode(txt).length;
                if ((nConds < 2 && txtByteLen < 3) || txtByteLen < 2) {
                    alert(`Keyword "${txt}" is too short. Please fix the filter condition.`);
                    ok = false;
                    break;
                }
                keywordCount ++;
            } else {
                if (txt !== " ") {
                    alert(`"${txt}" is not allowed keyword. Please specify space-separated keywords only.`);
                    ok = false;
                    break;
                }
            }
        }
        if (ok && keywordCount < 1) {
            alert(`Text "${q}" doesn't contain valid keywords. Please fix the filter condition.`);
            ok = false;
        }
    }
    return ok;
}

async function submitSimple(discoverSources){

    const q = document.getElementById("simple-query").value;
    const logic = Number(document.getElementById("logic-select-simple").value);
    const seg = new Intl.Segmenter(undefined, {granularity: "word"});
    let cond;
    switch (logic) {
        case 0: { // and
            let keywordConds = [];
            [...seg.segment(q)]
                .filter(term => term.isWordLike)
                .forEach(term => keywordConds.push({
                    not: false,
                    tc: {
                        key: "",
                        term: term.segment,
                        exact: false,
                    }
                }));
            if (keywordConds.length < 1) {
                alert("At least one keyword is required.");
                return;
            } else if (keywordConds.length === 1) {
                cond = keywordConds[0];
            } else {
                cond = {
                    not: false,
                    gc: {
                        logic: 0, // and
                        group: keywordConds,
                    }
                };
            }
            break;
        }
        case 1: { // or
            const terms = [...seg.segment(q)]
                .filter(term => term.isWordLike)
                .map(term => term.segment)
                .join(" ");
            if (terms.length < 2) {
                alert("At least one word-like keyword is required.");
                return;
            }
            cond = {
                not: false,
                tc: {
                    key: "",
                    exact: false,
                    term: terms,
                }
            }
            break;
        }
    }

    const langChoice = document.getElementById("mode-simple-lang");
    if (langChoice.selectedOptions.length > 0) {
        if (langChoice.options.length > langChoice.selectedOptions.length) { // not all selected
            if (langChoice.selectedOptions.length > 10) {
                alert("Max 10 languages allowed to choose.");
                return;
            }
            if (!cond.hasOwnProperty("gc") || cond.gc.logic !== 0) {
                const prevCond = cond;
                cond = {
                    not: false,
                    gc: {
                        logic: 0, // and
                        group: [prevCond],
                    }
                };
            }

            let languages = [];
            Array
                .from(langChoice.selectedOptions)
                .forEach((langOpt, _) => {
                    languages.push(langOpt.value)
                });
            cond.gc.group.push({
                not: false,
                tc: {
                    key: "language",
                    exact: false,
                    term: languages.join(" "),
                }
            });
        }
    } else {
        alert("At least one language should be selected.");
        return;
    }

    const typeChoice = document.getElementById("mode-simple-source-types");
    if (typeChoice.selectedOptions.length > 0) {
        if (typeChoice.options.length > typeChoice.selectedOptions.length) { // not all selected
            if (!cond.hasOwnProperty("gc") || cond.gc.logic !== 0) {
                const prevCond = cond;
                cond = {
                    not: false,
                    gc: {
                        logic: 0, // and
                        group: [prevCond],
                    }
                };
            }
            let types = [];
            Array
                .from(typeChoice.selectedOptions)
                .forEach((typeOpt, _) => {
                    types.push(typeOpt.value);
                });
            cond.gc.group.push({
                not: false,
                tc: {
                    key: "type",
                    exact: false,
                    term: types.join(" "),
                }
            });
        }
    } else {
        alert("At least one source type should be selected.");
        return;
    }

    const headers = getAuthHeaders();
    document.getElementById("wait").style.display = "block";
    await Interests
        .create("", q, undefined, false, cond, discoverSources, headers)
        .then(data => {
            if (data != null) {
                alert("Interest created");
                window.location.assign(`sub-details.html?id=${data.id}`);
            }
        })
        .finally(() => {
            document.getElementById("button-submit-simple").selectedIndex = 0;
            document.getElementById("wait").style.display = "none";
        });
}


/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function followDropdown() {
    document.getElementById("follow-dropdown").classList.toggle("show");
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function condNewDropdown() {
    document.getElementById("cond-new-dropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("collapsible-active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

function modeSimpleStepNext() {
    const q = document.getElementById("simple-query").value.trim();
    if (validateTextCondition(q, 1,false)) {
        $('div.ms-parent').each((i, e) => e.style.width = "100%");
        document.getElementById("mode-simple-step-0").style.display = "none";
        document.getElementById("mode-simple-step-1").style.display = "flex";
    }
}

document.getElementById("simple-query-form").onsubmit = function (evt) {
    evt.preventDefault();
    modeSimpleStepNext();
}
document.getElementById("mode-simple-0-next").onclick = modeSimpleStepNext;

document.getElementById("mode-simple-1-prev").onclick = function () {
    $('div.ms-parent').each((i, e) => e.style.width = "100%");
    document.getElementById("mode-simple-step-0").style.display = "flex";
    document.getElementById("mode-simple-step-1").style.display = "none";
};
