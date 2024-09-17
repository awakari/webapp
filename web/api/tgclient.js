const TgClient = {}

TgClient.Login = function (formData, headers) {
    const optsReq = {
        method: "POST",
        headers: headers,
        body: formData,
    };
    return fetch(`/v1/tg`, optsReq);
}
