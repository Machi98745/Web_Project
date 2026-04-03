async function loadHistory() {
    const customerId = sessionStorage.getItem('customerId');
    if (!customerId) return;

    const amountDisplay = document.getElementById('payment-amount');
    const timeDisplay = document.getElementById('payment-time');
    const commentDisplay = document.getElementById('history-comment');

    try {
        const pRes = await fetch(`/customer/payment-history/${customerId}`);
        const payment = await pRes.json();
        
        if (payment.total_price) {
            amountDisplay.innerHTML = `${payment.total_price}<span class="text-amber-400 ml-1">฿</span>`;
            const paidDate = new Date(payment.paid_at).toLocaleString('th-TH', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            timeDisplay.innerText = "Paid at: " + paidDate;
        }
        const rRes = await fetch(`/customer/review-history/${customerId}`);
        const review = await rRes.json();
        
        if (review.comment) {
            commentDisplay.innerText = `"${review.comment}"`;
        } else {
            commentDisplay.innerText = "No comment provided";
        }

    } catch (e) {
        console.error("History load error:", e);
        if (amountDisplay) amountDisplay.innerText = "Error loading";
    }
}

async function finishSession() {
    const customerId = sessionStorage.getItem('customerId');

    try {
        if (customerId) {
            await fetch(`/customer/logout/${customerId}`, { method: 'POST' });
        }
    } catch (e) {
        console.error("Logout error", e);
    } finally {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/customer/view/login.html';
    }
}
window.onload = loadHistory;