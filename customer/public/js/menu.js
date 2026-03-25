const initialMenuItems = [
    { id: 1, name: 'Pad Thai', price: 80, category: 'Main Dish', stock: 10 },
    { id: 2, name: 'Cheeseburger', price: 120, category: 'Main Dish', stock: 5 },
    { id: 3, name: 'Greek Salad', price: 90, category: 'Main Dish', stock: 8 },
    { id: 4, name: 'Caesar Salad', price: 95, category: 'Main Dish', stock: 7 },
    { id: 5, name: 'Margherita Pizza', price: 180, category: 'Main Dish', stock: 4 },
    { id: 6, name: 'Spaghetti Carbonara', price: 150, category: 'Main Dish', stock: 6 },
    { id: 7, name: 'Sushi Platter', price: 250, category: 'Main Dish', stock: 3 },
    { id: 8, name: 'Chicken Curry', price: 110, category: 'Main Dish', stock: 9 },
    { id: 9, name: 'Tom Yum Goong', price: 130, category: 'Main Dish', stock: 5 },
    { id: 10, name: 'Massaman Curry', price: 130, category: 'Main Dish', stock: 6 },
    { id: 11, name: 'Papaya Salad', price: 70, category: 'Main Dish', stock: 15 },
    { id: 12, name: 'Fried Rice', price: 60, category: 'Main Dish', stock: 20 },
    { id: 13, name: 'Pepperoni Pizza', price: 200, category: 'Main Dish', stock: 4 },
    { id: 14, name: 'Garlic Bread', price: 50, category: 'Main Dish', stock: 12 },
    { id: 15, name: 'Steamed Rice', price: 20, category: 'Main Dish', stock: 30 },
    { id: 16, name: 'Iced Tea', price: 40, category: 'Drink', stock: 25 },
    { id: 17, name: 'Lemonade', price: 45, category: 'Drink', stock: 20 },
    { id: 18, name: 'Thai Iced Tea', price: 50, category: 'Drink', stock: 15 },
    { id: 19, name: 'Green Tea', price: 40, category: 'Drink', stock: 25 },
    { id: 20, name: 'Soda', price: 25, category: 'Drink', stock: 40 }
];


let inventory = JSON.parse(localStorage.getItem('kitchen_inventory')) || initialMenuItems;
let cart = JSON.parse(localStorage.getItem('kitchen_cart')) || [];
let currentFilter = 'all';

function renderMenu(filter = 'all', search = '') {
    const grid = document.getElementById('menu-grid');
    currentFilter = filter;
    // ค้นหาเมนู
    const filtered = inventory.filter(item => {
        const matchesCat = filter === 'all' || item.category === filter;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    grid.innerHTML = filtered.map(item => {
        const isOut = item.stock <= 0;
        return `
        <div class="card bg-base-100 border border-base-300 shadow-sm ${isOut ? 'opacity-50' : ''}">
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-sm leading-tight">${item.name}</h3>
                    <span class="text-warning font-bold text-sm">${item.price}฿</span>
                </div>
                <div class="flex justify-between items-center mt-4">
                    <span class="text-[10px] uppercase font-bold ${item.stock < 3 ? 'text-error' : 'opacity-40'}">
                        Stock: ${item.stock}
                    </span>
                    <button onclick="addToCart(${item.id})" 
                        class="btn btn-xs btn-warning ${isOut ? 'btn-disabled' : ''}" 
                        ${isOut ? 'disabled' : ''}>
                        ${isOut ? 'Sold Out' : '+ Add'}
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
    updateUI();
}

function addToCart(id) {
    const idx = inventory.findIndex(i => i.id === id);
    if (inventory[idx].stock > 0) {
        inventory[idx].stock--;
        const itemToAdd = { ...inventory[idx], cartId: Date.now() };
        cart.push(itemToAdd);
        save();
        renderMenu(currentFilter, document.getElementById('searchInput').value);
    }
}
// แยกประเภท
function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.toggle('btn-warning', btn.dataset.cat === cat);
        btn.classList.toggle('btn-outline', btn.dataset.cat !== cat);
    });
    renderMenu(cat, document.getElementById('searchInput').value);
}

document.getElementById('searchInput').oninput = (e) => renderMenu(currentFilter, e.target.value);

function save() {
    localStorage.setItem('kitchen_cart', JSON.stringify(cart));
    localStorage.setItem('kitchen_inventory', JSON.stringify(inventory));
}

function updateUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-price').innerText = total + " THB";
    document.getElementById('cart-count').innerText = cart.length;
}

window.onload = () => renderMenu();