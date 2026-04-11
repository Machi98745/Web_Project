let cart = JSON.parse(sessionStorage.getItem('kitchen_cart')) || [];

function saveCart() {
    sessionStorage.setItem('kitchen_cart', JSON.stringify(cart));
}

function renderCart() {
    const list = document.getElementById('cart-list');
    const orderBtn = document.getElementById('order-btn');
    const totalPriceDisplay = document.getElementById('cart-total-price'); // เพิ่มตัวแปรนี้
    
    if (!list) return; 
    
    if (cart.length === 0) {
        list.innerHTML = `<div class="text-center py-20 opacity-30 italic">Tray is empty</div>`;
        if (orderBtn) orderBtn.disabled = true;
        if (totalPriceDisplay) totalPriceDisplay.innerText = "0฿";
        sessionStorage.removeItem('kitchen_cart');
        return;
    }

    if (orderBtn) orderBtn.disabled = false;
    list.innerHTML = cart.map((item, index) => `
    <div class="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
        <div class="flex flex-col">
            <span class="font-bold text-slate-800 tracking-tight">${item.name}</span>
            <span class="text-amber-500 font-black text-sm">${item.price}฿</span>
        </div>
        <button onclick="removeItem(${index})" class="btn btn-circle btn-ghost btn-sm text-slate-300 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
`).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
const displayTotal = document.getElementById('display-total');
if (displayTotal) {
    displayTotal.innerHTML = `${total}<span class="text-amber-400 ml-1">฿</span>`;
}
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

if (document.getElementById('order-btn')) {
    document.getElementById('order-btn').onclick = async () => {
        if (sessionStorage.getItem('has_paid') === 'true') {
            Swal.fire({
                title: 'Session Expired',
                text: 'You have already paid for this session. Please log in again for a new order.',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                window.location.href = '/customer/view/login.html';
            });
            return;
        }

        const customerId = sessionStorage.getItem('customerId');
        
        if (!customerId) {
            Swal.fire({
                title: 'Not Logged In',
                text: 'Please log in again.',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                window.location.href = '/customer/view/login.html';
            });
            return;
        }

        Swal.fire({
            title: 'Confirm purchase',
            text: 'Do you want to place this order?',
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#dc2626'
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                const res = await fetch('/customer/place-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerId: customerId,
                        items: cart
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    let orderHistory = JSON.parse(sessionStorage.getItem('allOrderIds')) || [];
                    orderHistory.push(data.orderId);
                    sessionStorage.setItem('allOrderIds', JSON.stringify(orderHistory));
                    sessionStorage.removeItem('kitchen_cart'); 
                    location.href = 'status.html';
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Order Failed',
                        text: 'Failed to place order. Check server console.',
                        confirmButtonColor: '#3085d6'
                    });
                }
            } catch (e) {
                console.error("Order error:", e);
                Swal.fire({
                    icon: 'error',
                    title: 'Order Failed',
                    text: 'An unexpected error occurred.',
                    confirmButtonColor: '#3085d6'
                });
            }
        });
    };
}

window.onload = renderCart;
