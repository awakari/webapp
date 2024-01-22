function loadSource() {
    //
    const urlParams = new URLSearchParams(window.location.search);
    const typ = urlParams.get("type");
    document.getElementById("type").innerText = typ;
    const addr = decodeURIComponent(urlParams.get("addr"));
    document.getElementById("addr").innerText = addr;
    let authToken = localStorage.getItem(keyAuthToken);
    let userId = localStorage.getItem(keyUserId);
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
                        switch (data.push) {
                            case true:
                                document.getElementById("type").innerText = "WebSub";
                                break
                            default:
                                document.getElementById("type").innerText = "Feed";
                                break
                        }
                        const d = moment.duration(data.updatePeriod / 1_000_000); // nanos -> millis
                        document.getElementById("upd_period").innerText = d.humanize();
                        document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        break
                    case "site":
                        document.getElementById("type").innerText = "Site";
                        document.getElementById("upd_period").innerText = "a day";
                        document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        break
                    case "tgch":
                        document.getElementById("type").innerText = "Telegram channel (App)";
                        document.getElementById("upd_period").innerText = "N/A";
                        if (data.addr[0] === '@') {
                            const chName = data.addr.slice(1);
                            document.getElementById("addr").innerHTML = `<a href="https://t.me/${chName}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        } else {
                            document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        }
                        break
                    case "tgbc":
                        document.getElementById("type").innerText = "Telegram channel (Bot)";
                        document.getElementById("upd_period").innerText = "N/A";
                        if (data.addr[0] === '@') {
                            const chName = data.addr.slice(1);
                            document.getElementById("addr").innerHTML = `<a href="https://t.me/${chName}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        } else {
                            document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        }
                        break
                }
                if (data.lastUpdate === "0001-01-01T00:00:00Z") {
                    document.getElementById("last_upd").innerText = "N/A";
                } else {
                    document.getElementById("last_upd").innerText = data.lastUpdate;
                }
                const btnDel = document.getElementById("button_src_del");
                if (data.groupId === defaultGroupId && data.userId === userId) {
                    btnDel.removeAttribute("disabled");
                    btnDel.onclick = () => deleteSource(typ, addr);
                } else {
                    btnDel.disabled = "disabled";
                }
                //
                switch (data.usage.type) {
                    case 1:
                        document.getElementById("owner").innerText = "Dedicated";
                        break;
                    case 2:
                        document.getElementById("owner").innerText = "User";
                        break;
                }
                document.getElementById("count").innerText = data.usage.count;
                document.getElementById("total").innerText = data.usage.total;
                document.getElementById("limit").innerText = data.usage.limit;
            }
        })
        .catch(err => {
            alert(err);
        });
}

function deleteSource(typ, addr) {

    let authToken = localStorage.getItem(keyAuthToken);
    let userId = localStorage.getItem(keyUserId);

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
