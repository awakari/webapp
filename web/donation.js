function openDonationPage() {
    let link = "https://donate.stripe.com/14k7uCaYq5befN65kk";
    const userId = localStorage.getItem(keyUserId);
    if (userId) {
        const customerId = userId.replace(/[^a-zA-Z0-9]/g, '_');
        link += `?prefilled_email=${customerId}%40awakari.com`;
    } else if (!confirm("You're not signed in. Donate anonymously?")) {
        window.location.assign("login.html?redirect=donation.html");
        return
    }
    window.location.assign(link);
}
