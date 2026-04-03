let grandTotal = 0; 

async function renderPayment() {
    const orderIds = JSON.parse(sessionStorage.getItem('allOrderIds')) || [];
    const summary = document.getElementById('bill-summary');
    const totalDisplay = document.getElementById('grand-total');

    if (orderIds.length === 0) {
        summary.innerHTML = "<p class='text-center text-slate-300 italic py-10'>No orders found.</p>";
        return;
    }

    try {
        const responses = await Promise.all(
            orderIds.map(id => fetch(`/customer/order-status/${id}`).then(r => r.json()))
        );
        const allItems = responses.flat();

        grandTotal = 0;
        summary.innerHTML = allItems.map(item => {
            const itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;
            return `
                <div class="flex justify-between py-3 border-b border-slate-50 text-sm">
                    <div class="flex flex-col">
                        <span class="font-bold text-slate-700">${item.name}</span>
                        <span class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Qty: ${item.quantity}</span>
                    </div>
                    <span class="font-black text-slate-600">${itemTotal}฿</span>
                </div>`;
        }).join('');
        totalDisplay.innerHTML = `${grandTotal}<span class="text-amber-400 ml-1">฿</span>`;
        localStorage.setItem('temp_final_amount', grandTotal);
        
    } catch (e) {
        console.error("Error loading combined bill:", e);
        summary.innerHTML = "<p class='text-red-500 font-bold text-center'>Failed to load bill details.</p>";
    }
}

async function processPayment() {
    const orderIds = JSON.parse(sessionStorage.getItem('allOrderIds')) || [];
    const customerId = sessionStorage.getItem('customerId');

    if (orderIds.length === 0) return alert("No orders to pay.");

    try {
        const res = await fetch('/customer/complete-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: customerId,
                orderIds: orderIds, 
                totalPrice: grandTotal
            })
        });

        if (res.ok) {
            localStorage.setItem('last_paid_amount', grandTotal);
            alert("Payment Successful! Thank you.");
            window.location.href = 'review.html';
        }
    } catch (e) {
        console.error("Payment Error:", e);
        alert("Payment failed. Please contact staff.");
    }
}

renderPayment();