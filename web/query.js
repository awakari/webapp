document
    .getElementById("form_search")
    .addEventListener("submit", function (evt){
        evt.preventDefault();
        if (localStorage.getItem(keyUserId)) {
            document.getElementById("sign-in-for-full").style.display = "none";
        } else {
            document.getElementById("sign-in-for-full").style.display = "block"
        }
        const q = document.getElementById("query").value;
        if (q != null && q !== "") {
            clearSearchResults();
            document.getElementById("events-menu").style.display = "flex";
            const headers = getAuthHeaders();
            document.getElementById("wait").style.display = "block";
            Past
                .search(q, headers)
                .then(resp => {
                    if (resp) {
                        if (!resp.ok) {
                            handleResponseStatus(resp.code);
                            return null;
                        }
                        return resp.json();
                    } else {
                        return null;
                    }
                })
                .then(data => {
                    if (data && data.hasOwnProperty("msgs") && data.msgs.length > 0) {
                        displayEvents(data.msgs);
                    }
                })
                .finally(_ => {
                    document.getElementById("wait").style.display = "none";
                });
        }
    });

function clearSearchResults() {
    let elemEvents = document.getElementById("events");
    elemEvents.innerHTML = "";
}

async function closeSearchResults() {
    let elemEvents = document.getElementById("events");
    let elemEventsMenu = document.getElementById("events-menu");
    if (elemEvents.innerHTML === "") {
        elemEventsMenu.style.display = "none";
    } else if (elemEventsMenu.style.display !== "none") {
        document.getElementById("events-menu").style.display = "none";
        elemEvents.innerHTML = "";
    }
}

const templateEvent = (txt, time, src, link, id) => `
    <div class="p-1 shadow-xs border dark:border-gray-600 h-12 w-86 sm:w-[624px] flex align-middle">
        <a href="${link}" target="_blank" class="w-78 sm:w-[586px]">
            <p class="text-gray-700 dark:text-gray-300 hover:text-blue-500 w-80 sm:w-[586px] truncate">
                ${txt}
            </p>
            <p class="font-mono text-xs w-80 sm:w-[586px] truncate">
                <span class="text-stone-500">
                    ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}
                </span>
                <span class="text-slate-600 dark:text-slate-400 w-80 truncate">${src}</span>
            </p>
        </a>
        <button type="button"
                onclick="reportPublicationInappropriate('${src}', '${link}', '${id}')"
                class="mt-1 flex report justify-center text-center text-xl h-6 w-6 text-stone-500 hover:text-amber-500">
            ⚠
        </button>
    </div>
`

function displayEvents(evts) {
    let elemEvts = document.getElementById("events");
    for (let evt of evts) {
        if (elemEvts.childElementCount >= 10) {
            elemEvts.removeChild(elemEvts.lastElementChild);
        }
        let time;
        if (evt.attributes.hasOwnProperty("time")) {
            time = new Date(evt.attributes.time.ce_timestamp);
        } else {
            time = new Date();
        }
        let link = evt.source;
        if (link.startsWith("@")) {
            link = `https://t.me/${link.substring(1)}`;
        }
        if (!link.startsWith("http://") || !link.startsWith("https")) {
            link = `https://${link}`;
        }
        if (evt.attributes.hasOwnProperty("object")) {
            if (evt.attributes.object.hasOwnProperty("ce_uri")) {
                link = evt.attributes.object.ce_uri;
            } else {
                link = evt.attributes.object.ce_string;
            }
        }
        if (evt.attributes.hasOwnProperty("objecturl")) {
            if (evt.attributes.objecturl.hasOwnProperty("ce_uri")) {
                link = evt.attributes.objecturl.ce_uri;
            } else {
                link = evt.attributes.objecturl.ce_string;
            }
        }
        let txt = evt.text_data;
        if (evt.attributes.hasOwnProperty("summary")) {
            txt = evt.attributes.summary.ce_string;
        }
        if (evt.attributes.hasOwnProperty("title")) {
            txt = evt.attributes.title.ce_string;
        }
        txt = txt.replace(/(<([^>]+)>)/gi, ""); // remove HTML tags
        elemEvts.innerHTML = templateEvent(txt, time, evt.source, link, evt.id) + elemEvts.innerHTML;
    }
}
