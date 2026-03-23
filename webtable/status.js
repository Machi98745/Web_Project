function initStatus() {
    const orderPlaced = localStorage.getItem('kitchen_order_placed') === 'true';
    const cart = JSON.parse(localStorage.getItem('kitchen_cart')) || [];
    
    const statusHeading = document.getElementById('status-heading');
    const statusText = document.getElementById('status-text');
    const billBtn = document.getElementById('bill-btn');
    const steps = [
        document.getElementById('step-0'),
        document.getElementById('step-1'),
        document.getElementById('step-2')
    ];

    // Check if there is actually an order to track
    if (!orderPlaced || cart.length === 0) {
        statusHeading.innerText = "No Active Order";
        statusText.innerText = "You haven't placed an order yet.";
        statusText.classList.replace('text-warning', 'text-error');
        billBtn.innerText = "Go to Menu";
        billBtn.disabled = false;
        billBtn.onclick = () => location.href = 'menu.html';
        return;
    }


    steps[0].classList.add('step-warning');
    statusText.innerText = "Kitchen has received your request.";

    setTimeout(() => {
        steps[1].classList.add('step-warning');
        statusText.innerText = "Chef is currently cooking your meal! 🔥";
    }, 3000);

    setTimeout(() => {
        steps[2].classList.add('step-warning');
        
        statusText.innerText = "Your meal is finished and served! ✨";
        statusText.classList.replace('text-warning', 'text-success');
        billBtn.disabled = false;
        billBtn.innerText = "Request Bill & Pay";
        billBtn.classList.replace('btn-neutral', 'btn-warning');
        billBtn.classList.add('shadow-lg', 'animate-bounce');
        
        billBtn.onclick = () => {
            location.href = 'payment.html';
        };
    }, 8000);
}

window.onload = initStatus;