// Global State
window.__selectedRating = 0;

// 1. Loading State Handler
function setSubmitting(isSubmitting) {
    const btn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');

    if (!btn || !btnText || !btnLoader) return;

    if (isSubmitting) {
        btn.classList.add('btn-disabled', 'opacity-80');
        btnText.textContent = 'Sending...';
        btnLoader.classList.remove('hidden');
    } else {
        btn.classList.remove('btn-disabled', 'opacity-80');
        btnText.textContent = 'Submit & Finish';
        btnLoader.classList.add('hidden');
    }
}

// 2. Setup Features: Auto-focus & Char Count
function setupReviewFeatures() {
    const commentInput = document.getElementById('comment');
    const charCount = document.getElementById('char-count');
    const stars = document.querySelectorAll('.star-btn');

    // Auto-focus after rating
    stars.forEach(star => {
        star.addEventListener('click', () => {
            setTimeout(() => commentInput.focus(), 200);
        });
    });

    // Character Count & Color Change
    if (commentInput && charCount) {
        commentInput.addEventListener('input', function () {
            const length = this.value.length;
            charCount.textContent = `${length} / 200`;

            if (length >= 180) {
                charCount.className = "text-[10px] text-amber-500 font-bold uppercase tracking-widest";
            } else {
                charCount.className = "text-[10px] text-slate-300 font-bold uppercase tracking-widest";
            }
        });
    }
}

// 3. Main Action: Submit Review
async function submitReview() {
    const commentInput = document.getElementById('comment');
    const comment = commentInput ? commentInput.value.trim() : "";
    const customerId = sessionStorage.getItem('customerId');
    const rating = window.__selectedRating || null;

    if (!customerId) {
        Swal.fire({ icon: 'warning', title: 'Session Expired', text: 'Please login again.', confirmButtonColor: '#fbbf24' })
            .then(() => window.location.href = '/customer/view/login.html');
        return;
    }

    if (rating === null || !comment) {
        Swal.fire({ icon: 'warning', title: 'Incomplete', text: 'Please rate your experience and leave a comment.', confirmButtonColor: '#fbbf24' });
        return;
    }

    setSubmitting(true);

    try {
        const res = await fetch('/customer/submit-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, comment, rating })
        });

        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Thank You!', text: 'Your feedback has been submitted.', timer: 2000, showConfirmButton: false })
                .then(() => window.location.href = 'history.html');
        } else {
            throw new Error('Server Error');
        }
    } catch (e) {
        console.error("Submission error:", e);
        setSubmitting(false);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Something went wrong. Please try again later.', confirmButtonColor: '#ef4444' });
    }
}

// 4. Rating Label Management
function updateRatingLabel(value) {
    const label = document.getElementById('rating-label');
    if (!label) return;

    const descriptions = {
        0: { text: 'Select a star rating', color: 'text-slate-400' },
        1: { text: 'Very poor 😠', color: 'text-red-500' },
        2: { text: 'Needs improvement 😕', color: 'text-orange-400' },
        3: { text: 'Good 🙂', color: 'text-yellow-500' },
        4: { text: 'Great 😃', color: 'text-lime-500' },
        5: { text: 'Excellent! 😍', color: 'text-emerald-500' }
    };

    const s = descriptions[value] || descriptions[0];
    label.textContent = s.text;
    label.className = `text-sm font-bold transition-all duration-300 ${s.color}`;
}

function initializeStars() {
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach(star => {
        star.addEventListener('click', function () {
            const val = parseInt(this.getAttribute('data-value'));
            window.__selectedRating = val;

            stars.forEach((s, idx) => {
                if (idx < val) {
                    s.classList.replace('text-slate-200', 'text-amber-400');
                } else {
                    s.classList.replace('text-amber-400', 'text-slate-200');
                }
            });
            updateRatingLabel(val);
        });
    });
}

// Global Back Function
function goBack() {
    window.history.back();
}

// Run Initializer
window.addEventListener('DOMContentLoaded', () => {
    initializeStars();
    updateRatingLabel(0);
    setupReviewFeatures();
});