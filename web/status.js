function loadStatusWithRetry(headers) {
    return fetch("/v1/status/public")
        .then(resp => handleCookieAuth(resp, headers, (h) => loadStatusWithRetry(h)))
}

async function loadStatus() {
    return loadStatusWithRetry({})
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to fetch the status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {

                const pubRateAvgMin1 = Math.floor(data.publishingRate.min5 * 60);
                if (pubRateAvgMin1 > 0) {
                    document.getElementById("pub-last-1m").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(pubRateAvgMin1))}</span>`;
                } else {
                    document.getElementById("pub-last-1m").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(pubRateAvgMin1))}</span>`;
                }
                const pubRateAvgHour = data.publishingRate.hour;
                if (pubRateAvgHour > 0) {
                    document.getElementById("pub-last-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(pubRateAvgHour * 3600))}</span>`;
                } else {
                    document.getElementById("pub-last-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(pubRateAvgHour * 3600))}</span>`;
                }
                const pubRateAvgDay = data.publishingRate.day;
                if (pubRateAvgDay > 0) {
                    document.getElementById("pub-last-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(pubRateAvgDay * 86400))}</span>`;
                } else {
                    document.getElementById("pub-last-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(pubRateAvgDay * 86400))}</span>`;
                }
                const pubRateAvgMonth = data.publishingRate.month;
                if (pubRateAvgMonth > 0) {
                    document.getElementById("pub-last-30d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(pubRateAvgMonth * 30*86400))}</span>`;
                } else {
                    document.getElementById("pub-last-30d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(pubRateAvgMonth * 30*86400))}</span>`;
                }

                const deliveryAvgMin1 = Math.floor(data.readRate.min5 * 60);
                if (deliveryAvgMin1 > 0) {
                    document.getElementById("delivered-1m").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(deliveryAvgMin1))}</span>`;
                } else if (deliveryAvgMin1 === 0) {
                    document.getElementById("delivered-1m").innerHTML = `${formatNumberShort(Math.round(deliveryAvgMin1))}`;
                } else {
                    document.getElementById("delivered-1m").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(deliveryAvgMin1))}</span>`;
                }
                const deliveryAvgHour = data.readRate.hour;
                if (deliveryAvgHour > 0) {
                    document.getElementById("delivered-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(deliveryAvgHour * 3600))}</span>`;
                } else {
                    document.getElementById("delivered-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(deliveryAvgHour * 3600))}</span>`;
                }
                const deliveryAvgDay = data.readRate.day;
                if (deliveryAvgDay > 0) {
                    document.getElementById("delivered-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(deliveryAvgDay * 86400))}</span>`;
                } else {
                    document.getElementById("delivered-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(deliveryAvgDay * 86400))}</span>`;
                }
                const deliveryAvgMonth = data.readRate.month;
                if (deliveryAvgMonth > 0) {
                    document.getElementById("delivered-30d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(deliveryAvgMonth * 30*86400))}</span>`;
                } else {
                    document.getElementById("delivered-30d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(deliveryAvgMonth * 30*86400))}</span>`;
                }

                const evtQueueCurrent = data.queueLength.current;
                if (evtQueueCurrent > 0) {
                    document.getElementById("evt-queue-curr").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(evtQueueCurrent)}</span>`;
                } else {
                    document.getElementById("evt-queue-curr").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(evtQueueCurrent)}</span>`;
                }
                const evtQueue1hChange = evtQueueCurrent - data.queueLength.past.hour;
                if (evtQueue1hChange < 0) {
                    document.getElementById("evt-queue-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(evtQueue1hChange)}</span>`;
                } else if (evtQueue1hChange > 0) {
                    document.getElementById("evt-queue-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">+${formatNumberShort(evtQueue1hChange)}</span>`;
                } else {
                    document.getElementById("evt-queue-1h").innerHTML = `${formatNumberShort(evtQueue1hChange)}`;
                }
                const evtQueue1dChange = evtQueueCurrent - data.queueLength.past.day;
                if (evtQueue1dChange < 0) {
                    document.getElementById("evt-queue-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(evtQueue1dChange)}</span>`;
                } else if (evtQueue1dChange > 0) {
                    document.getElementById("evt-queue-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">+${formatNumberShort(evtQueue1dChange)}</span>`;
                } else {
                    document.getElementById("evt-queue-1d").innerHTML = `${formatNumberShort(evtQueue1hChange)}`;
                }

                const subscriptionsCurrent = data.subscriptions.current;
                if (subscriptionsCurrent > 0) {
                    document.getElementById("subscriptions-curr").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(subscriptionsCurrent)}</span>`;
                } else {
                    document.getElementById("subscriptions-curr").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subscriptionsCurrent)}</span>`;
                }
                const subscriptions1hChange = subscriptionsCurrent - data.subscriptions.past.hour;
                if (subscriptions1hChange < 0) {
                    document.getElementById("subscriptions-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subscriptions1hChange)}</span>`;
                } else if(subscriptions1hChange > 0) {
                    document.getElementById("subscriptions-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(subscriptions1hChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-1h").innerHTML = `${formatNumberShort(subscriptions1hChange)}</span>`;
                }
                const subscriptions1dChange = subscriptionsCurrent - data.subscriptions.past.day;
                if (subscriptions1dChange < 0) {
                    document.getElementById("subscriptions-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subscriptions1dChange)}</span>`;
                } else if (subscriptions1dChange > 0) {
                    document.getElementById("subscriptions-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(subscriptions1dChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-1d").innerHTML = `${formatNumberShort(subscriptions1dChange)}</span>`;
                }
                const subscriptions30dChange = subscriptionsCurrent - data.subscriptions.past.month;
                if (subscriptions30dChange < 0) {
                    document.getElementById("subscriptions-30d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subscriptions30dChange)}</span>`;
                } else if (subscriptions30dChange > 0) {
                    document.getElementById("subscriptions-30d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(subscriptions30dChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-30d").innerHTML = `${formatNumberShort(subscriptions30dChange)}</span>`;
                }

                const readersCurrent = data.subscribersActiveTelegram.current;
                if (readersCurrent > 0) {
                    document.getElementById("readers-curr").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(readersCurrent)}</span>`;
                } else {
                    document.getElementById("readers-curr").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(readersCurrent)}</span>`;
                }
                const readers1hChange = readersCurrent - data.subscribersActiveTelegram.past.hour;
                if (readers1hChange < 0) {
                    document.getElementById("readers-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(readers1hChange)}</span>`;
                } else if (readers1hChange > 0) {
                    document.getElementById("readers-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(readers1hChange)}</span>`;
                } else {
                    document.getElementById("readers-1h").innerHTML = `${formatNumberShort(readers1hChange)}</span>`;
                }
                const readers1dChange = readersCurrent - data.subscribersActiveTelegram.past.day;
                if (readers1dChange < 0) {
                    document.getElementById("readers-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(readers1dChange)}</span>`;
                } else if (readers1dChange > 0) {
                    document.getElementById("readers-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(readers1dChange)}</span>`;
                } else {
                    document.getElementById("readers-1d").innerHTML = `${formatNumberShort(readers1dChange)}</span>`;
                }
                const readers30dChange = readersCurrent - data.subscribersActiveTelegram.past.month;
                if (readers30dChange < 0) {
                    document.getElementById("readers-30d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(readers30dChange)}</span>`;
                } else if (readers30dChange > 0) {
                    document.getElementById("readers-30d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(readers30dChange)}</span>`;
                } else {
                    document.getElementById("readers-30d").innerHTML = `${formatNumberShort(readers30dChange)}</span>`;
                }

                const publishersCurrent = data.uniquePublishers.current;
                if (publishersCurrent > 0) {
                    document.getElementById("publishers-curr").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(publishersCurrent)}</span>`;
                } else {
                    document.getElementById("publishers-curr").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(publishersCurrent)}</span>`;
                }
                const publishers1hChange = publishersCurrent - data.uniquePublishers.past.hour;
                if (publishers1hChange < 0) {
                    document.getElementById("publishers-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(publishers1hChange)}</span>`;
                } else if (publishers1hChange > 0) {
                    document.getElementById("publishers-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(publishers1hChange)}</span>`;
                } else {
                    document.getElementById("publishers-1h").innerHTML = `${formatNumberShort(publishers1hChange)}</span>`;
                }
                const publishers1dChange = publishersCurrent - data.uniquePublishers.past.day;
                if (publishers1dChange < 0) {
                    document.getElementById("publishers-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(publishers1dChange)}</span>`;
                } else if (publishers1dChange > 0) {
                    document.getElementById("publishers-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(publishers1dChange)}</span>`;
                } else {
                    document.getElementById("publishers-1d").innerHTML = `${formatNumberShort(publishers1dChange)}</span>`;
                }
                const publishers30dChange = publishersCurrent - data.uniquePublishers.past.month;
                if (publishers30dChange < 0) {
                    document.getElementById("publishers-30d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(publishers30dChange)}</span>`;
                } else if (publishers30dChange > 0) {
                    document.getElementById("publishers-30d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(publishers30dChange)}</span>`;
                } else {
                    document.getElementById("publishers-30d").innerHTML = `${formatNumberShort(publishers30dChange)}</span>`;
                }

            } else {
                throw new Error("Empty status response");
            }
        })
        .catch(err => {
            console.log(err);
            return "";
        });
}

function formatNumberShort(number) {
    const suffixes = ["", "", "K", "M", "B", "T", "P"];
    let suffixNum = Math.ceil(("" + Math.round(number)).length / 3);
    let shortNumber = parseFloat((suffixNum > 1 ? (number / Math.pow(1000, suffixNum-1)) : number).toPrecision(3));
    if (shortNumber % 1 !== 0) {
        if (shortNumber > 10) {
            shortNumber = shortNumber.toFixed(1);
        } else if (shortNumber > 100) {
            shortNumber = Math.round(shortNumber);
        } else {
            shortNumber = shortNumber.toFixed(2);
        }
    } else {
        shortNumber = Math.round(shortNumber);
    }
    return shortNumber + suffixes[suffixNum];
}
