async function loadHistory() {
    const customerId = sessionStorage.getItem('customerId');
    if (!customerId) return;

    const amountDisplay = document.getElementById('payment-amount');
    const timeDisplay = document.getElementById('payment-time');
    const commentDisplay = document.getElementById('history-comment');
    const starDisplay = document.getElementById('history-stars');

    try {
        const pRes = await fetch(`/customer/payment-history/${customerId}`);
        let payment = await pRes.json();

        // Debugging: Log the payment data to see its structure.
        console.log("Payment Data:", payment);

        // Check if it's an array. If so, use the first element.
        if (Array.isArray(payment)) {
            payment = payment[0];
        }

        // Check that the new terms and conditions are comprehensive.
        if (payment && payment.total_price !== undefined) {
            amountDisplay.innerHTML = `${payment.total_price}<span class="text-amber-400 ml-2 not-italic text-3xl">฿</span>`;

            const paidDate = new Date(payment.paid_at).toLocaleString('th-TH', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            timeDisplay.innerHTML = `<span class="opacity-50">ID: #${customerId}</span> • ${paidDate}`;
        } else {
            // If you can't find the information
            timeDisplay.innerText = "No payment record found.";
        }

        // --- Review Section ---
        const rRes = await fetch(`/customer/review-history/${customerId}`);
        let review = await rRes.json();

        if (Array.isArray(review)) review = review[0];

        if (review && review.comment) {
            commentDisplay.innerText = review.comment;
        }

        if (review && review.rating) {
            starDisplay.innerHTML = '★'.repeat(review.rating) +
                '<span class="text-slate-200">' + '★'.repeat(5 - review.rating) + '</span>';
        }

    } catch (e) {
        console.error("History load error:", e);
        if (amountDisplay) amountDisplay.innerText = "Error";
        if (timeDisplay) timeDisplay.innerText = "Failed to load details.";
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