// ─── Auth ────────────────────────────────────────────────────────────────────
const cookName = sessionStorage.getItem('cookName') || 'Cook';
document.getElementById('cookName').textContent = cookName;

function logout() {
    sessionStorage.clear();
    window.location.href = '/cook/view/login.html';
}

// ─── Drink keywords (ใช้ตรวจว่า item ไหนเป็นเครื่องดื่ม) ─────────────────────
const DRINK_KEYWORDS = ['tea', 'coffee', 'lemonade', 'soda', 'juice', 'water', 'smoothie', 'shake', 'cola', 'iced'];

function isDrink(itemName) {
    const lower = itemName.toLowerCase();
    return DRINK_KEYWORDS.some(kw => lower.includes(kw));
}

// ─── Raw order data ───────────────────────────────────────────────────────────
// แต่ละ order มีหลาย items — เราจะแยก card ต่อ item (ยกเว้นเครื่องดื่มรวมกลุ่มไว้)
const rawOrders = [
    {
        id: 'ORD-036', customer: 'John', table: 'Table 5', time: '10:42',
        items: ['🍜 Pad Thai', '🍔 Cheeseburger', '🥗 Greek Salad', '🍹 Iced Tea']
    },
    {
        id: 'ORD-035', customer: 'Sarah', table: 'Table 3', time: '10:39',
        items: ['🥗 Caesar Salad', '🍕 Margherita Pizza', '🍝 Spaghetti Carbonara', '🥤 Lemonade']
    },
    {
        id: 'ORD-034', customer: 'Alex', table: 'Table 1', time: '10:50',
        items: ['🍣 Sushi Platter', '🍛 Chicken Curry', '🥖 Garlic Bread', '🍹 Thai Iced Tea']
    },
    {
        id: 'ORD-033', customer: 'Lily', table: 'Table 6', time: '10:55',
        items: ['🍲 Tom Yum Goong', '🍚 Steamed Rice', '🥤 Green Tea']
    },
    {
        id: 'ORD-032', customer: 'David', table: 'Table 8', time: '11:00',
        items: ['🍛 Massaman Curry', '🥗 Papaya Salad', '🥤 Soda']
    },
];

// ─── Build item cards from raw orders ────────────────────────────────────────
// แต่ละ order จะถูกแยกเป็น:
//   - 1 card ต่อ food item
//   - 1 card รวมสำหรับเครื่องดื่มทั้งหมดในออเดอร์นั้น (ถ้ามี)

function buildItemCards(orders) {
    const cards = [];

    orders.forEach(order => {
        const foodItems = order.items.filter(item => !isDrink(item.replace(/^[\p{Emoji}\s]+/u, '')));
        const drinkItems = order.items.filter(item => isDrink(item.replace(/^[\p{Emoji}\s]+/u, '')));

        // food: 1 card per item
        foodItems.forEach(item => {
            cards.push({
                orderId: order.id,
                customer: order.customer,
                table: order.table,
                time: order.time,
                type: 'food',
                label: item,
                status: 'pending',
            });
        });

        // drinks: 1 grouped card
        if (drinkItems.length > 0) {
            cards.push({
                orderId: order.id,
                customer: order.customer,
                table: order.table,
                time: order.time,
                type: 'drink',
                label: drinkItems.join(', '),
                items: drinkItems,
                status: 'pending',
            });
        }
    });

    return cards;
}

// ─── State ────────────────────────────────────────────────────────────────────
const itemCards = buildItemCards(rawOrders);

// ─── Render ───────────────────────────────────────────────────────────────────
function renderCards() {
    const list = document.getElementById('orderList');

    const visibleCards = itemCards.filter(card => card.status === currentTab);

    if (visibleCards.length === 0) {
        list.innerHTML = `<p class="text-center text-gray-400 text-sm mt-10">No items here</p>`;
        return;
    }

    list.innerHTML = visibleCards.map((card, i) => {
        const isDrinkCard = card.type === 'drink';
        const cardIndex = itemCards.indexOf(card);

        const actionBtn = () => {
            if (card.status === 'pending') {
                return `<button onclick="advance(${cardIndex})" class="bg-green-700 text-white px-4 py-1.5 rounded-full text-sm font-medium">Start</button>`;
            } else if (card.status === 'cooking') {
                return `<button onclick="advance(${cardIndex})" class="bg-yellow-400 text-white px-4 py-1.5 rounded-full text-sm font-medium">Cooking…</button>`;
            } else {
                return `<span class="text-green-700 font-semibold text-sm">✔ Done</span>`;
            }
        };

        const categoryBadge = isDrinkCard
            ? `<span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">🥤 Drinks</span>`
            : `<span class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">🍽 Food</span>`;

        const itemDisplay = isDrinkCard
            ? `<div class="mt-2 text-sm space-y-0.5">${card.items.map(d => `<p>${d}</p>`).join('')}</div>`
            : `<p class="mt-2 text-base font-medium text-gray-800">${card.label}</p>`;

        return `
            <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="font-semibold text-gray-800">${card.customer}</span>
                        <span class="text-xs text-gray-400 font-normal ml-1">${card.orderId}</span>
                    </div>
                    <span class="text-sm text-gray-400">${card.time}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <p class="text-sm text-gray-500">${card.table}</p>
                    ${categoryBadge}
                </div>
                ${itemDisplay}
                <div class="flex justify-end mt-3">
                    ${actionBtn()}
                </div>
            </div>
        `;
    }).join('');
}

// ─── Advance card status ──────────────────────────────────────────────────────
function advance(index) {
    const card = itemCards[index];
    if (card.status === 'pending') {
        card.status = 'cooking';
        setTab('cooking');
    } else if (card.status === 'cooking') {
        card.status = 'serving';
        setTab('serving');
    }
}

// ─── Tab ──────────────────────────────────────────────────────────────────────
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

// ─── Init ─────────────────────────────────────────────────────────────────────
setTab('pending');