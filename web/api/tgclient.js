const TgClient = {}

TgClient.Login = function (formData, headers) {
    const optsReq = {
        method: "POST",
        headers: headers,
        body: formData,
    };
    return fetch(`https://pub.awakari.com/v1/tg`, optsReq);
}
