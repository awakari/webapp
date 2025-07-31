const templateSrcPopular = (share, url) => `
    <div class="space-x-1 truncate">
        <span>${share} %</span>
        <a href="${url}" class="text-blue-500">${url}</a>
    </div>
`

const templateIntNew = (id, data) => `
    <div class="space-x-1 truncate">
        <span><a href="sub-details.html?id=${id}" class="text-blue-500">${data.description}</a>:</span>
        <span>${data.hasOwnProperty("created") ? timeAgo(data.created.seconds) : '0'}</span>
    </div>
`

function timeAgo(seconds) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - seconds;

    const units = [
        { name: 'year', seconds: 31536000 },
        { name: 'month', seconds: 2592000 },
        { name: 'week', seconds: 604800 },
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'minute', seconds: 60 },
        { name: 'second', seconds: 1 }
    ];

    for (const unit of units) {
        if (diff >= unit.seconds) {
            const value = Math.floor(diff / unit.seconds);
            return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-value, unit.name);
        }
    }

    return 'just now';
}

function formatNumberShort(number) {
    const suffixes = ["", "", "K", "M", "B", "T", "P"];
    let suffixNum = Math.ceil(("" + Math.round(Math.abs(number))).length / 3);
    let shortNumber = parseFloat((suffixNum > 1 ? (number / Math.pow(1000, suffixNum-1)) : number).toPrecision(3));
    if (shortNumber % 1 !== 0) {
        if (shortNumber > 10) {
            shortNumber = shortNumber.toFixed(1);
        } else if (shortNumber > 100) {
            shortNumber = Math.round(shortNumber);
        } else {
            shortNumber = shortNumber.toFixed(2);
        }
    } else {
        shortNumber = Math.round(shortNumber);
    }
    return shortNumber + suffixes[suffixNum];
}

async function loadStatusPubRate() {
    document.getElementById("wait-status-pub-rate-1m").style.display = "block";
    document.getElementById("wait-status-pub-rate-1h").style.display = "block";
    document.getElementById("wait-status-pub-rate-1d").style.display = "block";
    document.getElementById("wait-status-pub-rate-30d").style.display = "block";
    document.getElementById("pub-last-1m").innerHTML = "";
    return Promise.all([
        Metrics.loadStatusPartWithRetry({}, "pub-rate/5m")
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg));
                    throw new Error(`Failed to fetch the status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                if (data) {
                    const pubRateAvgMin1 = Math.floor(data.value * 60);
                    if (pubRateAvgMin1 > 0) {
                        document.getElementById("pub-last-1m").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(pubRateAvgMin1))}</span>`;
                    } else {
                        document.getElementById("pub-last-1m").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(pubRateAvgMin1))}</span>`;
                    }
                }
            })
            .catch(err => {
                console.log(err);
                return "";
            }).finally(() => {
                document.getElementById("wait-status-pub-rate-1m").style.display = "none";
            }),
        Metrics.loadStatusPartWithRetry({}, "pub-rate/1h")
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg));
                    throw new Error(`Failed to fetch the status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                if (data) {
                    const pubRateAvgHour = data.value;
                    if (pubRateAvgHour > 0) {
                        document.getElementById("pub-last-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(pubRateAvgHour * 3600))}</span>`;
                    } else {
                        document.getElementById("pub-last-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(pubRateAvgHour * 3600))}</span>`;
                    }
                }
            })
            .catch(err => {
                console.log(err);
                return "";
            }).finally(() => {
                document.getElementById("wait-status-pub-rate-1h").style.display = "none";
            }),
        Metrics.loadStatusPartWithRetry({}, "pub-rate/1d")
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg));
                    throw new Error(`Failed to fetch the status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                if (data) {
                    const pubRateAvgDay = data.value;
                    if (pubRateAvgDay > 0) {
                        document.getElementById("pub-last-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(pubRateAvgDay * 86400))}</span>`;
                    } else {
                        document.getElementById("pub-last-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(pubRateAvgDay * 86400))}</span>`;
                    }
                }
            })
            .catch(err => {
                console.log(err);
                return "";
            }).finally(() => {
                document.getElementById("wait-status-pub-rate-1d").style.display = "none";
            }),
        Metrics.loadStatusPartWithRetry({}, "pub-rate/30d")
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg));
                    throw new Error(`Failed to fetch the status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                if (data) {
                    const pubRateAvgMonth = data.value;
                    if (pubRateAvgMonth > 0) {
                        document.getElementById("pub-last-30d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(pubRateAvgMonth * 30*86400))}</span>`;
                    } else {
                        document.getElementById("pub-last-30d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(pubRateAvgMonth * 30*86400))}</span>`;
                    }
                }
            })
            .catch(err => {
                console.log(err);
                return "";
            }).finally(() => {
                 document.getElementById("wait-status-pub-rate-30d").style.display = "none";
            }),
    ]);
}

async function loadStatusRead() {
    document.getElementById("wait-status-read-rate-1m").style.display = "block";
    document.getElementById("wait-status-read-rate-1h").style.display = "block";
    document.getElementById("wait-status-read-rate-1d").style.display = "block";
    document.getElementById("wait-status-read-rate-30d").style.display = "block";
    document.getElementById("wait-status-top-sources").style.display = "block";
    document.getElementById("read-last-1m").innerHTML = "";
    return Promise.all([
        Metrics.loadStatusPartWithRetry({}, "read/5m")
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg));
                    throw new Error(`Failed to fetch the status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                if (data) {
                    const readRateAvgMin1 = Math.floor(data.readRate * 60);
                    if (readRateAvgMin1 > 0) {
                        document.getElementById("read-last-1m").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(readRateAvgMin1))}</span>`;
                    } else {
                        document.getElementById("read-last-1m").innerHTML = `${formatNumberShort(Math.round(readRateAvgMin1))}`;
                    }
                }
            })
            .catch(err => {
                console.log(err);
                return "";
            }).finally(() => {
                document.getElementById("wait-status-read-rate-1m").style.display = "none";
            }),
        Metrics.loadStatusPartWithRetry({}, "read/1h")
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg));
                    throw new Error(`Failed to fetch the status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                if (data) {
                    const readRateAvgHour = data.readRate;
                    if (readRateAvgHour > 0) {
                        document.getElementById("read-last-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(readRateAvgHour * 3600))}</span>`;
                    } else {
                        document.getElementById("read-last-1h").innerHTML = `${formatNumberShort(Math.round(readRateAvgHour * 3600))}`;
                    }
                }
            })
            .catch(err => {
                console.log(err);
                return "";
            }).finally(() => {
                document.getElementById("wait-status-read-rate-1h").style.display = "none";
            }),
        Metrics.loadStatusPartWithRetry({}, "read/1d")
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg));
                    throw new Error(`Failed to fetch the status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                if (data) {

                    const readRateAvgDay = data.readRate;
                    if (readRateAvgDay > 0) {
                        document.getElementById("read-last-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(readRateAvgDay * 86400))}</span>`;
                    } else {
                        document.getElementById("read-last-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(readRateAvgDay * 86400))}</span>`;
                    }

                    const elemPopSrcs = document.getElementById("most-popular-sources");
                    elemPopSrcs.innerHTML = "";
                    Object
                        .entries(data.sourcesMostRead)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .forEach(e => {
                            const share = (100 * e[1]).toFixed(1);
                            elemPopSrcs.innerHTML += templateSrcPopular(share, e[0]);
                        });
                }
            })
            .catch(err => {
                console.log(err);
                return "";
            })
            .finally(() => {
                document.getElementById("wait-status-top-sources").style.display = "none";
            }).finally(() => {
                document.getElementById("wait-status-read-rate-1d").style.display = "none";
            }),
        Metrics.loadStatusPartWithRetry({}, "read/30d")
            .then(resp => {
                if (!resp.ok) {
                    resp.text().then(errMsg => console.error(errMsg));
                    throw new Error(`Failed to fetch the status: ${resp.status}`);
                }
                return resp.json();
            })
            .then(data => {
                if (data) {
                    const readRateAvgMonth = data.readRate;
                    if (readRateAvgMonth > 0) {
                        document.getElementById("read-last-30d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(Math.round(readRateAvgMonth * 30*86400))}</span>`;
                    } else {
                        document.getElementById("read-last-30d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(Math.round(readRateAvgMonth * 30*86400))}</span>`;
                    }
                }
            })
            .catch(err => {
                console.log(err);
                return "";
            }).finally(() => {
                document.getElementById("wait-status-read-rate-30d").style.display = "none";
            }),
    ]);
}

async function loadStatusFollowers() {
    document.getElementById("wait-status-subs").style.display = "block";
    document.getElementById("subscriptions-curr").innerHTML = "";
    return Metrics.loadStatusPartWithRetry({}, "subscriptions")
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to fetch the status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                const subsCurrent = data.current;
                if (subsCurrent > 0) {
                    document.getElementById("subscriptions-curr").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(subsCurrent)}</span>`;
                } else {
                    document.getElementById("subscriptions-curr").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(subsCurrent)}</span>`;
                }
                const followers1hChange = subsCurrent - data.past.hour;
                if (followers1hChange < -10) {
                    document.getElementById("subscriptions-1h").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(followers1hChange)}</span>`;
                } else if (followers1hChange < 0) {
                    document.getElementById("subscriptions-1h").innerHTML = `<span class="text-yellow-600 dark:text-yellow-400">${formatNumberShort(followers1hChange)}</span>`;
                } else if (followers1hChange > 0) {
                    document.getElementById("subscriptions-1h").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(followers1hChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-1h").innerHTML = `${formatNumberShort(followers1hChange)}</span>`;
                }
                const followers1dChange = subsCurrent - data.past.day;
                if (followers1dChange < -20) {
                    document.getElementById("subscriptions-1d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(followers1dChange)}</span>`;
                } else if (followers1dChange < 0) {
                    document.getElementById("subscriptions-1d").innerHTML = `<span class="text-yellow-600 dark:text-yellow-400">${formatNumberShort(followers1dChange)}</span>`;
                } else if (followers1dChange > 0) {
                    document.getElementById("subscriptions-1d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(followers1dChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-1d").innerHTML = `${formatNumberShort(followers1dChange)}</span>`;
                }
                const followers30dChange = subsCurrent - data.past.month;
                if (followers30dChange < -50) {
                    document.getElementById("subscriptions-30d").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(followers30dChange)}</span>`;
                } else if (followers30dChange < 0) {
                    document.getElementById("subscriptions-30d").innerHTML = `<span class="text-yellow-600 dark:text-yellow-400">${formatNumberShort(followers30dChange)}</span>`;
                } else if (followers30dChange > 0) {
                    document.getElementById("subscriptions-30d").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">+${formatNumberShort(followers30dChange)}</span>`;
                } else {
                    document.getElementById("subscriptions-30d").innerHTML = `${formatNumberShort(followers30dChange)}</span>`;
                }
            }
        })
        .catch(err => {
            console.log(err);
            return "";
        })
        .finally(() => {
            document.getElementById("wait-status-subs").style.display = "none";
        });
}

async function loadStatusDuration() {
    document.getElementById("wait-status-duration").style.display = "block";
    document.getElementById("core-duration-q0_5").innerHTML = "";
    return Metrics.loadStatusPartWithRetry({}, "duration")
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to fetch the status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                const durationQ05 = data.q0_5;
                if (durationQ05 < 120) {
                    document.getElementById("core-duration-q0_5").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(durationQ05)}</span> s`;
                } else if (durationQ05 < 300) {
                    document.getElementById("core-duration-q0_5").innerHTML = `<span class="text-yellow-600 dark:text-yellow-400">${formatNumberShort(durationQ05)}</span> s`;
                } else {
                    document.getElementById("core-duration-q0_5").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(durationQ05)}</span> s`;
                }
                const durationQ075 = data.q0_75;
                if (durationQ075 < 300) {
                    document.getElementById("core-duration-q0_75").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(durationQ075)}</span> s`;
                } else if (durationQ075 < 900) {
                    document.getElementById("core-duration-q0_75").innerHTML = `<span class="text-yellow-600 dark:text-yellow-400">${formatNumberShort(durationQ075)}</span> s`;
                } else    {
                    document.getElementById("core-duration-q0_75").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(durationQ075)}</span> s`;
                }
                const durationQ095 = data.q0_95;
                if (durationQ095 < 600) {
                    document.getElementById("core-duration-q0_95").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(durationQ095)}</span> s`;
                } else if (durationQ095 < 1200) {
                    document.getElementById("core-duration-q0_95").innerHTML = `<span class="text-yellow-600 dark:text-yellow-400">${formatNumberShort(durationQ095)}</span> s`;
                } else {
                    document.getElementById("core-duration-q0_95").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(durationQ095)}</span> s`;
                }
                const durationQ099 = data.q0_99;
                if (durationQ099 < 900) {
                    document.getElementById("core-duration-q0_99").innerHTML = `<span class="text-emerald-600 dark:text-emerald-400">${formatNumberShort(durationQ099)}</span> s`;
                } else if (durationQ099 < 1800) {
                    document.getElementById("core-duration-q0_99").innerHTML = `<span class="text-yellow-600 dark:text-yellow-400">${formatNumberShort(durationQ099)}</span> s`;
                } else {
                    document.getElementById("core-duration-q0_99").innerHTML = `<span class="text-red-600 dark:text-red-400">${formatNumberShort(durationQ099)}</span> s`;
                }
            }
        })
        .catch(err => {
            console.log(err);
            return "";
        })
        .finally(() => {
            document.getElementById("wait-status-duration").style.display = "none";
        });
}

async function loadStatusNewInterests() {
    const elemPopInts = document.getElementById("most-followed-interests");
    elemPopInts.innerHTML = "";
    document.getElementById("wait-status-top-interests").style.display = "block";
    return Metrics.loadStatusPartWithRetry({}, "new-interests")
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to fetch the status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                let count = 0;
                Object
                    .entries(data)
                    .filter(e => e[1].hasOwnProperty("created"))
                    .sort((a, b) => b[1].created.seconds - a[1].created.seconds)
                    .slice(0, 3)
                    .forEach(e => {
                        elemPopInts.innerHTML += templateIntNew(e[0], e[1]);
                    });
            }
        })
        .catch(err => {
            console.log(err);
            return "";
        })
        .finally(() => {
            document.getElementById("wait-status-top-interests").style.display = "none";
        });
}

async function loadSrcCountFeeds() {
    document.getElementById("src-count-feeds-wait").style.display = "block";
    return Metrics.fetchSourceCount({}, "feeds")
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to fetch the status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                document.getElementById("src-count-feeds").innerText = data.current;
            }
        })
        .catch(err => {
            console.log(err);
            return "";
        })
        .finally(() => {
            document.getElementById("src-count-feeds-wait").style.display = "none";
        });
}

async function loadSrcCountSocials() {
    document.getElementById("src-count-socials-wait").style.display = "block";
    return Metrics.fetchSourceCount({}, "socials")
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to fetch the status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                document.getElementById("src-count-socials").innerText = data.current;
            }
        })
        .catch(err => {
            console.log(err);
            return "";
        })
        .finally(() => {
            document.getElementById("src-count-socials-wait").style.display = "none";
        });
}

async function loadSrcCountRealtime() {
    document.getElementById("src-count-realtime-wait").style.display = "block";
    return Metrics.fetchSourceCount({}, "realtime")
        .then(resp => {
            if (!resp.ok) {
                resp.text().then(errMsg => console.error(errMsg));
                throw new Error(`Failed to fetch the status: ${resp.status}`);
            }
            return resp.json();
        })
        .then(data => {
            if (data) {
                document.getElementById("src-count-realtime").innerText = data.current;
            }
        })
        .catch(err => {
            console.log(err);
            return "";
        })
        .finally(() => {
            document.getElementById("src-count-realtime-wait").style.display = "none";
        });
}

function loadStatusLoop() {
    loadStatusNewInterests();
    loadStatusRead();
    loadStatusFollowers();
    loadStatusDuration();
    loadStatusPubRate()
    loadSrcCountFeeds();
    loadSrcCountSocials();
    loadSrcCountRealtime();
    setInterval(loadStatusNewInterests, 3_600_000);
    setInterval(loadStatusRead, 300_000);
    setInterval(loadStatusFollowers, 900_000);
    setInterval(loadStatusDuration, 300_000);
    setInterval(loadStatusPubRate, 300_000);
    setInterval(loadSrcCountFeeds, 3_600_000);
    setInterval(loadSrcCountSocials, 3_600_000);
    setInterval(loadSrcCountRealtime, 3_600_000);
}
