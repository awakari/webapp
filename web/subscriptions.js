const templateSubscription = (sub, interestName, interestPublic, interestActive) => `
                <div class="flex w-[320px] sm:w-[400px] space-x-1">
                    <span class="w-5 h-5 mt-1.5">
                        ${sub.url.startsWith("http://bot-telegram") ? '<svg height="20" width="20" fill="currentColor" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M228.646,34.7676a11.96514,11.96514,0,0,0-12.21778-2.0752L31.87109,105.19729a11.99915,11.99915,0,0,0,2.03467,22.93457L84,138.15139v61.833a11.8137,11.8137,0,0,0,7.40771,11.08593,12.17148,12.17148,0,0,0,4.66846.94434,11.83219,11.83219,0,0,0,8.40918-3.5459l28.59619-28.59619L175.2749,217.003a11.89844,11.89844,0,0,0,7.88819,3.00195,12.112,12.112,0,0,0,3.72265-.59082,11.89762,11.89762,0,0,0,8.01319-8.73925L232.5127,46.542A11.97177,11.97177,0,0,0,228.646,34.7676ZM32.2749,116.71877a3.86572,3.86572,0,0,1,2.522-4.07617L203.97217,46.18044,87.07227,130.60769,35.47461,120.28811A3.86618,3.86618,0,0,1,32.2749,116.71877Zm66.55322,86.09375A3.99976,3.99976,0,0,1,92,199.9844V143.72048l35.064,30.85669ZM224.71484,44.7549,187.10107,208.88772a4.0003,4.0003,0,0,1-6.5415,2.10937l-86.1543-75.8164,129.66309-93.645A3.80732,3.80732,0,0,1,224.71484,44.7549Z"></path></g></svg>' : '?'}                                         
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
