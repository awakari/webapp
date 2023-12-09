function loadSource() {
    //
    const urlParams = new URLSearchParams(window.location.search);
    const typ = urlParams.get("type");
    document.getElementById("type").innerText = typ;
    const addr = urlParams.get("addr");
    document.getElementById("addr").innerText = decodeURIComponent(addr);
    let authToken = sessionStorage.getItem("authToken");
    let userId = sessionStorage.getItem("userId");
    //
    fetch(`/v1/src/${typ}/${addr}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
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
                document.getElementById("type").innerText = typ;
                document.getElementById("addr").innerText = data.addr;
                if (data.lastUpdate === "0001-01-01T00:00:00Z") {
                    document.getElementById("last_upd").innerText = "N/A";
                } else {
                    document.getElementById("last_upd").innerText = data.lastUpdate;
                }
                if (data.updatePeriod === 0) {
                    document.getElementById("upd_period").innerText = "N/A";
                } else {
                    document.getElementById("upd_period").innerText = data.updatePeriod;
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

    let authToken = sessionStorage.getItem("authToken");
    let userId = sessionStorage.getItem("userId");

    if (confirm(`Confirm delete source ${decodeURIComponent(addr)}?`)) {
        fetch(`/v1/src/${typ}/${addr}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "X-Awakari-Group-Id": defaultGroupId,
                "X-Awakari-User-Id": userId,
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