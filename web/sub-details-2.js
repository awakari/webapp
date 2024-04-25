let conds = [];

const templateCondText = (isNot, key, terms, isExact, countConds) => `
                <fieldset class="flex p-2">
                    <legend class="flex space-x-2 px-1">
                        <span class="w-14">Keywords</span>
                        <label class="flex align-middle">
                            <input type="checkbox" 
                                   class="h-4 w-4 sub-cond-not" 
                                   style="margin-right: 0.125rem"
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
                             style="${countConds > 1 ? 'display: block': 'display: none'}">
                            <path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z"/>
                        </svg>
                    </legend>
                    <div class="flex space-x-2">
                        <fieldset class="px-1 h-9">
                            <legend class="px-1">Attribute</legend>
                            <input type="text" 
                                   class="border-none w-20 sm:w-32" 
                                   style="height: 18px; background-color: inherit"
                                   value="${key}"/>
                        </fieldset>
                        <fieldset class="px-1 h-9 tc">
                            <legend class="flex px-1 space-x-1">
                                <span>Any of keywords</span>
                                <label class="flex">
                                    <input type="checkbox" 
                                           class="h-4 w-4" 
                                           style="margin-right: 0.125rem"
                                           ${isExact ? 'checked="checked"' : '' }/>
                                    <span>Exact</span>
                                </label>
                            </legend>
                            <input type="text" 
                                   class="border-none min-w-[216px] sm:w-72" 
                                   style="height: 18px; background-color: inherit"
                                   value="${terms}"/>
                        </fieldset>
                    </div>
                </fieldset>
`;

const templateCondNumber = (isNot, key, op, value, countConds) => `
                <fieldset class="flex p-2">
                    <legend class="flex space-x-2 px-1">
                        <span class="w-14">Number</span>
                        <label class="flex align-middle" style="margin-top: 0.125rem">
                            <input type="checkbox" 
                                   class="h-4 w-4 sub-cond-not" 
                                   style="margin-right: 0.125rem"
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
                             style="${countConds > 1 ? 'display: block': 'display: none'}">
                            <path d="M11.383 13.644A1.03 1.03 0 0 1 9.928 15.1L6 11.172 2.072 15.1a1.03 1.03 0 1 1-1.455-1.456l3.928-3.928L.617 5.79a1.03 1.03 0 1 1 1.455-1.456L6 8.261l3.928-3.928a1.03 1.03 0 0 1 1.455 1.456L7.455 9.716z"/>
                        </svg>
                    </legend>
                    <div class="flex space-x-2">
                        <fieldset class="px-1 h-9">
                            <legend class="px-1">Attribute</legend>
                            <input type="text" 
                                   class="border-none w-20 sm:w-32" 
                                   style="height: 18px; background-color: inherit"
                                   value="${key}"/>
                        </fieldset>
                        <div class="flex space-x-2 nc">
                            <select class="rounded-sm h-5 w-10 mt-3 px-1">
                                <option ${op === 1 ? 'selected="selected"' : ''}>&gt;</option>
                                <option ${op === 2 ? 'selected="selected"' : ''}>&ge;</option>
                                <option ${op === 3 ? 'selected="selected"' : ''}>=</option>
                                <option ${op === 4 ? 'selected="selected"' : ''}>&le;</option>
                                <option ${op === 5 ? 'selected="selected"' : ''}>&lt;</option>
                            </select>
                            <fieldset class="px-1 h-9">
                                <legend class="px-1">Number</legend>
                                <input type="number"
                                       class="border-none w-[168px]"
                                       style="height: 18px; background-color: inherit"
                                       value="${value}"/>
                            </fieldset>
                        </div>
                    </div>
                </fieldset>
`;

function loadSubDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const q = urlParams.get("q");
    if (id) {
        loadSubDetailsById(id);
    } else if (q) {
        loadSubDetailsByQuery(q);
    } else {
        loadSubDetailsByQuery("");
    }
    displayConditions();
}

loadSubDetails();

function loadSubDetailsById(id) {
    document.getElementById("id").value = id;
    // TODO
}

function loadSubDetailsByQuery(q) {
    addConditionText(q);
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
            "value": 0,
        }
    });
}
function displayConditions() {
    const elemConds = document.getElementById("conditions");
    elemConds.innerHTML = "";
    const countConds = conds.length;
    conds.forEach(cond => {
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
            elemConds.innerHTML += templateCondText(not, key, tc.term, exact, countConds);
        }
        if (cond.hasOwnProperty("nc")) {
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
            elemConds.innerHTML += templateCondNumber(not, key, op, val, countConds);
        }

    });
}

document
    .getElementById("button-add-cond-txt")
    .addEventListener("click", (_) => { addConditionText(""); displayConditions(); });

document
    .getElementById("button-add-cond-num")
    .addEventListener("click", (_) => { addConditionNumber(); displayConditions(); });
