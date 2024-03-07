async function requestIncreasePublishingDailyLimit(userId) {
    const userIdCurrent = localStorage.getItem(keyUserId);
    let msg;
    if (userId === userIdCurrent) {
        msg = "Request to increase own publishing daily limit.";
    } else {
        msg = "Request to increase another user's publishing daily limit.";
    }
    msg += "Please enter the number to add:"
    const input = prompt(msg, "1");
    let inc = 0;
    try {
        inc = parseInt(input);
    } catch (e) {
        console.log(e);
    }
    if (inc > 0) {
        const payload = {
            id: document.getElementById("msg_id").value,
            specVersion: "1.0",
            source: "awakari.com",
            type: "com.github.awakari.webapp",
            attributes: {
                increment: {
                    ce_integer: inc,
                }
            },
            text_data: `User ${userIdCurrent} requests to increase the publishing daily limit for the user ${userId} by ${inc}`,
        }
        if (await submitMessageInternal(payload, userId)) {
            alert("Success");
        }
    } else {
        alert(`Invalid increment value: ${inc}\nShould be a positive integer.`);
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
