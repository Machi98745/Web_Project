async function submitReview() {
    const commentInput = document.getElementById('comment');
    const comment = commentInput.value;
    const customerId = sessionStorage.getItem('customerId');

    if (!comment.trim()) {
        alert("Please enter a comment before submitting.");
        commentInput.focus();
        return;
    }

    try {
        const res = await fetch('/customer/submit-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: customerId,
                comment: comment
            })
        });

        if (res.ok) {
            const finalAmount = localStorage.getItem('temp_final_amount') || "0";
            
            const historyEntry = {
                amount: finalAmount,
                date: new Date().toLocaleString(),
                comment: comment
            };
            localStorage.setItem('last_order_history', JSON.stringify(historyEntry));
            localStorage.setItem('has_paid', 'true');
            alert("Review submitted! Thank you for your feedback.");
            window.location.href = 'history.html'; 
            
        } else {
            alert("Failed to save review. Please try again.");
        }
    } catch (e) {
        console.error("Submission error:", e);
        alert("Connection error. Please try again later.");
    }
}