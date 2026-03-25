// Auth
const cookName = sessionStorage.getItem('cookName') || 'Cook';
document.getElementById('cookName').textContent = cookName;

function logout() {
    sessionStorage.clear();
    window.location.href = '/cook/view/login.html';
}


// Drink detection
const DRINK_KEYWORDS = ['tea', 'coffee', 'lemonade', 'soda', 'juice', 'water', 'smoothie', 'shake', 'cola', 'iced'];

function isDrink(itemName) {
    const lower = itemName.toLowerCase();
    return DRINK_KEYWORDS.some(kw => lower.includes(kw));
}


// Raw order data
const rawOrders = [
    {
        id: 'ORD-036', table: 'Table 5', time: '10:42',
        items: ['🍜 Pad Thai', '🍔 Cheeseburger', '🥗 Greek Salad', '🍹 Iced Tea']
    },
    {
        id: 'ORD-035', table: 'Table 3', time: '10:39',
        items: ['🥗 Caesar Salad', '🍕 Margherita Pizza', '🍝 Spaghetti Carbonara', '🥤 Lemonade']
    },
    {
        id: 'ORD-034', table: 'Table 1', time: '10:50',
        items: ['🍣 Sushi Platter', '🍛 Chicken Curry', '🥖 Garlic Bread', '🍹 Thai Iced Tea']
    },
    {
        id: 'ORD-033', table: 'Table 6', time: '10:55',
        items: ['🍲 Tom Yum Goong', '🍚 Steamed Rice', '🥤 Green Tea']
    },
    {
        id: 'ORD-032', table: 'Table 8', time: '11:00',
        items: ['🍛 Massaman Curry', '🥗 Papaya Salad', '🥤 Soda']
    },
];


// Split items: one card per food, one grouped card for drinks 
function buildItemCards(orders) {
    const cards = [];

    for (const order of orders) {
        const foodItems  = order.items.filter(item => !isDrink(item));
        const drinkItems = order.items.filter(item =>  isDrink(item));

        for (const item of foodItems) {
            cards.push({
                orderId:  order.id,
                table:    order.table,
                time:     order.time,
                type:     'food',
                label:    item,
                status:   'pending',
            });
        }

        if (drinkItems.length > 0) {
            cards.push({
                orderId:  order.id,
                table:    order.table,
                time:     order.time,
                type:     'drink',
                label:    drinkItems.join(', '),
                items:    drinkItems,
                status:   'pending',
            });
        }
    }

    return cards;
}

const itemCards = buildItemCards(rawOrders);


// Confirm modal
let pendingAdvanceIndex = null;

function askAdvance(index) {
    pendingAdvanceIndex = index;

    const card = itemCards[index];
    const nextLabel = card.status === 'pending' ? 'Cooking' : 'Served';

    document.getElementById('modal-item').textContent  = card.type === 'drink' ? '🥤 ' + card.label : card.label;
    document.getElementById('modal-order').textContent = `${card.orderId} · ${card.table}`;
    document.getElementById('modal-next').textContent  = nextLabel;
    document.getElementById('confirmModal').classList.remove('hidden');
}

function confirmAdvance() {
    if (pendingAdvanceIndex === null) return;

    const card = itemCards[pendingAdvanceIndex];
    pendingAdvanceIndex = null;

    if (card.status === 'pending') {
        card.status = 'cooking';
        closeModal();
        setTab('cooking');
    } else if (card.status === 'cooking') {
        card.status = 'serving';
        closeModal();
        setTab('serving');
    }
}

function closeModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    pendingAdvanceIndex = null;
}


// Build card HTML
function buildActionBtn(card, index) {
    if (card.status === 'pending') {
        return `<button onclick="askAdvance(${index})" class="bg-green-700 text-white px-4 py-1.5 rounded-full text-sm font-medium">Start Cooking</button>`;
    }
    if (card.status === 'cooking') {
        return `<button onclick="askAdvance(${index})" class="bg-yellow-400 text-white px-4 py-1.5 rounded-full text-sm font-medium">Mark as Done</button>`;
    }
    return `<span class="text-green-700 font-semibold text-sm">✔ Served</span>`;
}

function buildCardHTML(card, index) {
    const badge = card.type === 'drink'
        ? `<span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">🥤 Drinks</span>`
        : `<span class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">🍽 Food</span>`;

    const itemDisplay = card.type === 'drink'
        ? card.items.map(d => `<p>${d}</p>`).join('')
        : `<p class="font-medium text-gray-800">${card.label}</p>`;

    return `
        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-start">
                <div>
                    <span class="font-semibold text-gray-800">${card.orderId}</span>
                </div>
                <span class="text-sm text-gray-400">${card.time}</span>
            </div>
            <div class="flex items-center gap-2 mt-1">
                <span class="text-sm text-gray-500">${card.table}</span>
                ${badge}
            </div>
            <div class="mt-2 text-sm space-y-0.5 text-gray-700">${itemDisplay}</div>
            <div class="flex justify-end mt-3">${buildActionBtn(card, index)}</div>
        </div>
    `;
}


// Render
function renderCards() {
    const list = document.getElementById('orderList');
    const visible = itemCards.filter(card => card.status === currentTab);

    if (visible.length === 0) {
        list.innerHTML = `<p class="text-center text-gray-400 text-sm mt-10">ไม่มีรายการ</p>`;
        return;
    }

    list.innerHTML = visible.map(card => {
        const index = itemCards.indexOf(card);
        return buildCardHTML(card, index);
    }).join('');
}


// Tabs
let currentTab = 'pending';

function setTab(tab) {
    currentTab = tab;

    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('bg-green-700', 'text-white');
        t.classList.add('bg-gray-200', 'text-gray-600');
    });

    const active = document.getElementById('tab-' + tab);
    active.classList.add('bg-green-700', 'text-white');
    active.classList.remove('bg-gray-200', 'text-gray-600');

    renderCards();
}


// Init
setTab('pending');