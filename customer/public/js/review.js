async function submitReview() {
    const commentInput = document.getElementById('comment');
    const comment = commentInput.value.trim();
    const customerId = sessionStorage.getItem('customerId');
    const rating = window.__selectedRating || null;

    if (!customerId) {
        Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Please login again to submit your review.',
            confirmButtonColor: '#3085d6'
        }).then(() => window.location.href = '/customer/view/login.html');
        return;
    }

    if (rating === null) {
        Swal.fire({
            icon: 'warning',
            title: 'Rating Required',
            text: 'Please select a star rating before submitting.',
            confirmButtonColor: '#3085d6'
        }).then(() => {
            const row = document.getElementById('star-row');
            if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        return;
    }

    if (!comment.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Comment Required',
            text: 'Please enter a comment before submitting.',
            confirmButtonColor: '#3085d6'
        }).then(() => {
            commentInput.focus();
        });
        return;
    }

    try {
        const res = await fetch('/customer/submit-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: customerId,
                comment: comment,
                rating: rating
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
            Swal.fire({
                icon: 'success',
                title: 'Review Submitted',
                text: 'Thank you for your feedback!',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                window.location.href = 'history.html';
            }); 
            
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Save Failed',
                text: 'Failed to save review. Please try again.',
                confirmButtonColor: '#3085d6'
            });
        }
    } catch (e) {
        console.error("Submission error:", e);
        Swal.fire({
            icon: 'error',
            title: 'Connection Error',
            text: 'Please try again later.',
            confirmButtonColor: '#3085d6'
        });
    }
}

function goBack() {
    const customerId = sessionStorage.getItem('customerId');
    if (customerId) {
        window.location.href = '/customer/view/status.html';
    } else {
        window.location.href = '/customer/view/login.html';
    }
}

function updateRatingLabel(value) {
    const label = document.getElementById('rating-label');
    if (!label) return;
    const descriptions = {
        1: 'Very poor',
        2: 'Needs improvement',
        3: 'Good',
        4: 'Great',
        5: 'Excellent',
    };
    label.textContent = value ? `${value} star${value > 1 ? 's' : ''} — ${descriptions[value]}` : 'Select a star rating.';
}

// star rating UI
function initializeStars() {
    const row = document.getElementById('star-row');
    if (!row) return;

    row.addEventListener('click', function (e) {
        const v = e.target && e.target.getAttribute && e.target.getAttribute('data-value');
        if (!v) return;
        const val = parseInt(v, 10);
        window.__selectedRating = val;
        Array.from(row.querySelectorAll('span')).forEach((s) => {
            const sv = parseInt(s.getAttribute('data-value'), 10);
            s.textContent = sv <= val ? '★' : '☆';
        });
        updateRatingLabel(val);
    });
}

window.addEventListener('DOMContentLoaded', function () {
    initializeStars();
    updateRatingLabel(0);
});
