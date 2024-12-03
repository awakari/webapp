document
    .getElementById("form_search")
    .addEventListener("submit", function (evt){
        evt.preventDefault();
        const q = document.getElementById("query").value;
        if (q != null && q !== "") {
            clearSearchResults();
            document.getElementById("events-menu").style.display = "flex";
            const headers = getAuthHeaders();
            document.getElementById("wait").style.display = "block";
            Events
                .search(q)
                .then(resp => {
                    if (resp) {
                        if (!resp.ok) {
                            handleResponseStatus(`Search [${q}]`, resp.code);
                            return null;
                        }
                        return resp.json();
                    } else {
                        return null;
                    }
                })
                .then(data => {
                    if (data && data.length > 0) {
                        displayEvents(data);
                    }
                })
                .finally(_ => {
                    document.getElementById("wait").style.display = "none";
                    //displayEvents(evtsTest);
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

const templateEvent = (txt, time, src, link, loc, price, more) => `
    <div class="h-[52px] w-86 sm:w-[624px] flex align-middle">
        <a href="${link}" target="_blank" class="w-80 sm:w-[600px]">
            <p class="text-gray-800 dark:text-gray-300 w-80 sm:w-[600px] hover:text-blue-500 truncate">
                ${txt}
            </p>
            <p class="font-mono text-xs w-80 sm:w-[600px] truncate">
                <span class="text-stone-500">
                    ${formatDateTime(time)}
                </span>
                <span class="text-slate-500">${src}</span>
            </p>
            <p class="flex text-xs w-80 sm:w-[600px] text-zinc-500 truncate">
                <span>
                    ${loc}                
                </span>
                <span>
                    ${price}                
                </span>
                <span>
                    ${more}                    
                </span>
            </p>
        </a>
    </div>
`

function formatDateTime(dt) {
    const now = new Date();
    if (dt.getDate() === now.getDate()) {
        return `${dt.getUTCHours().toString().padStart(2, '0')}:${dt.getUTCMinutes().toString().padStart(2, '0')}`;
    } else if (dt.getUTCFullYear() === now.getUTCFullYear()) {
        return dt.toLocaleDateString(undefined, {month: "short", day: "numeric"});
    } else {
        return dt.getUTCFullYear().toString().padStart(4, '0');
    }
}

function displayEvents(evts) {
    let elemEvts = document.getElementById("events");
    for (let evt of evts) {
        //
        if (elemEvts.childElementCount >= 10) {
            elemEvts.removeChild(elemEvts.lastElementChild);
        }
        let time;
        if (evt.hasOwnProperty("time")) {
            time = new Date(evt.time);
        } else {
            time = new Date();
        }
        //
        let link = `pub-msg.html?id=${evt.id}`;
        //
        let txt = evt.text_data;
        if (evt.hasOwnProperty("description")) {
            txt = evt.description;
        }
        if (evt.hasOwnProperty("headline")) {
            txt = evt.headline;
        }
        if (evt.hasOwnProperty("name")) {
            txt = evt.name;
        }
        if (evt.hasOwnProperty("summary")) {
            txt = evt.summary;
        }
        if (evt.hasOwnProperty("title")) {
            txt = evt.title;
        }
        txt = txt.replace(/(<([^>]+)>)/gi, ""); // remove HTML tags
        //
        //
        let loc = "";
        if (evt.hasOwnProperty("latitude") && evt.hasOwnProperty("longitude")) {
            loc = "<svg class=\"mr-1\" fill=\"currentColor\" width=\"16px\" height=\"16px\" viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
                "  <path d=\"M127.99414,15.9971a88.1046,88.1046,0,0,0-88,88c0,75.29688,80,132.17188,83.40625,134.55469a8.023,8.023,0,0,0,9.1875,0c3.40625-2.38281,83.40625-59.25781,83.40625-134.55469A88.10459,88.10459,0,0,0,127.99414,15.9971ZM128,72a32,32,0,1,1-32,32A31.99909,31.99909,0,0,1,128,72Z\"/>\n" +
                "</svg>"
        }
        //
        let price = "";
        if (evt.hasOwnProperty("offersprice") && evt.hasOwnProperty("offerspricecurrency")) {
            price = evt.offersprice;
            switch (evt.offerspricecurrency.toLowerCase()) {
                case "usd":
                case "aud":
                case "cad":
                case "sgd":
                case "hkd":
                case "nzd":
                case "mxn":
                case "twd":
                case "brl":
                    price = "$" + price;
                    break;
                case "eur":
                    price = "€" + price;
                    break;
                case "cny":
                case "jpy":
                    price = "¥" + price;
                    break;
                case "gbp":
                    price = "£" + price;
                    break;
                case "inr":
                    price = "₹" + price;
                    break;
                case "rub":
                    price = "₽" + price;
                    break;
                default:
                    price = evt.offerspricecurrency + price;
            }
            price += "&nbsp;";
        }
        //
        let more = "";
        if (evt.hasOwnProperty("subject")) {
            more = evt.subject;
            if (more.length > 16) {
                more = more.slice(0, 15) + "…"
            }
        }
        //
        if (evt.hasOwnProperty("categories")) {
            more = (more.length > 0 ? more + " " : more) + evt.categories;
        } else if(evt.hasOwnProperty("feedcategories")) {
            more = (more.length > 0 ? more + " " : more) + evt.feedcategories;
        }
        if (more.length > 36) {
            more = more.slice(0, 35) + "…"
        }
        //
        elemEvts.innerHTML = templateEvent(txt, time, evt.source, link, loc, price, more) + elemEvts.innerHTML;
    }
}

function loginAndSubscribe() {
    const q = document.getElementById("query").value;
    window.location.assign(`login.html?redirect=sub-details.html&args=${q}`);
}
