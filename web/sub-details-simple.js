document
    .getElementById("mode-simple")
    .addEventListener("submit", async function (evt){
        evt.preventDefault();
        const q = document.getElementById("query").value;
        const seg = new Intl.Segmenter(undefined, {granularity: "word"});
        const cond = {
            not: false,
            gc: {
                logic: Number(document.getElementById("logic-select-simple").value),
                group: [],
            }
        };
        [...seg.segment(q)]
            .filter(term => term.isWordLike)
            .forEach(term => cond.gc.group.push({
                not: false,
                tc: {
                    key: "",
                    term: term.segment,
                    exact: false,
                }
            }));
        const discoverSourcesFlag = document.getElementById("sub-discover-sources-simple").checked;
        const headers = getAuthHeaders();
        document.getElementById("wait").style.display = "block";
        await Interests
            .create("", q, undefined, false, cond, discoverSourcesFlag, headers)
            .then(data => {
                if (data != null) {
                    alert("Interest created");
                    window.location.assign(`sub-details.html?id=${data.id}`);
                }
            })
            .finally(() => {
                document.getElementById("wait").style.display = "none";
            });
    });
