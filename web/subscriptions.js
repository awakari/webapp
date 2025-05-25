const templateSubscription = (sub, interestName, interestPublic, interestActive) => `
                <div class="flex w-[320px] sm:w-[400px] space-x-1">
                    <span class="w-5 h-5 mt-1.5">
                        ${sub.url.startsWith("http://bot-telegram") ? '<img src="telegram-logo.svg" width="20" height="20" alt="Telegram"/>' : '?'}                                         
                    </span>
                    <span class="truncate py-2 grow ${interestPublic ? '' : 'italic'} ${interestActive? '' : 'line-through' }">
                        ${interestName}
                    </span>
                </div>`;

const pageLimit= 100;

async function loadSubscriptions() {

    const headers = getAuthHeaders();
    if (!headers["Authorization"]) {
        window.location.assign(`login.html?redirect=${encodeURIComponent(window.location)}`);
    }

    document.getElementById("wait").style.display = "block";
    Usage
        .fetch("5", headers)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            if (data && data.hasOwnProperty("count")) {
                document.getElementById("count").innerText = data.count;
            }
        })
        .catch(e => {
            console.log(e);
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });

    document.getElementById("wait").style.display = "block";
    Limits
        .fetch("5", headers)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            if (data && data.hasOwnProperty("count")) {
                document.getElementById("limit").innerText = data.count;
            }
            return data;
        })
        .catch(e => {
            console.log(e);
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });

    document.getElementById("wait").style.display = "block";
    return Subscriptions
        .fetchOwn(pageLimit, headers)
        .then(resp => resp ? resp.json() : null)
        .then(page => {
            let promises = [];
            if (page) {
                let listHtml = document.getElementById("subscriptions_list");
                listHtml.innerHTML = "";
                for (const sub of page) {
                    if (sub.hasOwnProperty("interestId")) {
                        const p = Interests
                            .fetch(sub.interestId, headers)
                            .then(resp => resp ? resp.json() : null)
                            .then(interest => {
                                if (interest && interest.hasOwnProperty("description")) {
                                    const disabled = interest.enabledSince && (new Date(interest.enabledSince)) > (new Date());
                                    listHtml.innerHTML += templateSubscription(sub, interest.description, interest.public, !disabled);
                                }
                            });
                        promises.push(p);
                    }
                }
            }
            return Promise.all(promises);
        })
        .finally(() => {
            document.getElementById("wait").style.display = "none";
        });
}
