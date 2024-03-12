async function loadStatus() {
    return fetch("/v1/status/public")
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to fetch the status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {

                const pubRateAvgHour = data.publishingRate.hour;
                if (pubRateAvgHour > 0) {
                    document.getElementById("pub-rate-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(pubRateAvgHour)}</span>`;
                } else {
                    document.getElementById("pub-rate-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(pubRateAvgHour)}</span>`;
                }
                const pubRateAvgDay = data.publishingRate.day;
                if (pubRateAvgDay > 0) {
                    document.getElementById("pub-rate-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(pubRateAvgDay)}</span>`;
                } else {
                    document.getElementById("pub-rate-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(pubRateAvgDay)}</span>`;
                }
                const pubRateAvgWeek = data.publishingRate.week;
                if (pubRateAvgWeek > 0) {
                    document.getElementById("pub-rate-1w").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(pubRateAvgWeek)}</span>`;
                } else {
                    document.getElementById("pub-rate-1w").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(pubRateAvgWeek)}</span>`;
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
                const evtQueue1wChange = evtQueueCurrent - data.queueLength.past.week;
                if (evtQueue1wChange < 0) {
                    document.getElementById("evt-queue-1w").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(evtQueue1wChange)}</span>`;
                } else if (evtQueue1wChange > 0) {
                    document.getElementById("evt-queue-1w").innerHTML = `<span class="text-red-600 dark:text-red-400">+${formatNumberShort(evtQueue1wChange)}</span>`;
                } else {
                    document.getElementById("evt-queue-1w").innerHTML = `${formatNumberShort(evtQueue1hChange)}`;
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
                const subscriptions1wChange = subscriptionsCurrent - data.subscriptions.past.week;
                if (subscriptions1wChange < 0) {
                    document.getElementById("subscriptions-1w").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subscriptions1wChange)}</span>`;
                } else if (subscriptions1wChange > 0) {
                    document.getElementById("subscriptions-1w").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(subscriptions1wChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-1w").innerHTML = `${formatNumberShort(subscriptions1wChange)}</span>`;
                }

                const readersCurrent = data.telegramReaderChats.current;
                if (readersCurrent > 0) {
                    document.getElementById("readers-curr").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(readersCurrent)}</span>`;
                } else {
                    document.getElementById("readers-curr").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(readersCurrent)}</span>`;
                }
                const readers1hChange = readersCurrent - data.telegramReaderChats.past.hour;
                if (readers1hChange < 0) {
                    document.getElementById("readers-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(readers1hChange)}</span>`;
                } else if (readers1hChange > 0) {
                    document.getElementById("readers-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(readers1hChange)}</span>`;
                } else {
                    document.getElementById("readers-1h").innerHTML = `${formatNumberShort(readers1hChange)}</span>`;
                }
                const readers1dChange = readersCurrent - data.telegramReaderChats.past.day;
                if (readers1dChange < 0) {
                    document.getElementById("readers-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(readers1dChange)}</span>`;
                } else if (readers1dChange > 0) {
                    document.getElementById("readers-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(readers1dChange)}</span>`;
                } else {
                    document.getElementById("readers-1d").innerHTML = `${formatNumberShort(readers1dChange)}</span>`;
                }
                const readers1wChange = readersCurrent - data.telegramReaderChats.past.week;
                if (readers1wChange < 0) {
                    document.getElementById("readers-1w").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(readers1wChange)}</span>`;
                } if (readers1wChange > 0) {
                    document.getElementById("readers-1w").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(readers1wChange)}</span>`;
                } else {
                    document.getElementById("readers-1w").innerHTML = `${formatNumberShort(readers1wChange)}</span>`;
                }

                const subscribersCurrent = data.uniqueSubscribers.current;
                if (subscribersCurrent > 0) {
                    document.getElementById("subscribers-curr").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(subscribersCurrent)}</span>`;
                } else {
                    document.getElementById("subscribers-curr").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subscribersCurrent)}</span>`;
                }
                const subscribers1hChange = subscribersCurrent - data.uniqueSubscribers.past.hour;
                if (subscribers1hChange < 0) {
                    document.getElementById("subscribers-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subscribers1hChange)}</span>`;
                } if (subscribers1hChange > 0) {
                    document.getElementById("subscribers-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(subscribers1hChange)}</span>`;
                } else {
                    document.getElementById("subscribers-1h").innerHTML = `${formatNumberShort(subscribers1hChange)}</span>`;
                }
                const subscribers1dChange = subscribersCurrent - data.uniqueSubscribers.past.day;
                if (subscribers1dChange < 0) {
                    document.getElementById("subscribers-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subscribers1dChange)}</span>`;
                } else if (subscribers1dChange > 0) {
                    document.getElementById("subscribers-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(subscribers1dChange)}</span>`;
                } else {
                    document.getElementById("subscribers-1d").innerHTML = `${formatNumberShort(subscribers1dChange)}</span>`;
                }
                const subscribers1wChange = subscribersCurrent - data.uniqueSubscribers.past.week;
                if (subscribers1wChange < 0) {
                    document.getElementById("subscribers-1w").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subscribers1wChange)}</span>`;
                } else if (subscribers1wChange > 0) {
                    document.getElementById("subscribers-1w").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(subscribers1wChange)}</span>`;
                } else {
                    document.getElementById("subscribers-1w").innerHTML = `${formatNumberShort(subscribers1wChange)}</span>`;
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
                } if (publishers1hChange > 0) {
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
                    document.getElementById("publishers-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(publishers1dChange)}</span>`;
                }
                const publishers1wChange = publishersCurrent - data.uniquePublishers.past.week;
                if (publishers1wChange < 0) {
                    document.getElementById("publishers-1w").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(publishers1wChange)}</span>`;
                } else if (publishers1wChange > 0) {
                    document.getElementById("publishers-1w").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(publishers1wChange)}</span>`;
                } else {
                    document.getElementById("publishers-1w").innerHTML = `${formatNumberShort(publishers1wChange)}</span>`;
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
    const suffixes = ["", "K", "M", "B", "T"];
    let suffixNum = Math.floor(("" + number).length / 3);
    if (number >= 100 && number < 1000) {
        suffixNum = 0;
    }
    let shortNumber = parseFloat((suffixNum != 0 ? (number / Math.pow(1000, suffixNum)) : number).toPrecision(3));
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
