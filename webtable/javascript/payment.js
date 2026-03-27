function renderPayment() {
    const cart = JSON.parse(localStorage.getItem('kitchen_cart')) || [];
    const summary = document.getElementById('bill-summary');
    
    // Calculate total based on quantity
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    summary.innerHTML = cart.map(item => `
        <div class="flex justify-between py-2 border-b border-base-300 opacity-70 text-sm">
            <span>${item.name} x${item.quantity}</span>
            <span>${item.price * item.quantity}฿</span>
        </div>
    `).join('');

    document.getElementById('grand-total').innerText = total + "฿";
}

window.onload = renderPayment;  