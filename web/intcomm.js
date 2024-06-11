async function requestIncreasePublishingDailyLimit(objId) {
    if (objId) {
        const userIdCurrent = localStorage.getItem(keyUserId);
        let msg;
        if (objId === userIdCurrent) {
            msg = "Request to increase own publishing daily limit.";
        } else {
            msg = "Request to increase the publishing daily limit";
        }
        msg += "\nPlease enter the number to add:"
        const input = prompt(msg, "1");
        if (input) {
            let inc = 0;
            try {
                inc = parseInt(input);
            } catch (e) {
                console.log(e);
            }
            if (inc > 0) {
                const payload = {
                    id: Events.newId(),
                    specVersion: "1.0",
                    source: "awakari.com",
                    type: "com.awakari.webapp",
                    attributes: {
                        increment: {
                            ce_integer: inc,
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
                    text_data: `User ${userIdCurrent} requests to increase the publishing daily limit for ${objId} by ${inc}`,
                }
                const headers = getAuthHeaders();
                if (await Events.publishInternal(payload, headers)) {
                    openDonationPage();
                }
            } else {
                alert(`Invalid increment value: ${inc}\nShould be a positive integer.`);
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
                type: "com.awakari.webapp",
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

async function requestIncreaseSubscriptionsLimit(userId) {
    if (userId) {
        const msg = "Request to increase the interests limit\nPlease enter the number to add:"
        const input = prompt(msg, "1");
        if (input) {
            let inc = 0;
            try {
                inc = parseInt(input);
            } catch (e) {
                console.log(e);
            }
            if (inc > 0) {
                const payload = {
                    id: Events.newId(),
                    specVersion: "1.0",
                    source: "awakari.com",
                    type: "com.awakari.webapp",
                    attributes: {
                        increment: {
                            ce_integer: inc,
                        },
                        limit: {
                            ce_integer: parseInt(document.getElementById("limit").innerText),
                        },
                        action: {
                            ce_string: "request",
                        },
                        object: {
                            ce_string: "subscriptions",
                        },
                        subject: {
                            ce_string: userId,
                        },
                    },
                    text_data: `User ${userId} requests to increase the subscriptions limit by ${inc}`,
                }
                const headers = getAuthHeaders();
                if (await Events.publishInternal(payload, headers)) {
                    openDonationPage();
                }
            } else {
                alert(`Invalid increment value: ${inc}\nShould be a positive integer.`);
            }
        }
    } else if (confirm("This function is available for signed in users only. Proceed to sign in?")) {
        window.location.assign("login.html");
    }
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
                type: "com.awakari.webapp",
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
                type: "com.awakari.webapp",
                attributes: {
                    reason: {
                        ce_string: reason,
                    },
                    action: {
                        ce_string: "report",
                    },
                    object: {
                        ce_string: evtId,
                    },
                    objecturl: {
                        ce_uri: evtLink,
                    },
                    subject: {
                        ce_string: userIdCurrent,
                    },
                },
                text_data: `User ${userIdCurrent} reports the inappropriate message from ${srcAddr}, reason: ${reason}`,
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
