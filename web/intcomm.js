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
                type: "com.github.awakari.webapp",
                attributes: {
                    increment: {
                        ce_integer: inc,
                    },
                    action: {
                        ce_string: "request",
                    },
                    object: {
                        ce_string: `publishing daily limit for ${objId}`,
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

async function reportPublishingSourceInappropriate(srcAddr) {
    const userIdCurrent = localStorage.getItem(keyUserId);
    const reason = prompt(`Please specify the reason why do you think the source is inappropriate.\nSource: ${srcAddr}`)
    if (reason) {
        const payload = {
            id: uuidv4(),
            specVersion: "1.0",
            source: "awakari.com",
            type: "com.github.awakari.webapp",
            attributes: {
                reason: {
                    ce_string: reason,
                },
                action: {
                    ce_string: "report",
                },
                object: {
                    ce_string: `inappropriate publishing source ${srcAddr}`,
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

function submitMessageInternal(payload, userId) {
    const authToken = localStorage.getItem(keyAuthToken);
    return fetch("/v1/pub/internal", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
        },
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
