let cart = JSON.parse(localStorage.getItem('kitchen_cart')) || [];
let inventory = JSON.parse(localStorage.getItem('kitchen_inventory')) || [];

function renderCart() {
    const list = document.getElementById('cart-list');
    const orderBtn = document.getElementById('order-btn');

    if (cart.length === 0) {
        list.innerHTML = `<div class="text-center py-20 opacity-30 italic">Tray is empty</div>`;
        orderBtn.disabled = true;
        return;
    }

    orderBtn.disabled = false;
    list.innerHTML = cart.map((item, index) => `
        <div class="flex justify-between items-center p-4 bg-base-200 rounded-xl border border-base-300">
            <div>
                <p class="font-bold">${item.name}</p>
                <p class="text-warning text-xs">${item.price}฿</p>
            </div>
            <button onclick="removeItem(${index})" class="btn btn-circle btn-ghost btn-sm text-error text-xl">✕</button>
        </div>
    `).join('');
}

function removeItem(index) {
    const item = cart[index];
    // Return stock
    const invIdx = inventory.findIndex(i => i.id === item.id);
    if (invIdx !== -1) inventory[invIdx].stock++;
    
    cart.splice(index, 1);
    localStorage.setItem('kitchen_cart', JSON.stringify(cart));
    localStorage.setItem('kitchen_inventory', JSON.stringify(inventory));
    renderCart();
}

document.getElementById('order-btn').onclick = () => {
    localStorage.setItem('kitchen_order_placed', 'true');
    location.href = 'status.html';
};

window.onload = renderCart;