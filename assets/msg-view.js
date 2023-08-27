function loadEvent() {
    const queryParams = new URLSearchParams(window.location.search);
    const subId = queryParams.get("subId");
    const evtsHistory = localStorage.getItem(subId);
    const evtId = queryParams.get("evtId");
    evtsHistory.forEach(evt => {
        if (evt.id === evtId) {
            document.getElementById("evt_id").innerText = evt.id;
            document.getElementById("evt_source").innerHTML = `<a href="${evt.source}">${evt.source}</a>`;
            document.getElementById("evt_time").innerText = new Date(evt.attributes.time.Attr.CeTimestamp.seconds * 1000).toISOString();
            document.getElementById("evt_text_data").innerText = evt.Data != null && evt.Data.TextData != null ? evt.Data.TextData : "";
            for (const attr of evt.attributes) {
                console.log(attr);
            }
        }
    })
}
