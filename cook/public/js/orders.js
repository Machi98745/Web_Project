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

let currentPage = 1;
const ITEMS_PER_PAGE = 15;
let itemCards = [];

async function loadOrders(status = 'preparing') {
    try {
        let data = [];

        if (status === 'preparing') {
            // fetch both pending and cooking
            const [r1, r2] = await Promise.all([
                fetch('/cook/orders?status=pending'),
                fetch('/cook/orders?status=cooking')
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


// Confirm with SweetAlert2
let pendingAdvanceIndex = null;

function askAdvance(index) {
    pendingAdvanceIndex = index;
    isPollingPaused = true;

    const card = itemCards[index];
    const nextLabel = card.status === 'pending' ? 'Cooking' : 'Served';
    const itemDisplay = card.type === 'drink' ? '🥤 ' + card.label : card.label;

    Swal.fire({
        title: itemDisplay,
        html: `<p style="font-size: 12px; color: #999; margin-bottom: 10px;">${card.orderId} · ${card.table}</p>\n               <p style="font-size: 14px; color: #666;">Mark as <strong>${nextLabel}</strong>?</p>`,
        showCancelButton: true,
        confirmButtonColor: '#15803d',
        cancelButtonColor: '#d1d5db',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            confirmAdvance();
        } else {
            pendingAdvanceIndex = null;
            isPollingPaused = false;
        }
    });
}

async function confirmAdvance() {
    if (pendingAdvanceIndex === null) return;
    if (isUpdating) return;
    isUpdating = true;

    const card = itemCards[pendingAdvanceIndex];
    pendingAdvanceIndex = null;

    const nextStatus = card.status === 'pending' ? 'cooking' : 'serving';

    try {
        const cookId = sessionStorage.getItem('cookId');

        if (!cookId) {
            Swal.fire({ icon: 'warning', title: 'Please login', text: 'Please login again', confirmButtonColor: '#3085d6' })
                .then(() => { window.location.href = '/cook/view/login.html'; });
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
            Swal.fire({ icon: 'info', title: 'Conflict', text: 'The order has been taken by someone else — refresh the list.', confirmButtonColor: '#3085d6' });
            loadOrders(currentTab);
            return;
        }

        if (!res.ok) {
            Swal.fire({ icon: 'error', title: 'Update failed', text: 'Unable to update order status.', confirmButtonColor: '#3085d6' });
            return;
        }

        loadOrders(currentTab);

    } catch (err) {
        console.error(err);
    } finally {
        isUpdating = false;
        isPollingPaused = false;
    }
}

function changePage(direction) {
    const visible = getVisibleOrders();
    const totalPages = Math.max(1, Math.ceil(visible.length / ITEMS_PER_PAGE));
    currentPage = Math.min(totalPages, Math.max(1, currentPage + direction));
    renderCards();
}

function updatePageDisplay(totalPages) {
    const pageDisplay = document.getElementById('pageDisplay');
    if (pageDisplay) {
        pageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
    }
}

function getVisibleOrders() {
    if (currentTab === 'preparing') {
        return itemCards.filter(card => card.status === 'pending' || card.status === 'cooking');
    }
    return itemCards.filter(card => card.status === currentTab);
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
    const visible = getVisibleOrders();
    const totalPages = Math.max(1, Math.ceil(visible.length / ITEMS_PER_PAGE));

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    if (visible.length === 0) {
        list.innerHTML = `<div class="col-span-3 flex justify-center items-center min-h-[200px] text-center text-gray-400 text-sm">No orders</div>`;
        updatePageDisplay(totalPages);
        return;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = visible.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    list.innerHTML = pageItems.map(card => {
        const index = itemCards.indexOf(card);
        return buildCardHTML(card, index);
    }).join('');

    updatePageDisplay(totalPages);
}


// Tabs
let currentTab = 'preparing';

function setTab(tab) {
    currentTab = tab;
    currentPage = 1;

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
setTab('preparing');

// Poll every 3s to keep list fresh and reduce race window
setInterval(() => {
    if (!isPollingPaused) loadOrders(currentTab);
}, 3000);
