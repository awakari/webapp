function loadSource() {
    //
    const urlParams = new URLSearchParams(window.location.search);
    const typ = urlParams.get("type");
    document.getElementById("type").innerText = typ;
    const addr = decodeURIComponent(urlParams.get("addr"));
    document.getElementById("addr").innerText = addr;
    let authToken = sessionStorage.getItem(keyAuthToken);
    let userId = sessionStorage.getItem(keyUserId);
    //
    fetch(`/v1/src/${typ}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
            "X-Awakari-Src-Addr": addr,
        },
        cache: "default",
    })
        .then(resp => {
            if (!resp.ok) {
                throw new Error(`Request failed with status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data != null) {
                switch (typ) {
                    case "feed":
                        document.getElementById("type").innerText = "Feed";
                        break
                    case "site":
                        document.getElementById("type").innerText = "Site";
                        break
                    case "tgch":
                        document.getElementById("type").innerText = "Telegram channel";
                        break
                }
                document.getElementById("addr").innerText = data.addr;
                if (data.lastUpdate === "0001-01-01T00:00:00Z") {
                    document.getElementById("last_upd").innerText = "N/A";
                } else {
                    document.getElementById("last_upd").innerText = data.lastUpdate;
                }
                if (data.updatePeriod === 0) {
                    document.getElementById("upd_period").innerText = "N/A";
                } else {
                    const d = moment.duration(data.updatePeriod / 1_000_000); // nanos -> millis
                    document.getElementById("upd_period").innerText = d.humanize();
                }
                const btnDel = document.getElementById("button_src_del");
                if (data.groupId === defaultGroupId && data.userId === userId) {
                    btnDel.removeAttribute("disabled");
                    btnDel.onclick = () => deleteSource(typ, addr);
                } else {
                    btnDel.disabled = "disabled";
                }
            }
        })
        .catch(err => {
            alert(err);
        });
}

function deleteSource(typ, addr) {

    let authToken = sessionStorage.getItem(keyAuthToken);
    let userId = sessionStorage.getItem(keyUserId);

    if (confirm(`Confirm delete source ${addr}?`)) {
        fetch(`/v1/src/${typ}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "X-Awakari-Group-Id": defaultGroupId,
                "X-Awakari-User-Id": userId,
                "X-Awakari-Src-Addr": addr,
            },
        })
            .then(resp => {
                if (!resp.ok) {
                    throw new Error(`Request failed with status: ${resp.status}`);
                }
                return resp;
            })
            .then(_ => {
                alert(`Source ${decodeURIComponent(addr)} deleted successfully`);
                window.location.assign("pub.html");
            })
            .catch(err => {
                alert(err);
            });
    }
}
