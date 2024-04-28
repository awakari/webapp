const weekDays = 7;
const dayMinutes = 24 * 60;
const weekMinutes = weekDays * dayMinutes;

async function loadSource() {
    //
    const urlParams = new URLSearchParams(window.location.search);
    const typ = urlParams.get("type");
    document.getElementById("type").innerText = typ;
    const addr = decodeURIComponent(urlParams.get("addr"));
    const addrEnc = encodeURIComponent(addr);
    document.getElementById("addr").innerText = addr;
    //
    document.getElementById("freq-charts").style.display = "none";
    document.body.classList.add('waiting-cursor');
    document.getElementById("wait").style.display = "block";
    //
    let headers = getAuthHeaders();
    const counts = await Sources
        .fetch(typ, addrEnc, headers)
        .then(resp => resp ? resp.json() : null)
        .then(data => {
            if (data) {
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
                                document.getElementById("upd_period").innerText = data.nextUpdate;
                                break
                        }
                        document.getElementById("addr").innerHTML = `<a href="${data.addr}" target="_blank" class="text-blue-500">${data.addr}</a>`;
                        document.getElementById("name").innerText = data.name;
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
                if (data.hasOwnProperty("created") && data.created.length > 0 && data.created !== "0001-01-01T00:00:00Z") {
                    document.getElementById("added-date").innerText = data.created;
                } else {
                    document.getElementById("added-date").innerText = "N/A";
                }
                if (data.hasOwnProperty("lastUpdate") && data.lastUpdate.length > 0 && data.lastUpdate !== "0001-01-01T00:00:00Z") {
                    document.getElementById("last_upd").innerText = data.lastUpdate;
                } else {
                    document.getElementById("last_upd").innerText = "N/A";
                }
                //
                const btnDel = document.getElementById("button_src_del");
                if (data.groupId === defaultGroupId && headers["X-Awakari-User-Id"] && data.userId === headers["X-Awakari-User-Id"]) {
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
        });
    document.body.classList.remove('waiting-cursor');
    document.getElementById("wait").style.display = "none";
    if (counts && Object.keys(counts).length > 0) {
        document.getElementById("wait").style.display = "block";
        document.body.classList.add('waiting-cursor');
        await drawFreqChart(addr, counts);
    }
}

const freqChartHeight = 100;
const freqChartWidth = 288;
const stepX = freqChartWidth / dayMinutes;
const freqChartOffsetTop = 22;
const freqChartOffsetLeft = 30;

async function drawFreqChart(addr, counts) {
    let countMax = 0;
    let countSum = 0;
    for (const c of Object.values(counts)) {
        countSum += c;
        if (c > countMax) {
            countMax = c;
        }
    }
    const avg = countSum / weekMinutes;
    document.getElementById("freq-charts").style.display = "block";
    const stepY = freqChartHeight / countMax;
    let prevHour = -1;
    for (const [t, c] of Object.entries(counts)) {
        const weekHour = Math.floor(t / 60);
        if (prevHour !== weekHour) {
            prevHour = weekHour;
            // simulate a blocking I/O to redraw before
            await fetch("https://awakari.com", {
                method: "GET",
                cache: "force-cache",
            }).finally(() => console.log(`draw char for the next hour ${weekHour}`));
        }
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

function deleteSource(typ, addrEnc) {
    if (confirm(`Confirm delete source ${decodeURIComponent(addrEnc)}?`)) {
        let headers = getAuthHeaders();
        Sources
            .delete(typ, addrEnc, headers)
            .then(deleted => {
                if (deleted) {
                    alert(`Source ${decodeURIComponent(addrEnc)} deleted successfully`);
                    window.location.assign("pub.html");
                }
            });
    }
}
