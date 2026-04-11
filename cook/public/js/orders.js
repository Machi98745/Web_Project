// Auth
let cookName = 'Cook';
document.getElementById('cookName').textContent = cookName;

async function loadCookNameFromServer() {
    try {
        const cached = sessionStorage.getItem('cookName');
        if (cached) {
            cookName = cached;
            document.getElementById('cookName').textContent = cookName;
            return;
        }

        const cookId = sessionStorage.getItem('cookId');
        if (!cookId) return;

        const res = await fetch(`/cook/info?cookId=${encodeURIComponent(cookId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.name) {
            cookName = data.name;
            sessionStorage.setItem('cookName', cookName);
            document.getElementById('cookName').textContent = cookName;
        }
    } catch (e) {
        console.error('Failed to load cook name', e);
    }
}

// Try to load cook name immediately
loadCookNameFromServer();

function logout() {
    sessionStorage.clear();
    window.location.href = '/cook/view/login.html';
}


// Drink detection
const DRINK_KEYWORDS = ['tea', 'coffee', 'lemonade', 'soda', 'juice', 'water', 'smoothie', 'shake', 'cola', 'iced'];

function isDrink(itemName) {
    if (!itemName) return false;
    const lower = itemName.toLowerCase();
    return DRINK_KEYWORDS.some(kw => lower.includes(kw));
}


// Polling / state guards to avoid duplicate claims
let isPollingPaused = false;
let isUpdating = false;


let itemCards = [];

async function loadOrders(status = 'pending') {
    try {
        let data = [];

        if (status === 'inprogress') {
            // fetch both cooking and serving
            const [r1, r2] = await Promise.all([
                fetch('/cook/orders?status=cooking'),
                fetch('/cook/orders?status=serving')
            ]);
            const d1 = r1.ok ? await r1.json() : [];
            const d2 = r2.ok ? await r2.json() : [];
            data = (d1 || []).concat(d2 || []);
        } else {
            const res = await fetch(`/cook/orders?status=${status}`);
            data = await res.json();
        }

        itemCards = data.map(item => ({
            order_item_id: item.order_item_id,
            orderId: `ORD-${item.order_id}`,
            table: `Table ${item.table_number}`,
            time: new Date(item.created_at).toLocaleTimeString(),
            type: isDrink(item.menu_name) ? 'drink' : 'food',
            label: item.menu_name || item.name || 'Unknown',
            items: [item.menu_name],
            status: item.status
        }));

        renderCards();

    } catch (err) {
        console.error(err);
    }
}


// Confirm modal
let pendingAdvanceIndex = null;

function askAdvance(index) {
    pendingAdvanceIndex = index;
    isPollingPaused = true;

    const card = itemCards[index];
    const nextLabel = card.status === 'pending' ? 'Cooking' : 'Served';

    document.getElementById('modal-item').textContent = card.type === 'drink' ? '🥤 ' + card.label : card.label;
    document.getElementById('modal-order').textContent = `${card.orderId} · ${card.table}`;
    document.getElementById('modal-next').textContent = nextLabel;
    document.getElementById('confirmModal').classList.remove('hidden');
}

async function confirmAdvance() {
    if (pendingAdvanceIndex === null) return;
    if (isUpdating) return;
    isUpdating = true;

    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) confirmBtn.disabled = true;

    const card = itemCards[pendingAdvanceIndex];
    pendingAdvanceIndex = null;

    const nextStatus = card.status === 'pending' ? 'cooking' : 'serving';

    try {
        const cookId = sessionStorage.getItem('cookId');

        if (!cookId) {
            alert("Please login again");
            window.location.href = '/cook/view/login.html';
            return;
        }

        const res = await fetch(`/cook/order-item/${card.order_item_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: nextStatus,
                cookId: cookId
            })
        });

        if (res.status === 409) {
            alert('The order has been taken by someone else — refresh the list.');
            closeModal();
            loadOrders(currentTab);
            return;
        }

        if (!res.ok) {
            alert("Update failed");
            return;
        }

        closeModal();
        loadOrders(currentTab);

    } catch (err) {
        console.error(err);
    } finally {
        isUpdating = false;
        if (confirmBtn) confirmBtn.disabled = false;
        isPollingPaused = false;
    }
}

function closeModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    pendingAdvanceIndex = null;
    isPollingPaused = false;
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
    let visible;
    if (currentTab === 'inprogress') {
        visible = itemCards.filter(card => card.status === 'cooking' || card.status === 'serving');
    } else {
        visible = itemCards.filter(card => card.status === currentTab);
    }

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
    if (active) {
        active.classList.add('bg-green-700', 'text-white');
        active.classList.remove('bg-gray-200', 'text-gray-600');
    }

    loadOrders(tab);
}


// Init
setTab('pending');

// Poll every 3s to keep list fresh and reduce race window
setInterval(() => {
    if (!isPollingPaused) loadOrders(currentTab);
}, 3000);
