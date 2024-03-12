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

                const evtCountCurrent = data.eventsSubmitted.current;
                document.getElementById("evt-count-curr").innerHTML = `${formatNumberShort(evtCountCurrent)}`;
                const evtCount1hChange = evtCountCurrent - data.eventsSubmitted.past.hour;
                if (evtCount1hChange > 0) {
                    document.getElementById("evt-count-1h").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(evtCount1hChange)}</span>`;
                } else {
                    document.getElementById("evt-count-1h").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(evtCount1hChange)}</span>`;
                }
                const evtCount1dChange = evtCountCurrent - data.eventsSubmitted.past.day;
                if (evtCount1dChange > 0) {
                    document.getElementById("evt-count-1d").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(evtCount1dChange)}</span>`;
                } else {
                    document.getElementById("evt-count-1d").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(evtCount1dChange)}</span>`;
                }
                const evtCount1wChange = evtCountCurrent - data.eventsSubmitted.past.week;
                if (evtCount1wChange > 0) {
                    document.getElementById("evt-count-1w").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(evtCount1wChange)}</span>`;
                } else {
                    document.getElementById("evt-count-1w").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(evtCount1wChange)}</span>`;
                }

                const evtQueueCurrent = data.queueLength.current;
                if (evtQueueCurrent > 0) {
                    document.getElementById("evt-queue-1h").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(evtQueueCurrent)}</span>`;
                } else {
                    document.getElementById("evt-queue-1h").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(evtQueueCurrent)}</span>`;
                }
                const evtQueue1hChange = evtQueueCurrent - data.queueLength.past.hour;
                if (evtQueue1hChange < 0) {
                    document.getElementById("evt-queue-1h").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(evtQueue1hChange)}</span>`;
                } else if (evtCount1hChange > 0) {
                    document.getElementById("evt-queue-1h").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(evtQueue1hChange)}</span>`;
                } else {
                    document.getElementById("evt-queue-1h").innerHTML = `${formatNumberShort(evtQueue1hChange)}`;
                }
                const evtQueue1dChange = evtQueueCurrent - data.queueLength.past.day;
                if (evtQueue1dChange < 0) {
                    document.getElementById("evt-queue-1d").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(evtQueue1dChange)}</span>`;
                } else if (evtQueue1dChange > 0) {
                    document.getElementById("evt-queue-1d").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(evtQueue1dChange)}</span>`;
                } else {
                    document.getElementById("evt-queue-1h").innerHTML = `${formatNumberShort(evtQueue1hChange)}`;
                }
                const evtQueue1wChange = evtQueueCurrent - data.queueLength.past.week;
                if (evtQueue1wChange < 0) {
                    document.getElementById("evt-queue-1w").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(evtQueue1wChange)}</span>`;
                } else if (evtQueue1wChange > 0) {
                    document.getElementById("evt-queue-1w").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(evtQueue1wChange)}</span>`;
                } else {
                    document.getElementById("evt-queue-1h").innerHTML = `${formatNumberShort(evtQueue1hChange)}`;
                }

                const subscriptionsCurrent = data.subscriptions.current;
                document.getElementById("subscriptions-curr").innerHTML = `${formatNumberShort(subscriptionsCurrent)}`;
                const subscriptions1hChange = subscriptionsCurrent - data.subscriptions.past.hour;
                if (subscriptions1hChange < 0) {
                    document.getElementById("subscriptions-1h").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(subscriptions1hChange)}</span>`;
                } else if(subscriptions1hChange > 0) {
                    document.getElementById("subscriptions-1h").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(subscriptions1hChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-1h").innerHTML = `${formatNumberShort(subscriptions1hChange)}</span>`;
                }
                const subscriptions1dChange = subscriptionsCurrent - data.subscriptions.past.day;
                if (subscriptions1dChange < 0) {
                    document.getElementById("subscriptions-1d").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(subscriptions1dChange)}</span>`;
                } else if (subscriptions1dChange > 0) {
                    document.getElementById("subscriptions-1d").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(subscriptions1dChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-1d").innerHTML = `${formatNumberShort(subscriptions1dChange)}</span>`;
                }
                const subscriptions1wChange = subscriptionsCurrent - data.subscriptions.past.week;
                if (subscriptions1wChange < 0) {
                    document.getElementById("subscriptions-1w").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(subscriptions1wChange)}</span>`;
                } else if (subscriptions1wChange > 0) {
                    document.getElementById("subscriptions-1w").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(subscriptions1wChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-1w").innerHTML = `${formatNumberShort(subscriptions1wChange)}</span>`;
                }

                const readersCurrent = data.telegramReaderChats.current;
                document.getElementById("readers-curr").innerHTML = `${formatNumberShort(readersCurrent)}`;
                const readers1hChange = readersCurrent - data.telegramReaderChats.past.hour;
                if (readers1hChange < 0) {
                    document.getElementById("readers-1h").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(readers1hChange)}</span>`;
                } else if (readers1hChange > 0) {
                    document.getElementById("readers-1h").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(readers1hChange)}</span>`;
                } else {
                    document.getElementById("readers-1h").innerHTML = `${formatNumberShort(readers1hChange)}</span>`;
                }
                const readers1dChange = readersCurrent - data.telegramReaderChats.past.day;
                if (readers1dChange < 0) {
                    document.getElementById("readers-1d").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(readers1dChange)}</span>`;
                } else if (readers1dChange > 0) {
                    document.getElementById("readers-1d").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(readers1dChange)}</span>`;
                } else {
                    document.getElementById("readers-1d").innerHTML = `${formatNumberShort(readers1dChange)}</span>`;
                }
                const readers1wChange = readersCurrent - data.telegramReaderChats.past.week;
                if (readers1wChange < 0) {
                    document.getElementById("readers-1w").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(readers1wChange)}</span>`;
                } if (readers1wChange > 0) {
                    document.getElementById("readers-1w").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(readers1wChange)}</span>`;
                } else {
                    document.getElementById("readers-1w").innerHTML = `${formatNumberShort(readers1wChange)}</span>`;
                }

                const subscribersCurrent = data.uniqueSubscribers.current;
                document.getElementById("subscribers-curr").innerHTML = `${formatNumberShort(subscribersCurrent)}`;
                const subscribers1hChange = subscribersCurrent - data.uniqueSubscribers.past.hour;
                if (subscribers1hChange < 0) {
                    document.getElementById("subscribers-1h").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(subscribers1hChange)}</span>`;
                } if (subscribers1hChange > 0) {
                    document.getElementById("subscribers-1h").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(subscribers1hChange)}</span>`;
                } else {
                    document.getElementById("subscribers-1h").innerHTML = `${formatNumberShort(subscribers1hChange)}</span>`;
                }
                const subscribers1dChange = subscribersCurrent - data.uniqueSubscribers.past.day;
                if (subscribers1dChange < 0) {
                    document.getElementById("subscribers-1d").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(subscribers1dChange)}</span>`;
                } else if (subscribers1dChange > 0) {
                    document.getElementById("subscribers-1d").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(subscribers1dChange)}</span>`;
                } else {
                    document.getElementById("subscribers-1d").innerHTML = `${formatNumberShort(subscribers1dChange)}</span>`;
                }
                const subscribers1wChange = subscribersCurrent - data.uniqueSubscribers.past.week;
                if (subscribers1wChange < 0) {
                    document.getElementById("subscribers-1w").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(subscribers1wChange)}</span>`;
                } else if (subscribers1wChange > 0) {
                    document.getElementById("subscribers-1w").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(subscribers1wChange)}</span>`;
                } else {
                    document.getElementById("subscribers-1w").innerHTML = `${formatNumberShort(subscribers1wChange)}</span>`;
                }

                const publishersCurrent = data.uniquePublishers.current;
                document.getElementById("publishers-curr").innerHTML = `${formatNumberShort(publishersCurrent)}`;
                const publishers1hChange = publishersCurrent - data.uniquePublishers.past.hour;
                if (publishers1hChange < 0) {
                    document.getElementById("publishers-1h").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(publishers1hChange)}</span>`;
                } if (publishers1hChange > 0) {
                    document.getElementById("publishers-1h").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(publishers1hChange)}</span>`;
                } else {
                    document.getElementById("publishers-1h").innerHTML = `${formatNumberShort(publishers1hChange)}</span>`;
                }
                const publishers1dChange = publishersCurrent - data.uniquePublishers.past.day;
                if (publishers1dChange < 0) {
                    document.getElementById("publishers-1d").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(publishers1dChange)}</span>`;
                } else if (publishers1dChange > 0) {
                    document.getElementById("publishers-1d").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(publishers1dChange)}</span>`;
                } else {
                    document.getElementById("publishers-1d").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(publishers1dChange)}</span>`;
                }
                const publishers1wChange = publishersCurrent - data.uniquePublishers.past.week;
                if (publishers1wChange < 0) {
                    document.getElementById("publishers-1w").innerHTML = `<span class="text-red-700 dark:text-red-300">${formatNumberShort(publishers1wChange)}</span>`;
                } else if (publishers1wChange > 0) {
                    document.getElementById("publishers-1w").innerHTML = `<span class="text-emerald-700 dark:text-emerald-300">${formatNumberShort(publishers1wChange)}</span>`;
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
    const suffixNum = Math.floor(("" + number).length / 3);
    let shortNumber = parseFloat((suffixNum !== 0 ? (number / Math.pow(1000, suffixNum)) : number).toPrecision(2));
    if (shortNumber % 1 !== 0) {
        shortNumber = shortNumber.toFixed(1);
    }
    const sign = number < 0 ? "-" : "+";
    return sign + shortNumber + suffixes[suffixNum];
}
