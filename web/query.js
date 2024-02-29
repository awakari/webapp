function queryType() {
    if (document.getElementById('query').value === '') {
        document.getElementById('login').style.display='none';
    }
}

function querySubmit() {
    const q = document.getElementById('query').value;
    if (q === '') {
        document.getElementById('login').style.display = 'none';
    } else {
        const userId = localStorage.getItem(keyUserId);
        switch (userId) {
            case null:
                document.getElementById('login').style.display = 'flex';
                break
            default:
                alert(`Create subscription for keywords "${q}" and stream events for 1h`);
        }
    }
}
