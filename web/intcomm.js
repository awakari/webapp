async function requestIncreasePublishingDailyLimit(objId) {
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
                id: uuidv4(),
                specVersion: "1.0",
                source: "awakari.com",
                type: "com.awakari.webapp",
                attributes: {
                    increment: {
                        ce_integer: inc,
                    },
                    limit: {
                        ce_integer: parseInt(document.getElementById("limit").value),
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
            if (await submitMessageInternal(payload, userIdCurrent)) {
                document.getElementById("request-increase-success-dialog").style.display = "block";
                document.getElementById("request-id").innerText = payload.id;
            }
        } else {
            alert(`Invalid increment value: ${inc}\nShould be a positive integer.`);
        }
    }
}

async function requestPublishingSourceDedicated(addr){
    const userIdCurrent = localStorage.getItem(keyUserId);
    const msg = "Request to make the source dedicated.\nPlease justify how it is useful for others:"
    const reason = prompt(msg);
    if (reason) {
        const payload = {
            id: uuidv4(),
            specVersion: "1.0",
            source: "awakari.com",
            type: "com.awakari.webapp",
            attributes: {
                reason: {
                    ce_string: reason,
                },
                limit: {
                    ce_integer: parseInt(document.getElementById("limit").value),
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
        if (await submitMessageInternal(payload, userIdCurrent)) {
            document.getElementById("request-increase-success-dialog").style.display = "block";
            document.getElementById("request-id").innerText = payload.id;
            document.getElementById("pub-src-nominate").disabled = true;
        }
    }
}

async function requestIncreaseSubscriptionsLimit(userId) {
    const msg = "Request to increase the subscriptions limit\nPlease enter the number to add:"
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
                id: uuidv4(),
                specVersion: "1.0",
                source: "awakari.com",
                type: "com.awakari.webapp",
                attributes: {
                    increment: {
                        ce_integer: inc,
                    },
                    limit: {
                        ce_integer: parseInt(document.getElementById("limit").value),
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
            if (await submitMessageInternal(payload, userId)) {
                document.getElementById("request-increase-success-dialog").style.display = "block";
                document.getElementById("request-id").innerText = payload.id;
            }
        } else {
            alert(`Invalid increment value: ${inc}\nShould be a positive integer.`);
        }
    }
}

async function reportPublishingSourceInappropriate(srcAddr) {
    const userIdCurrent = localStorage.getItem(keyUserId);
    const reason = prompt(`Please specify the reason why do you think the source is inappropriate.\nSource: ${srcAddr}`)
    if (reason) {
        const payload = {
            id: uuidv4(),
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
        if (await submitMessageInternal(payload, userIdCurrent)) {
            document.getElementById("report-success-dialog").style.display = "block";
            document.getElementById("report-id").innerText = payload.id;
        }
    }
}

async function reportPublicationInappropriate(srcAddr, evtLink, evtId) {
    const userIdCurrent = localStorage.getItem(keyUserId);
    const reason = prompt(`Please specify the reason why do you think the message is inappropriate.\nMessage link: ${evtLink}`)
    if (reason) {
        const payload = {
            id: uuidv4(),
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
        if (await submitMessageInternal(payload, userIdCurrent)) {
            document.getElementById("report-success-dialog").style.display = "block";
            document.getElementById("report-id").innerText = payload.id;
        }
    }
}

function submitMessageInternal(payload, userId) {
    let headers = {
        "X-Awakari-Group-Id": defaultGroupId,
    }
    const authToken = localStorage.getItem(keyAuthToken);
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }
    if (userId) {
        headers["X-Awakari-User-Id"] = userId;
    }
    return fetch("/v1/pub/internal", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
    })
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Request failed ${resp.status}`);
            }
            return resp.json();
        })
        .then(_ => {
            return true;
        })
        .catch(err => {
            alert(err);
            return false;
        })
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
