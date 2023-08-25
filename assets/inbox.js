function loadInbox() {
    const queryParams = new URLSearchParams(window.location.search);
    const subId = queryParams.get("id");
    console.log('Inbox subscription id:', subId);
}
