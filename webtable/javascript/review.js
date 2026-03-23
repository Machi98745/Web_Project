let currentRating = 0;

function setStar(n) {
    currentRating = n;
    document.querySelectorAll('.star').forEach((s, i) => {
        if(i < n) {
            s.classList.add('text-warning', 'opacity-100');
            s.style.textShadow = "0 0 15px rgba(251, 189, 35, 0.4)";
        } else {
            s.classList.remove('text-warning', 'opacity-100');
            s.style.textShadow = "none";
        }
    });
}

function submitReview() {
    if(currentRating === 0) return alert("Please select a rating!");
    const comment = document.getElementById('comment').value;
    console.log("Review:", currentRating, "Stars", "Comment:", comment);
    
    alert("Thank you! Visit Kitchen Station again.");
    localStorage.removeItem('kitchen_cart');
    localStorage.removeItem('kitchen_order_placed');
    location.href = 'menu.html';
}