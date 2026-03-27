const initialMenuItems = [
    { id: 1, name: 'Pad Thai', price: 80, category: 'Main Dish' },
    { id: 2, name: 'Cheeseburger', price: 120, category: 'Main Dish' },
    { id: 3, name: 'Greek Salad', price: 90, category: 'Main Dish' },
    { id: 4, name: 'Caesar Salad', price: 95, category: 'Main Dish' },
    { id: 5, name: 'Margherita Pizza', price: 180, category: 'Main Dish' },
    { id: 6, name: 'Spaghetti Carbonara', price: 150, category: 'Main Dish' },
    { id: 7, name: 'Sushi Platter', price: 250, category: 'Main Dish' },
    { id: 8, name: 'Chicken Curry', price: 110, category: 'Main Dish' },
    { id: 9, name: 'Tom Yum Goong', price: 130, category: 'Main Dish' },
    { id: 10, name: 'Massaman Curry', price: 130, category: 'Main Dish' },
    { id: 11, name: 'Papaya Salad', price: 70, category: 'Main Dish' },
    { id: 12, name: 'Fried Rice', price: 60, category: 'Main Dish' },
    { id: 13, name: 'Pepperoni Pizza', price: 200, category: 'Main Dish' },
    { id: 14, name: 'Garlic Bread', price: 50, category: 'Main Dish' },
    { id: 15, name: 'Steamed Rice', price: 20, category: 'Main Dish' },
    { id: 16, name: 'Iced Tea', price: 40, category: 'Drink' },
    { id: 17, name: 'Lemonade', price: 45, category: 'Drink' },
    { id: 18, name: 'Thai Iced Tea', price: 50, category: 'Drink' },
    { id: 19, name: 'Green Tea', price: 40, category: 'Drink' },
    { id: 20, name: 'Soda', price: 25, category: 'Drink' }
];

// 2. Initialize Cart from LocalStorage
let cart = JSON.parse(localStorage.getItem('kitchen_cart')) || [];

// 3. The Main Render Function
function renderMenu(searchTerm = "") {
    const grid = document.getElementById('menu-grid');
    const isPaid = localStorage.getItem('kitchen_is_paid') === 'true';

    // Filter logic
    const filtered = initialMenuItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If no items match search
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-2 text-center py-20 opacity-40">
                <p class="text-3xl mb-2">🔎</p>
                <p>No dishes found for "${searchTerm}"</p>
            </div>`;
        return;
    }

    // Generate HTML for Cards
    grid.innerHTML = filtered.map(item => `
        <div class="card bg-slate-800 border border-slate-700 shadow-lg transition-transform active:scale-95">
            <div class="p-4 flex flex-col h-full justify-between">
                <div>
                    <h3 class="font-bold text-sm text-white mb-1 leading-tight">${item.name}</h3>
                    <p class="text-warning font-bold text-xs">${item.price}฿</p>
                </div>
                <button onclick="addToCart(${item.id})" 
                    class="btn btn-xs btn-warning rounded-full mt-4 font-bold"
                    ${isPaid ? 'disabled' : ''}>
                    ${isPaid ? '🔒 Locked' : '+ Add'}
                </button>
            </div>
        </div>
    `).join('');

    updateUI();
}

// 4. Add to Cart Logic
function addToCart(id) {
    if (localStorage.getItem('kitchen_is_paid') === 'true') {
        return alert("This table is locked. Please log in again for a new session.");
    }

    const item = initialMenuItems.find(i => i.id === id);
    const existing = cart.find(c => c.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem('kitchen_cart', JSON.stringify(cart));
    updateUI();
}

// 5. Update Labels and Tracker
function updateUI() {
    const tableDisplay = document.getElementById('display-table');
    const cartCountDisplay = document.getElementById('cart-count');
    const tracker = document.getElementById('mini-tracker');

    if (tableDisplay) tableDisplay.innerText = localStorage.getItem('kitchen_table') || "00";
    if (cartCountDisplay) cartCountDisplay.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);

    const orderPlaced = localStorage.getItem('kitchen_order_placed') === 'true';
    if (tracker) {
        orderPlaced ? tracker.classList.remove('hidden') : tracker.classList.add('hidden');
    }
}

// 6. Setup Search Bar Listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderMenu(e.target.value);
        });
    }
    // INITIAL LOAD
    renderMenu(); 
});