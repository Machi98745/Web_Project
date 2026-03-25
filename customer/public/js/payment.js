function renderPayment() {
    const cart = JSON.parse(localStorage.getItem('kitchen_cart')) || [];
    const summary = document.getElementById('bill-summary');
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    summary.innerHTML = cart.map(item => `
        <div class="flex justify-between py-2 border-b border-base-300 opacity-70 text-sm">
            <span>${item.name}</span>
            <span>${item.price}฿</span>
        </div>
    `).join('');

    document.getElementById('grand-total').innerText = total + "฿";
}

window.onload = renderPayment;