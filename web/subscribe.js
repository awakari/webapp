async function loadSubscribeForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (!id) {
        return;
    }
    document.getElementById("subscribe-interest-id").innerText = id;
    document.getElementById("button-subscribe-feed").onclick = () => {
        window.open(`https://reader.awakari.com/v1/sub/rss/${id}`, "_blank");
    };
    document.getElementById("button-subscribe-telegram").onclick = () => {
        window.open(`https://t.me/AwakariBot?start=${id}`, "_blank");
    };
    document.getElementById("button-subscribe-skip").onclick = () => {
        window.location.assign(`sub-details.html?id=${id}`);
    };
    const headers = getAuthHeaders();
    return Interests
        .fetch(id, headers)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            if (data) {
                document.getElementById("subscribe-interest-name").innerText = data.description;
                if (data.public) {
                    document.getElementById("button-subscribe-bluesky").style.display = "flex";
                    document.getElementById("button-subscribe-bluesky").onclick = () => {
                        window.open(`https://bsky.app/profile/did:plc:i53e6y3liw2oaw4s6e6odw5m/feed/${id}`, "_blank");
                    };
                    document.getElementById("button-subscribe-fediverse").style.display = "flex";
                    document.getElementById("button-subscribe-fediverse").onclick = () => {
                        const addrFediverse = `@${id}@activitypub.awakari.com`;
                        navigator
                            .clipboard
                            .writeText(addrFediverse)
                            .then(() => {
                                alert(`Copied the address to the clipboard:\n\n${addrFediverse}\n\nOpen your Fediverse client, paste to a search field and follow.`);
                            });
                    };
                } else {
                    document.getElementById("button-subscribe-bluesky").style.display = "none";
                    document.getElementById("button-subscribe-fediverse").style.display = "none";
                }
            }
        });
}
