async function checkAllOrdersStatus() {
    const tableNo = sessionStorage.getItem('tableNumber') || '--';
    const orderIds = JSON.parse(sessionStorage.getItem('allOrderIds')) || [];
    
    if (document.getElementById('table-number')) 
        document.getElementById('table-number').innerText = `#${tableNo}`;
    
    if (document.getElementById('order-id')) 
        document.getElementById('order-id').innerText = orderIds.length > 0 ? orderIds.join(', ') : 'No Active Order';

    const container = document.getElementById('dish-status-container');
    
    if (orderIds.length === 0) {
        container.innerHTML = `<p class="text-center text-slate-300 py-10 italic">No active orders</p>`;
        return;
    }

    try {
        const responses = await Promise.all(
            orderIds.map(id => fetch(`/customer/order-status/${id}`).then(r => r.json()))
        );

        const allItems = responses.flat();

        container.innerHTML = allItems.map(item => {
            let statusBadge = "bg-slate-100 text-slate-400";
            let statusText = item.status;

            if (item.status === 'cooking') {
                statusBadge = "bg-amber-100 text-amber-600";
            } else if (item.status === 'serving') {
                statusBadge = "bg-green-100 text-green-600";
                statusText = "Ready";
            }

            return `
            <div class="flex justify-between items-center p-4 bg-white rounded-2xl mb-3 border border-slate-200 shadow-sm animate-in fade-in">
                <div class="text-left">
                    <p class="font-bold text-slate-800 tracking-tight">${item.name}</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity: ${item.quantity}</p>
                </div>
                <span class="px-3 py-1 rounded-full ${statusBadge} uppercase font-black text-[9px] tracking-tighter">
                    ${statusText}
                </span>
            </div>`;
        }).join('');

        const isAllServed = allItems.every(item => item.status === 'serving');
        const billBtn = document.getElementById('bill-btn');

        if (isAllServed && allItems.length > 0) {
            billBtn.disabled = false;
            billBtn.className = "btn btn-lg w-full bg-amber-400 hover:bg-amber-500 border-none text-black font-black text-lg rounded-2xl shadow-xl shadow-amber-100 transition-all active:scale-95";
            billBtn.innerText = "Proceed to Payment ➔";
            billBtn.onclick = () => { window.location.href = 'payment.html'; };
        } else {
            billBtn.disabled = true;
            billBtn.className = "btn btn-lg w-full bg-slate-100 border-none text-slate-300 font-bold rounded-2xl cursor-not-allowed";
            billBtn.innerText = "Kitchen is preparing...";
        }

    } catch (e) {
        console.error("Polling error:", e);
    }
}

setInterval(checkAllOrdersStatus, 3000);
window.onload = checkAllOrdersStatus;