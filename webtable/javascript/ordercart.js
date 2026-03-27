// Load data from localStorage
let cart = JSON.parse(localStorage.getItem('kitchen_cart')) || [];

function renderCart() {
    const list = document.getElementById('cart-list');
    const orderBtn = document.getElementById('order-btn');
    
    // 1. If cart is empty, show empty state
    if (cart.length === 0) {
        list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 opacity-30 italic">
                <span class="text-6xl mb-4">🍽️</span>
                <p>Your tray is empty</p>
                <button onclick="location.href='menu.html'" class="btn btn-ghost btn-sm mt-4 text-warning underline">Go add some food!</button>
            </div>`;
        if(orderBtn) {
            orderBtn.innerHTML = "Confirm & Place Order";
            orderBtn.disabled = true;
        }
        return;
    }

    // 2. Enable Order Button and Calculate Total
    if(orderBtn) orderBtn.disabled = false;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if(orderBtn) orderBtn.innerHTML = `Confirm & Place Order (${total}฿)`;

    // 3. Render Items with Quantity
    list.innerHTML = cart.map((item, index) => `
        <div class="flex justify-between items-center p-4 bg-base-200 rounded-xl border border-base-300 shadow-sm">
            <div>
                <p class="font-bold text-white">${item.name} <span class="text-warning ml-2">x${item.quantity}</span></p>
                <p class="opacity-50 text-xs">${item.price * item.quantity}฿</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="removeOne(${index})" class="btn btn-circle btn-ghost btn-sm text-error hover:bg-error/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// FIX: Remove only one quantity at a time
function removeOne(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    
    // Save updated cart
    localStorage.setItem('kitchen_cart', JSON.stringify(cart));
    renderCart();
}

// FIX: Handling the Order Confirmation
document.getElementById('order-btn').onclick = () => {
    if (cart.length === 0) return;

    // Requirement: Setup Individual Dish Tracking
    let dishList = [];
    cart.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            dishList.push({
                name: item.name,
                status: 'Pending',
                startTime: Date.now() + (dishList.length * 3000) // Stagger dishes by 3 seconds
            });
        }
    });

    // Save for the Tracker
    localStorage.setItem('kitchen_active_dishes', JSON.stringify(dishList));
    localStorage.setItem('kitchen_order_placed', 'true');
    localStorage.setItem('kitchen_order_time', Date.now().toString());
    
    // Go to Status page
    location.href = 'status.html';
};

// Initial Load
window.onload = renderCart;