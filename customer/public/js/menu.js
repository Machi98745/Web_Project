let inventory = [];
let cart = JSON.parse(sessionStorage.getItem('kitchen_cart')) || [];
let currentFilter = 'all';

async function loadMenu() {
    try {
        const res = await fetch('/customer/menu-data');
        if (res.ok) {
            inventory = await res.json();
            renderMenu();
        }
    } catch (e) {
        console.error("Failed to load menu", e);
    }
}

function renderMenu(filter = 'all', search = '') {
    const grid = document.getElementById('menu-grid');
    currentFilter = filter;

    const filtered = inventory.filter(item => {
        const isDrink = item.menu_id >= 2000;
        const matchesCat = filter === 'all' || 
                          (filter === 'Drink' && isDrink) || 
                          (filter === 'Main Dish' && !isDrink);
        
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCat && matchesSearch;
    });

    grid.innerHTML = filtered.map(item => {
    const isOut = item.status === 'disable';
    return `
    <div class="card bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden ${isOut ? 'opacity-50' : ''}">
        <div class="p-4 flex flex-col h-full">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-slate-800 leading-tight">${item.name}</h3>
            </div>
            <div class="mt-auto">
                <p class="text-amber-500 font-black mb-3">${item.price}฿</p>
                <button onclick="addToCart(${item.menu_id})" 
                    class="btn btn-sm w-full bg-slate-100 hover:bg-amber-400 border-none text-slate-600 hover:text-black font-bold rounded-xl transition-all"
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
    const item = inventory.find(i => i.menu_id === id);
    if (item) {
        const itemToAdd = { ...item, cartId: Date.now() };
        cart.push(itemToAdd);
        save();
        updateUI();
    }
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        const isMatch = (cat === 'all' && btn.innerText === 'All') || 
                        (cat === 'Main Dish' && btn.innerText === 'Main Dish') ||
                        (cat === 'Drink' && btn.innerText === 'Drinks');
        
        if (isMatch) {
            btn.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');
            btn.classList.add('bg-green-600', 'text-white');
        } else {
            btn.classList.remove('bg-green-600', 'text-white');
            btn.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
        }
    });
    renderMenu(cat, document.getElementById('searchInput').value);
}

document.getElementById('searchInput').oninput = (e) => renderMenu(currentFilter, e.target.value);

function save() {
    sessionStorage.setItem('kitchen_cart', JSON.stringify(cart));
}

function updateUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('total-price').innerText = total + " THB";
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = cart.length;
}
function checkActiveOrder() {
    const orderIds = JSON.parse(sessionStorage.getItem('allOrderIds')) || [];
    const statusBtn = document.querySelector('.fixed.top-4.right-4'); // อ้างอิงปุ่มลอย
    
    if (statusBtn) {
        if (orderIds.length > 0) {
            statusBtn.classList.remove('hidden');
        } else {
            statusBtn.classList.add('hidden');
        }
    }
}

window.addEventListener('load', checkActiveOrder);

window.onload = loadMenu;