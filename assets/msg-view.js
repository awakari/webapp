function loadEvent() {
    const queryParams = new URLSearchParams(window.location.search);
    const subId = queryParams.get("subId");
    let evts = Events.GetLocalHistory(subId);
    const evtId = queryParams.get("evtId");
    evts.forEach(evt => {
        if (evt.id === evtId) {
            evt.read = true
            document.getElementById("evt_id").innerText = evt.id;
            document.getElementById("evt_source").innerHTML = `<a href="${evt.source}">${evt.source}</a>`;
            document.getElementById("evt_time").innerText = evt.attributes.time.ce_timestamp;
            document.getElementById("evt_title").innerText = evt.attributes.title != null ? evt.attributes.title.ce_string : "";
            document.getElementById("evt_summary").innerText = evt.attributes.summary != null ? evt.attributes.summary.ce_string : "";
            document.getElementById("evt_text_data").innerText = evt.text_data != null ? evt.text_data : "";
            document.getElementById("evt_ext_attrs").innerText = JSON.stringify(evt.attributes, null, 2);
            // update the download link
            let link = document.getElementById("evt_link_download");
            link.href += btoa(unescape(encodeURIComponent(JSON.stringify(evt, null, 2))));
            link.download = `${evt.id}.json`;
        }
    })
    Events.PutLocalHistory(subId, evts);
}
