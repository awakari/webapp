async function requestIncreasePublishingLimit(objId) {
    if (objId) {
        const userIdCurrent = localStorage.getItem(keyUserId);
        let msg;
        if (objId === userIdCurrent) {
            msg = "Request to increase own publishing limit.";
        } else {
            msg = "Request to increase the publishing limit";
        }
        msg += "\nPlease enter the numbers to add (hourly/daily):"
        const input = prompt(msg, "1/10");
        if (input) {
            const payload = {
                id: Events.newId(),
                specVersion: "1.0",
                source: "awakari.com",
                type: "com_awakari_webapp",
                attributes: {
                    increment: {
                        ce_string: input,
                    },
                    limit: {
                        ce_integer: parseInt(document.getElementById("limit").innerText),
                    },
                    action: {
                        ce_string: "request",
                    },
                    object: {
                        ce_string: objId,
                    },
                    subject: {
                        ce_string: userIdCurrent,
                    },
                },
                text_data: `User ${userIdCurrent} requests to increase the publishing limit for ${objId} by ${input}`,
            }
            const headers = getAuthHeaders();
            if (await Events.publishInternal(payload, headers)) {
                openDonationPage();
            }
        }
    } else if (confirm("This function is available for signed in users only. Proceed to sign in?")) {
        window.location.assign("login.html");
    }
}

async function requestPublishingSourceDedicated(addr){
    const userIdCurrent = localStorage.getItem(keyUserId);
    if (userIdCurrent) {
        const msg = "Request to make the source dedicated.\nPlease justify how it is useful for others:"
        const reason = prompt(msg);
        if (reason) {
            const payload = {
                id: Events.newId(),
                specVersion: "1.0",
                source: "awakari.com",
                type: "com_awakari_webapp",
                attributes: {
                    reason: {
                        ce_string: reason,
                    },
                    limit: {
                        ce_integer: parseInt(document.getElementById("limit").innerText),
                    },
                    action: {
                        ce_string: "request",
                    },
                    object: {
                        ce_string: addr,
                    },
                    subject: {
                        ce_string: userIdCurrent,
                    },
                },
                text_data: `User ${userIdCurrent} requests to make the source ${addr} dedicated`,
            }
            const headers = getAuthHeaders();
            if (await Events.publishInternal(payload, headers)) {
                openDonationPage();
            }
        }
    } else if (confirm("This function is available for signed in users only. Proceed to sign in?")) {
        window.location.assign("login.html");
    }
}

async function requestIncreaseInterestsLimit(userId) {
    const authHeaders = getAuthHeaders();
    if (userId.startsWith("tg://user?id=")) {
        await Limits
            .fetch("1", authHeaders)
            .then(resp => resp ? resp.json() : null)
            .then(data => {
                if (data && data.hasOwnProperty("count")) {
                    if (data.count < 2) {
                        window.open("https://web.tribute.tg/s/vd7", "_blank");
                    } else if (data.count < 5) {
                        window.open("https://web.tribute.tg/s/vaN", "_blank");
                    } else if (data.count < 10) {
                        window.open("https://web.tribute.tg/s/vaQ", "_blank");
                    } else {
                        const input = prompt("Request to increase own interests limit. Please enter the number to add:", "1");
                        if (input) {
                            const payload = {
                                id: Events.newId(),
                                specVersion: "1.0",
                                source: "awakari.com",
                                type: "com_awakari_webapp",
                                attributes: {
                                    increment: {
                                        ce_string: input,
                                    },
                                    limit: {
                                        ce_integer: data.count,
                                    },
                                    action: {
                                        ce_string: "request",
                                    },
                                    object: {
                                        ce_string: userId,
                                    },
                                    subject: {
                                        ce_string: userId,
                                    },
                                },
                                text_data: `User ${userId} requests to increase the own interests limit by ${input}`,
                            }
                            Events
                                .publishInternal(payload, authHeaders)
                                .then(_ => openDonationPage());
                        }
                    }
                }
            });
    } else if (userId.startsWith("patreon")) {
        window.open("https://www.patreon.com/c/awakari/membership", "_blank");
    } else if (confirm("Please upgrade your account")) {
        window.location.assign("user.html");
    }
}

async function requestIncreaseSubscriptionsLimit(userId) {
    const authHeaders = getAuthHeaders();
    await Limits
        .fetch("5", authHeaders)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            if (data && data.hasOwnProperty("count")) {
                if (data.count < 5) {
                    window.open("https://web.tribute.tg/s/vd8", "_blank");
                } else if (data.count < 10) {
                    window.open("https://web.tribute.tg/s/v5Q", "_blank");
                } else if (data.count < 20) {
                    window.open("https://web.tribute.tg/s/vaR", "_blank");
                } else {
                    const input = prompt("Request to increase subscriptions limit. Please enter the number to add:", "1");
                    if (input) {
                        const payload = {
                            id: Events.newId(),
                            specVersion: "1.0",
                            source: "awakari.com",
                            type: "com_awakari_webapp",
                            attributes: {
                                increment: {
                                    ce_string: input,
                                },
                                limit: {
                                    ce_integer: data.count,
                                },
                                action: {
                                    ce_string: "request",
                                },
                                object: {
                                    ce_string: userId,
                                },
                                subject: {
                                    ce_string: userId,
                                },
                            },
                            text_data: `User ${userId} requests to increase the subscriptions limit by ${input}`,
                        }
                        Events
                            .publishInternal(payload, authHeaders)
                            .then(_ => openDonationPage());
                    }
                }
            }
        });
}

async function reportPublishingSourceInappropriate(srcAddr) {
    const userIdCurrent = localStorage.getItem(keyUserId);
    if (userIdCurrent) {
        const reason = prompt(`Please specify the reason why do you think the source is inappropriate.\nSource: ${srcAddr}`)
        if (reason) {
            const payload = {
                id: Events.newId(),
                specVersion: "1.0",
                source: "awakari.com",
                type: "com_awakari_webapp",
                attributes: {
                    reason: {
                        ce_string: reason,
                    },
                    action: {
                        ce_string: "report",
                    },
                    object: {
                        ce_string: srcAddr,
                    },
                    subject: {
                        ce_string: userIdCurrent,
                    },
                },
                text_data: `User ${userIdCurrent} reports the inappropriate publishing source ${srcAddr}, reason: ${reason}`,
            }
            const headers = getAuthHeaders();
            if (await Events.publishInternal(payload, headers)) {
                document.getElementById("report-success-dialog").style.display = "block";
                document.getElementById("report-id").innerText = payload.id;
            }
        }
    } else if (confirm("This function is available for signed in users only. Proceed to sign in?")) {
        window.location.assign("login.html");
    }
}

async function reportPublicationInappropriate(srcAddr, evtLink, evtId) {
    const userIdCurrent = localStorage.getItem(keyUserId);
    if (userIdCurrent) {
        const reason = prompt(`Please specify the reason why do you think the message is inappropriate.\nMessage link: ${evtLink}`)
        if (reason) {
            const payload = {
                id: Events.newId(),
                specVersion: "1.0",
                source: "awakari.com",
                type: "com_awakari_webapp",
                attributes: {
                    reason: {
                        ce_string: reason,
                    },
                    action: {
                        ce_string: "Flag", // see for example: https://docs.joinmastodon.org/spec/activitypub/#Flag
                    },
                    object: {
                        ce_uri: evtLink,
                    },
                    subject: {
                        ce_string: userIdCurrent,
                    },
                },
                text_data: `User ${userIdCurrent} reports the inappropriate message ${evtId} from ${srcAddr}, reason: ${reason}`,
            }
            const headers = getAuthHeaders();
            if (await Events.publishInternal(payload, headers)) {
                document.getElementById("report-success-dialog").style.display = "block";
                document.getElementById("report-id").innerText = payload.id;
            }
        }
    } else if (confirm("This function is available for signed in users only. Proceed to sign in?")) {
        window.location.assign("login.html");
    }
}

async function requestEmailSub(userId, pageSub) {
    if (userId) {
        const payload = {
            id: Events.newId(),
            specVersion: "1.0",
            source: "awakari.com",
            type: "com_awakari_webapp",
            attributes: {
                action: {
                    ce_string: "subscribe",
                },
                object: {
                    ce_string: "email",
                },
                objecturl: {
                    ce_uri: pageSub,
                },
                subject: {
                    ce_string: userId,
                },
            },
            text_data: `User ${userId} requests to subscribe by email at ${pageSub}`,
        }
        const headers = getAuthHeaders();
        if (await Events.publishInternal(payload, headers)) {
            alert("Request submitted for a review.");
        } else {
            alert("Something went wrong. Try again later.");
        }
    } else if (confirm("This function is available for signed in users only. Proceed to sign in?")) {
        window.location.assign("login.html");
    }
}

async function submitFeedback() {
    const userIdCurrent = localStorage.getItem(keyUserId);
    const feedback = prompt(`Please tell how Awakari can be improved:`)
    if (feedback) {
        const payload = {
            id: Events.newId(),
            specVersion: "1.0",
            source: "awakari.com",
            type: "com_awakari_webapp",
            attributes: {
                action: {
                    ce_string: "create",
                },
                object: {
                    ce_string: feedback,
                },
                subject: {
                    ce_string: userIdCurrent,
                },
            },
            text_data: `User ${userIdCurrent} has submitted feedback: ${feedback}`,
        }
        const headers = getAuthHeaders();
        await Events.publishInternal(payload, headers);
        alert("Thank you very much for your feedback!");
    }
}
