document
    .querySelectorAll(".select-cond-type")
    .forEach(e => e.addEventListener(
        "change", function (evt) {
            switch (evt.target.value) {
                case "tc":

                    break;
                case "nc":
                    break;
            }
        }
    ));
