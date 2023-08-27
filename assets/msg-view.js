function loadEvent() {
    const queryParams = new URLSearchParams(window.location.search);
    const subId = queryParams.get("subId");
    const evtsHistory = loadEventsHistory(subId);
    const evtId = queryParams.get("evtId");
    evtsHistory.forEach(evt => {
        if (evt.id === evtId) {
            document.getElementById("evt_id").innerText = evt.id;
            document.getElementById("evt_source").innerHTML = `<a href="${evt.source}">${evt.source}</a>`;
            document.getElementById("evt_time").innerText = new Date(evt.attributes.time.Attr.CeTimestamp.seconds * 1000).toISOString();
            document.getElementById("evt_title").innerText = evt.attributes.title != null ? evt.attributes.title.Attr.CeString : "";
            document.getElementById("evt_summary").innerText = evt.attributes.summary != null ? evt.attributes.summary.Attr.CeString : "";
            document.getElementById("evt_text_data").innerText = evt.Data != null && evt.Data.TextData != null ? evt.Data.TextData : "";
            document.getElementById("evt_ext_attrs").innerText = JSON.stringify(evt.attributes);
            // update the download link
            let link = document.getElementById("evt_link_download");
            link.href += btoa(JSON.stringify(evt));
            link.download = `${evt.id}.json`;
        }
    })
}
