const keyUserIdSrc = "userIdSrc";
const keyAuthTokenSrc = "authTokenSrc";

const userName = localStorage.getItem(keyUserName);
if (userName) {
    const menuUserText = document.getElementById("menu-user-text");
    if (menuUserText) {
        menuUserText.innerText = userName;
    }
}

function loadUser() {

    const headers = getAuthHeaders();
    if (!headers["Authorization"]) {
        window.location.assign(`login.html?redirect=${encodeURIComponent(window.location)}`);
        return;
    }

    document.getElementById("menu-user-text").innerText = userName;
    document.getElementById("user-name").innerText = userName;
    const authProvider = localStorage.getItem(keyAuthProvider);
    document.getElementById("user-login").innerText = authProvider;

    if (authProvider && authProvider === "Patreon") {

        const urlParams = new URLSearchParams(window.location.search);
        const userIdSrc = urlParams.get(keyUserIdSrc);
        const authTokenSrc = urlParams.get(keyAuthTokenSrc);

        if (userIdSrc && authTokenSrc) {
            alert(`Successfully switched to the new account: ${userName} (${authProvider})`);
            moveUserData(userIdSrc, authTokenSrc).then(_ => {
                openTiersInPatreon();
            });
        } else {
            fetch(`https://patreon.awakari.com/v1/status`, {
                headers: headers,
            }).then(resp => {
                if (resp && resp.ok) {
                     document.getElementById("user-status").innerText = "★ Customized for the Supporter";
                    document.getElementById("button-upgrade").style.display = "none";
                }
            });
        }
    }
}

function upgrade() {
    const authProvider = localStorage.getItem(keyAuthProvider);
    switch (authProvider) {
        case "Patreon": {
            openTiersInPatreon();
            break;
        }
        default: {
            const state = Base64.encodeURI(`https://awakari.com/user.html?userIdSrc=${localStorage.getItem(keyUserId)}&authTokenSrc=${localStorage.getItem(keyAuthToken)}`);
            // Construct the OAuth authorization URL
            const oauthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${patreonClientId}&redirect_uri=${patreonRedirectUri}&scope=${patreonScope}&state=${state}`;
            // Redirect the user to Patreon's OAuth page
            logoutConfirmed(oauthUrl);
            break;
        }
    }
}

function moveUserData(userIdSrc, authTokenSrc) {
    if (confirm("Move your data (interests, etc) to the new account?")) {
        return fetch(`https://usage.awakari.com/v1/import`, {
            method: "POST",
            headers: {
                // target (this) user
                "Authorization": `Bearer ${localStorage.getItem(keyAuthToken)}`,
                "X-Awakari-Group-Id": defaultGroupId,
                "X-Awakari-User-Id": localStorage.getItem(keyUserId),
                // source user
                "x-awakari-src-group-id": defaultGroupId,
                "x-awakari-src-user-id": userIdSrc,
                "x-awakari-src-authorization": `Bearer ${authTokenSrc}`,
            },
        }).then(resp => {
            if (resp.ok) {
                alert("Your data have been successfully moved to the new account");
            } else {

                const userId = localStorage.getItem(keyUserId);
                const payload = {
                    id: Events.newId(),
                    specVersion: "1.0",
                    source: "awakari.com",
                    type: "com_awakari_webapp",
                    attributes: {
                        action: {
                            ce_string: "chown",
                        },
                        cause: {
                            ce_string: `response: ${resp.status}, ${resp.body}`,
                        },
                        object: {
                            ce_string: userIdSrc,
                        },
                        objecturl: {
                            ce_uri: userIdSrc,
                        },
                        subject: {
                            ce_string: userId,
                        },
                    },
                    text_data: `User ${userId} failed to transfer its data from ${userIdSrc}`,
                }
                const headers = getAuthHeaders();
                Events.publishInternal(payload, headers);

                console.log(`Failed to import the user data: ${resp.status}, ${resp.body}`);
                alert("Failed to import the user data");
            }
        }).catch(e => {

            const userId = localStorage.getItem(keyUserId);
            const payload = {
                id: Events.newId(),
                specVersion: "1.0",
                source: "awakari.com",
                type: "com_awakari_webapp",
                attributes: {
                    action: {
                        ce_string: "chown",
                    },
                    cause: {
                        ce_string: `${e}`,
                    },
                    object: {
                        ce_string: userIdSrc,
                    },
                    objecturl: {
                        ce_uri: userIdSrc,
                    },
                    subject: {
                        ce_string: userId,
                    },
                },
                text_data: `User ${userId} failed to transfer its data from ${userIdSrc}`,
            }
            const headers = getAuthHeaders();
            Events.publishInternal(payload, headers);

            console.log(e);
            alert("Failed to import the user data");
        });
    } else {
        return Promise.resolve();
    }
}

function openTiersInPatreon() {
    if (confirm("To complete the upgrade, please choose a membership tier in Patreon")) {
        window.open("https://www.patreon.com/c/awakari/membership", "_blank");
    }
}
