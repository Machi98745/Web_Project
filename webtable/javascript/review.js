let currentRating = 0;

function setStar(n) {
    currentRating = n;
    // Update visual stars
    document.querySelectorAll('.star').forEach((s, i) => {
        if(i < n) {
            s.classList.add('text-warning', 'opacity-100');
            s.classList.remove('opacity-20');
        } else {
            s.classList.remove('text-warning', 'opacity-100');
            s.classList.add('opacity-20');
        }
    });
}

function submitReview() {
    // 1. Safety Check: Must have a rating
    if(currentRating === 0) return alert("Please select a rating!");
    
    // 2. Gather Data Safely (using || to prevent crashes)
    const cart = JSON.parse(localStorage.getItem('kitchen_cart')) || [];
    const table = localStorage.getItem('kitchen_table') || "00";
    const userId = localStorage.getItem('kitchen_user_id') || "Guest";
    const commentInput = document.getElementById('comment');
    const commentText = commentInput ? commentInput.value : "";

    // 3. Create History Entry
    const historyEntry = {
        userId: userId,
        table: table,
        total: cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
        rating: currentRating,
        comment: commentText,
        date: new Date().toLocaleString(),
        items: cart.map(i => `${i.name} x${i.quantity || 1}`)
    };

    // 4. Save to Persistent History
    let history = JSON.parse(localStorage.getItem('kitchen_history')) || [];
    history.push(historyEntry);
    localStorage.setItem('kitchen_history', JSON.stringify(history));

    // 5. REQUIREMENT: LOCK SYSTEM (Cannot order after paid)
    localStorage.setItem('kitchen_is_paid', 'true');

    // 6. CLEANUP SESSION (Everything except History and Table #)
    localStorage.removeItem('kitchen_cart');
    localStorage.removeItem('kitchen_order_placed');
    localStorage.removeItem('kitchen_order_time');
    localStorage.removeItem('kitchen_active_dishes');

    alert("Payment Successful! Your review has been saved.");
    
    // 7. REQUIREMENT: BACK TO LOGIN
    location.href = 'login.html';
}