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
                document.getElementById("evt-count-curr").innerText = evtCountCurrent;
                const evtCount1hChange = evtCountCurrent - data.eventsSubmitted.past.hour;
                if (evtCount1hChange < 0) {
                    document.getElementById("evt-count-1h").innerText = `-${evtCount1hChange}`;
                } else {
                    document.getElementById("evt-count-1h").innerText = `+${evtCount1hChange}`;
                }
                const evtCount1dChange = evtCountCurrent - data.eventsSubmitted.past.day;
                if (evtCount1dChange < 0) {
                    document.getElementById("evt-count-1d").innerText = `-${evtCount1dChange}`;
                } else {
                    document.getElementById("evt-count-1d").innerText = `+${evtCount1dChange}`;
                }
                const evtCount1wChange = evtCountCurrent - data.eventsSubmitted.past.week;
                if (evtCount1wChange < 0) {
                    document.getElementById("evt-count-1w").innerText = `-${evtCount1wChange}`;
                } else {
                    document.getElementById("evt-count-1w").innerText = `+${evtCount1wChange}`;
                }

                const evtQueueCurrent = data.queueLength.current;
                document.getElementById("evt-queue-curr").innerText = evtQueueCurrent;
                const evtQueue1hChange = evtQueueCurrent - data.queueLength.past.hour;
                if (evtQueue1hChange < 0) {
                    document.getElementById("evt-queue-1h").innerText = `-${evtQueue1hChange}`;
                } else {
                    document.getElementById("evt-queue-1h").innerText = `+${evtQueue1hChange}`;
                }
                const evtQueue1dChange = evtQueueCurrent - data.queueLength.past.day;
                if (evtQueue1dChange < 0) {
                    document.getElementById("evt-queue-1d").innerText = `-${evtQueue1dChange}`;
                } else {
                    document.getElementById("evt-queue-1d").innerText = `+${evtQueue1dChange}`;
                }
                const evtQueue1wChange = evtQueueCurrent - data.queueLength.past.week;
                if (evtQueue1wChange < 0) {
                    document.getElementById("evt-queue-1w").innerText = `-${evtQueue1wChange}`;
                } else {
                    document.getElementById("evt-queue-1w").innerText = `+${evtQueue1wChange}`;
                }

                const subscriptionsCurrent = data.subscriptions.current;
                document.getElementById("subscriptions-curr").innerText = subscriptionsCurrent;
                const subscriptions1hChange = subscriptionsCurrent - data.subscriptions.past.hour;
                if (subscriptions1hChange < 0) {
                    document.getElementById("subscriptions-1h").innerText = `-${subscriptions1hChange}`;
                } else {
                    document.getElementById("subscriptions-1h").innerText = `+${subscriptions1hChange}`;
                }
                const subscriptions1dChange = subscriptionsCurrent - data.subscriptions.past.day;
                if (subscriptions1dChange < 0) {
                    document.getElementById("subscriptions-1d").innerText = `-${subscriptions1dChange}`;
                } else {
                    document.getElementById("subscriptions-1d").innerText = `+${subscriptions1dChange}`;
                }
                const subscriptions1wChange = subscriptionsCurrent - data.subscriptions.past.week;
                if (subscriptions1wChange < 0) {
                    document.getElementById("subscriptions-1w").innerText = `-${subscriptions1wChange}`;
                } else {
                    document.getElementById("subscriptions-1w").innerText = `+${subscriptions1wChange}`;
                }

                const readersCurrent = data.telegramReaderChats.current;
                document.getElementById("readers-curr").innerText = readersCurrent;
                const readers1hChange = readersCurrent - data.telegramReaderChats.past.hour;
                if (readers1hChange < 0) {
                    document.getElementById("readers-1h").innerText = `-${readers1hChange}`;
                } else {
                    document.getElementById("readers-1h").innerText = `+${readers1hChange}`;
                }
                const readers1dChange = readersCurrent - data.telegramReaderChats.past.day;
                if (readers1dChange < 0) {
                    document.getElementById("readers-1d").innerText = `-${readers1dChange}`;
                } else {
                    document.getElementById("readers-1d").innerText = `+${readers1dChange}`;
                }
                const readers1wChange = readersCurrent - data.telegramReaderChats.past.week;
                if (readers1wChange < 0) {
                    document.getElementById("readers-1w").innerText = `-${readers1wChange}`;
                } else {
                    document.getElementById("readers-1w").innerText = `+${readers1wChange}`;
                }

                const subscribersCurrent = data.uniqueSubscribers.current;
                document.getElementById("subscribers-curr").innerText = subscribersCurrent;
                const subscribers1hChange = subscribersCurrent - data.uniqueSubscribers.past.hour;
                if (subscribers1hChange < 0) {
                    document.getElementById("subscribers-1h").innerText = `-${subscribers1hChange}`;
                } else {
                    document.getElementById("subscribers-1h").innerText = `+${subscribers1hChange}`;
                }
                const subscribers1dChange = subscribersCurrent - data.uniqueSubscribers.past.day;
                if (subscribers1dChange < 0) {
                    document.getElementById("subscribers-1d").innerText = `-${subscribers1dChange}`;
                } else {
                    document.getElementById("subscribers-1d").innerText = `+${subscribers1dChange}`;
                }
                const subscribers1wChange = subscribersCurrent - data.uniqueSubscribers.past.week;
                if (subscribers1wChange < 0) {
                    document.getElementById("subscribers-1w").innerText = `-${subscribers1wChange}`;
                } else {
                    document.getElementById("subscribers-1w").innerText = `+${subscribers1wChange}`;
                }

                const publishersCurrent = data.uniquePublishers.current;
                document.getElementById("publishers-curr").innerText = publishersCurrent;
                const publishers1hChange = publishersCurrent - data.uniquePublishers.past.hour;
                if (publishers1hChange < 0) {
                    document.getElementById("publishers-1h").innerText = `-${publishers1hChange}`;
                } else {
                    document.getElementById("publishers-1h").innerText = `+${publishers1hChange}`;
                }
                const publishers1dChange = publishersCurrent - data.uniquePublishers.past.day;
                if (publishers1dChange < 0) {
                    document.getElementById("publishers-1d").innerText = `-${publishers1dChange}`;
                } else {
                    document.getElementById("publishers-1d").innerText = `+${publishers1dChange}`;
                }
                const publishers1wChange = publishersCurrent - data.uniquePublishers.past.week;
                if (publishers1wChange < 0) {
                    document.getElementById("publishers-1w").innerText = `-${publishers1wChange}`;
                } else {
                    document.getElementById("publishers-1w").innerText = `+${publishers1wChange}`;
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
