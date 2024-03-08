async function loadSource() {
    //
    const urlParams = new URLSearchParams(window.location.search);
    const typ = urlParams.get("type");
    document.getElementById("type").innerText = typ;
    const addr = decodeURIComponent(urlParams.get("addr"));
    const addrEnc = encodeURIComponent(addr);
    document.getElementById("addr").innerText = addr;
    let authToken = localStorage.getItem(keyAuthToken);
    let userId = localStorage.getItem(keyUserId);
    //
    document.getElementById("freq-charts").style.display = "none";
    document.body.classList.add('waiting-cursor');
    document.getElementById("wait").style.display = "block";
    const counts = await fetch(`/v1/src/${typ}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`,
            "X-Awakari-Group-Id": defaultGroupId,
            "X-Awakari-User-Id": userId,
            "X-Awakari-Src-Addr": addrEnc,
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
                    case "apub":
                        document.getElementById("type").innerText = "ActivityPub";
                        document.getElementById("upd_period").innerText = "Real-Time";
                        document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        document.getElementById("name").innerText = data.name;
                        if (data.accepted) {
                            document.getElementById("accepted").checked = true;
                        }
                        break
                    case "feed":
                        switch (data.push) {
                            case true:
                                document.getElementById("type").innerText = "WebSub";
                                document.getElementById("upd_period").innerText = "Real-Time";
                                document.getElementById("accepted").checked = true;
                                break
                            default:
                                document.getElementById("type").innerText = "Feed";
                                const d = moment.duration(data.updatePeriod / 1_000_000); // nanos -> millis
                                document.getElementById("upd_period").innerText = `Polling once ${d.humanize()}`;
                                break
                        }
                        document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        break
                    case "site":
                        document.getElementById("type").innerText = "Site";
                        document.getElementById("upd_period").innerText = "Polling once a day";
                        document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        break
                    case "tgch":
                        document.getElementById("type").innerText = "Telegram channel (App)";
                        document.getElementById("upd_period").innerText = "Real-Time";
                        if (data.addr[0] === '@') {
                            const chName = data.addr.slice(1);
                            document.getElementById("addr").innerHTML = `<a href="https://t.me/${chName}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        } else {
                            document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        }
                        document.getElementById("name").innerText = data.name;
                        break
                    case "tgbc":
                        document.getElementById("type").innerText = "Telegram channel (Bot)";
                        document.getElementById("upd_period").innerText = "Real-Time";
                        if (data.addr[0] === '@') {
                            const chName = data.addr.slice(1);
                            document.getElementById("addr").innerHTML = `<a href="https://t.me/${chName}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        } else {
                            document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        }
                        document.getElementById("accepted").checked = true;
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
                    btnDel.onclick = () => deleteSource(typ, addrEnc);
                } else {
                    btnDel.disabled = "disabled";
                }
                document.getElementById("button_src_report").onclick = () => {
                    reportPublishingSourceInappropriate(data.addr);
                }
                //
                switch (data.usage.type) {
                    case 1:
                        document.getElementById("owner").innerText = "Dedicated";
                        document.getElementById("total").innerText = data.usage.total;
                        document.getElementById("count").innerText = data.usage.count;
                        document.getElementById("pub-src-lim-incr-btn").onclick = () => {
                            requestIncreasePublishingDailyLimit(data.addr);
                        };
                        break;
                    case 2:
                        document.getElementById("owner").innerText = "User";
                        document.getElementById("total").innerText = `${data.usage.total} (all user's publications)`;
                        document.getElementById("count").innerText = `${data.usage.count} (all user's publications)`;
                        document.getElementById("pub-src-lim-incr-btn").onclick = () => {
                            requestIncreasePublishingDailyLimit(data.userId);
                        };
                        document.getElementById("pub-src-nominate").style.display = "block";
                        document.getElementById("pub-src-nominate").onclick = () => {
                            requestPublishingSourceDedicated(data.addr);
                        }
                        break;
                }
                document.getElementById("limit").innerText = data.usage.limit;
                return data.counts;
            }
            return null;
        })
        .catch(err => {
            alert(err);
            return null;
        });
    document.body.classList.remove('waiting-cursor');
    document.getElementById("wait").style.display = "none";
    if (counts != null) {
        const pointsCount = Object.keys(counts).length;
        if (pointsCount < 720 || confirm("Draw frequency chart? This may take a while.")) {
            drawFreqChart(counts);
        }
    }
}

const weekDays = 7;
const dayMinutes = 24 * 60;
const weekMinutes = weekDays * dayMinutes;
const freqChartHeight = 100;
const freqChartWidth = 288;
const stepX = freqChartWidth / dayMinutes;
const freqChartOffsetTop = 22;
const freqChartOffsetLeft = 30;

async function drawFreqChart(counts) {
    if (counts != null && Object.keys(counts).length > 0) {
        document.body.classList.add('waiting-cursor');
        document.getElementById("wait").style.display = "block";
        document.getElementById("freq-charts").style.display = "block";
        let countMax = 0;
        let countSum = 0;
        for (let i = 0; i < weekMinutes; i ++) {
            if (counts.hasOwnProperty(i)) {
                const c = counts[i];
                countSum += c;
                if (c > countMax) {
                    countMax = c;
                }
            }
        }
        const avg = countSum / weekMinutes;
        console.log(`Average per minute: ${avg}`);
        const stepY = freqChartHeight / countMax;
        for (const [t, c] of Object.entries(counts)) {
            const dayNum = Math.floor(t / dayMinutes);
            let chartElement = document.getElementById(`chart-freq-${dayNum}`);
            const h = stepY * c;
            const x = freqChartOffsetLeft + (t - dayNum * dayMinutes) * stepX;
            chartElement.innerHTML += `<line x1="${x}" y1="${freqChartOffsetTop + freqChartHeight}" x2="${x}" y2="${freqChartOffsetTop + freqChartHeight - h}" class="svg-chart-line-data"></line>`
        }
        const hAvg = stepY * avg;
        for (let i = 0; i < weekDays; i++) {
            let chartElement = document.getElementById(`chart-freq-${i}`);
            chartElement.innerHTML += `<text x="20" y="20" class="svg-text">${countMax}</text>`;
            chartElement.innerHTML += `<line x1="${freqChartOffsetLeft}" y1="${freqChartOffsetTop + freqChartHeight - hAvg}" x2="${freqChartOffsetLeft + freqChartWidth}" y2="${freqChartOffsetTop + freqChartHeight - hAvg}" class="svg-chart-line-avg"></line>`
        }
        document.body.classList.remove('waiting-cursor');
        document.getElementById("wait").style.display = "none";
    }
}

function deleteSource(typ, addrEnc) {

    let authToken = localStorage.getItem(keyAuthToken);
    let userId = localStorage.getItem(keyUserId);

    if (confirm(`Confirm delete source ${decodeURIComponent(addrEnc)}?`)) {
        fetch(`/v1/src/${typ}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "X-Awakari-Group-Id": defaultGroupId,
                "X-Awakari-User-Id": userId,
                "X-Awakari-Src-Addr": addrEnc,
            },
        })
            .then(resp => {
                if (!resp.ok) {
                    throw new Error(`Request failed with status: ${resp.status}`);
                }
                return resp;
            })
            .then(_ => {
                alert(`Source ${decodeURIComponent(addrEnc)} deleted successfully`);
                window.location.assign("pub.html");
            })
            .catch(err => {
                alert(err);
            });
    }
}
