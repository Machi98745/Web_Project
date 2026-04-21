// ── DATA ──
let cooks = [];
let menuItems = [];
let orders = [];
let payments = [];
let reviews = [];
let topMenu = [];
let lastOrderTotal = 0;
const ordersPerPage = 30;
let currentOrderPage = 1;
let realtimeTimer = null;
let currentPage = 'dashboard';
let currentOrderFilter = 'all';

async function loadCooks() {
    const res = await fetch('/admin/cooks');
    if (!res.ok) {
        // error handling
        return;
    }
    const data = await res.json();
    cooks = Array.isArray(data) ? data : [];

    updateActiveCooksStat();

    renderCooks();
}

function updateActiveCooksStat() {
    const activeCount = cooks.filter(c =>
        c.status && c.status.toLowerCase() === 'enable'
    ).length;

    const totalCount = cooks.length;

    const activeEl = document.getElementById('active-cooks-val');
    if (activeEl) {
        activeEl.innerText = cooks.length > 0 ? activeCount : '0';
    }

    const subEl = document.querySelector('#page-dashboard .stat-card:nth-child(5) .sub');
    if (subEl) {
        subEl.innerText = `Of ${totalCount} registered`;
    }
}

async function loadMenu() {
    const res = await fetch('/admin/menu');
    if (!res.ok) {
        console.error('Failed to load menu', res.status, res.statusText);
        menuItems = [];
        renderMenu();
        return;
    }
    const data = await res.json();
    menuItems = Array.isArray(data) ? data : [];
    renderMenu();
}

function getDashboardQueryParams() {
    const params = new URLSearchParams();
    const start = document.getElementById('dash-from')?.value;
    const end = document.getElementById('dash-to')?.value;
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    return params.toString();
}

function applyDashboardFilter() {
    loadDashboard();
}

async function loadPayments() {
    const res = await fetch('/admin/payments');
    const data = await res.json();
    payments = data;
    renderPayments();
}

async function loadDashboard() {
    try {
        const query = getDashboardQueryParams();
        const res = await fetch('/admin/dashboard' + (query ? `?${query}` : ''));
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();

        // แสดงผลข้อมูลอื่นๆ
        document.getElementById('customers-val').innerText = data.total_customers || 0;
        document.getElementById('total-payment-val').innerText = '฿' + (data.total_payment || 0);
        const avgRating = data.avg_rating != null ? Number(data.avg_rating).toFixed(1) : '-';
        document.getElementById('avg-rating-val').innerText = avgRating === '-' ? '- ★' : `${avgRating} ★`;
        document.getElementById('avg-rating-sub').innerText = `From ${data.review_count || 0} reviews`;
        document.getElementById('total-orders-val').innerText = data.total_orders || 0;

        // --- แก้ไขส่วนนี้ ---
        // แทนที่จะใส่ '-' ให้เรียกฟังก์ชันช่วยคำนวณจำนวน Cook ที่ active อยู่
        updateActiveCooksStat();
        // ------------------

        topMenu = (data.top_menu || []).map(t => ({ name: t.name, count: t.count }));
        if (topMenu.length) {
            renderDash();
        } else {
            document.getElementById('top-menu-bars').innerHTML = '<div style="color: var(--muted); font-size: 13px;">No menu data for this range</div>';
        }
    } catch (err) {
        console.error('loadDashboard error', err);
    }
}

async function loadReviews() {
    const params = new URLSearchParams();
    const start = document.getElementById('review-from')?.value;
    const end = document.getElementById('review-to')?.value;
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const res = await fetch('/admin/reviews' + (params.toString() ? `?${params.toString()}` : ''));
    const data = await res.json();
    reviews = Array.isArray(data) ? data : [];
    renderReviews();
}

async function renderAll() {
    await loadCooks();
    await loadMenu();
    await loadOrders();
    await loadPayments();
    await loadReviews();
    await loadDashboard();
}

// ── LOGIN ──
function doLogout() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('password').value = '';
    document.getElementById('login-error').style.display = 'none';
    // clear persisted login state
    try { localStorage.removeItem('adminLoggedIn'); } catch (e) { /* ignore */ }
}

// ── NAVIGATION ──
function showPage(id) {
    currentPage = id;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById('page-' + id).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(n => {
        if (n.textContent.toLowerCase().includes(id)) {
            n.classList.add('active');
        }
    });

    loadCurrentPage();
    startRealtime();
}

async function loadCurrentPage() {
    if (currentPage === 'dashboard') await loadDashboard();
    if (currentPage === 'orders') await loadOrders();
    if (currentPage === 'payments') await loadPayments();
    if (currentPage === 'reviews') await loadReviews();
    if (currentPage === 'cooks') await loadCooks();
    if (currentPage === 'menu') await loadMenu();
}

function startRealtime() {
    stopRealtime();

    let delay = 15000;

    if (currentPage === 'orders') delay = 30000;
    if (currentPage === 'payments') delay = 15000;
    if (currentPage === 'reviews') delay = 20000;
    if (currentPage === 'dashboard') delay = 20000;

    realtimeTimer = setInterval(loadCurrentPage, delay);
}

function stopRealtime() {
    if (realtimeTimer) {
        clearInterval(realtimeTimer);
        realtimeTimer = null;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopRealtime();
    } else {
        startRealtime();
        loadCurrentPage();
    }
});

// ── RENDER ──

function renderDash() {
    const max = topMenu[0].count;
    document.getElementById('top-menu-bars').innerHTML = topMenu.map(
        m => `
            <div class="bar-row">
            <span class="name">${m.name}</span>
            <div class="bar-bg"><div class="bar-fill" style="width:${Math.round(m.count / max * 100)}%"></div></div>
            <span class="count">${m.count}</span>
            </div>`
    ).join('');
}

function renderCooks() {
    document.getElementById('cooks-tbody').innerHTML = cooks.map(c => `
            <tr>
            <td>${c.cook_id}</td>
            <td>${c.name}</td>
            <td>
                <span class="badge ${c.status === 'enable' ? 'badge-on' : 'badge-off'}">
                    ${c.status}
                </span>
            </td>
            <td>
                <label class="toggle"><input type="checkbox" ${c.status === 'enable' ? 'checked' : ''} onchange="toggleCook(${c.cook_id}, this.checked)"><span class="slider"></span></label>
                <button style="margin-left:8px;" onclick="deleteCook(${c.cook_id})">✕</button>
            </td>
            </tr>
        `).join('');
}

async function toggleCook(cookId, enabled) {
    try {
        await fetch(`/admin/cook/${cookId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: enabled ? 'enable' : 'disable' })
        });
        loadCooks();
    } catch (err) {
        console.error('toggleCook error', err);
        loadCooks();
    }
}

async function deleteCook(cookId) {
    if (!confirm('Remove this cook?')) return;
    await fetch(`/admin/cooks/${cookId}`, {
        method: 'DELETE'
    });
    loadCooks();
}

function renderMenu() {
    document.getElementById('menu-tbody').innerHTML = menuItems.map(
        (m, i) => `
                <tr>
                <td style="font-weight:500;">${m.name}</td>
                <td style="color:var(--accent);font-weight:500;">฿${m.price}</td>
                <td>
                    <span class="badge ${m.enabled ? 'badge-on' : 'badge-off'}">${m.enabled ? 'Active' : 'Disabled'}</span>
                </td>
                <td>
                    <label class="toggle"><input type="checkbox" ${m.enabled ? 'checked' : ''} onchange="toggleMenuItem(${m.menu_id}, this.checked)"><span class="slider"></span></label>
                    <button class="icon-btn" onclick="editMenuItem(${i})" style="margin-left:8px;">✎</button>
                    <button class="icon-btn del" onclick="deleteMenuItem(${i})">✕</button>
                </td>
                </tr>`
    ).join('');
}

async function toggleMenuItem(menuId, enabled) {
    await fetch(`/admin/menu/${menuId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: enabled ? 'enable' : 'disable' })
    });
    loadMenu();
}

async function deleteMenuItem(i) {
    if (!confirm('Delete ' + menuItems[i].name + '?')) return;
    const menuId = menuItems[i].menu_id;
    await fetch(`/admin/menu/${menuId}`, { method: 'DELETE' });
    loadMenu();
}

function editMenuItem(i) {
    const m = menuItems[i];
    document.getElementById('menu-modal-title').textContent = 'Edit menu item';
    document.getElementById('edit-item-idx').value = i;
    document.getElementById('new-item-name').value = m.name;
    document.getElementById('new-item-price').value = m.price;
    openModal('menu');
}

function filterOrders(status) {
    currentOrderFilter = status;
    renderOrders();
}

function renderStatusBadge(status) {
    const cls = {
        pending: 'badge-off',
        cooking: 'badge-warn',
        done: 'badge-on'
    };

    return `
        <span class="badge ${cls[status] || 'badge-off'}">
            ${status || '-'}
        </span>
    `;
}

function formatDateTime(value) {
    if (!value) return '-';

    const date = new Date(value);

    if (isNaN(date.getTime())) return '-';

    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function mergeItems(itemsText) {
    if (!itemsText) return '-';

    const parts = itemsText.split(',').map(v => v.trim()).filter(Boolean);

    const map = {};

    for (const item of parts) {
        const match = item.match(/^(.*)\sx(\d+)$/i);

        if (match) {
            const name = match[1].trim();
            const qty = parseInt(match[2]) || 1;

            map[name] = (map[name] || 0) + qty;
        } else {
            map[item] = (map[item] || 0) + 1;
        }
    }

    return Object.entries(map)
        .map(([name, qty]) => `${name} x${qty}`)
        .join(', ');
}

function renderOrders() {
    const board = document.getElementById('orders-board');

    const keyword = document.getElementById('order-search')?.value.toLowerCase() || '';
    const date = document.getElementById('order-date')?.value || '';
    const status = document.getElementById('order-status-filter')?.value || 'all';

    let filtered = [...orders];

    if (status !== 'all') {
        filtered = filtered.filter(o => o.status === status);
    }

    if (keyword) {
        filtered = filtered.filter(o =>
            String(o.order_id).includes(keyword) ||
            (o.items || '').toLowerCase().includes(keyword) ||
            (o.cook_name || '').toLowerCase().includes(keyword)
        );
    }

    if (date) {
        filtered = filtered.filter(o =>
            o.created_at?.slice(0, 10) === date
        );
    }

    document.getElementById('pending-count').innerText = orders.filter(o => o.status === 'pending').length;
    document.getElementById('cooking-count').innerText = orders.filter(o => o.status === 'cooking').length;
    document.getElementById('done-count').innerText = orders.filter(o => o.status === 'done').length;

    const totalPages = Math.ceil(filtered.length / ordersPerPage) || 1;

    if (currentOrderPage > totalPages) {
        currentOrderPage = totalPages;
    }

    const start = (currentOrderPage - 1) * ordersPerPage;
    const end = start + ordersPerPage;
    const pageData = filtered.slice(start, end);

    document.getElementById('page-info').innerText =
        `${currentOrderPage} / ${totalPages}`;

    if (!pageData.length) {
        board.innerHTML = `<div class="empty-board">No Orders</div>`;
        return;
    }

    board.innerHTML = pageData.map(o => `
        <div class="order-card ${o.status}">
            <div class="order-head">
                <span class="order-id">#${o.order_id}</span>
                <span class="order-status ${o.status}">
                    ${o.status.toUpperCase()}
                </span>
            </div>

            <div class="order-items">${mergeItems(o.items)}</div>

            <div class="order-meta">
                👨‍🍳 ${o.cook_name || '-'}<br>
                🕒 ${formatDateTime(o.created_at)}
            </div>

            <div class="order-total">฿${o.total}</div>
        </div>
    `).join('');
}

function applyOrderFilters() {
    currentOrderPage = 1;
    renderOrders();
}

function changePage(step) {
    currentOrderPage += step;
    if (currentOrderPage < 1) currentOrderPage = 1;
    renderOrders();
}

function playOrderSound() {
    const audio = new Audio(
        'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
    );

    audio.play().catch(() => { });
}

function renderPayments() {
    document.getElementById('payments-tbody').innerHTML = payments.map(
        p => `
                <tr>
                <td style="color:var(--muted);font-size:12px;font-family:monospace;">#${p.payment_id}</td>
                <td style="color:var(--accent);">Table  ${p.table_number || 'N/A'}</td>
                <td style="font-weight:500;">฿${p.total_price}</td>
                <td>cash</td>
                <td style="color:var(--muted);">${p.paid_at ? new Date(p.paid_at).toLocaleString() : '-'}</td>
                <td><span class="badge badge-on">Paid</span></td>
                </tr>`
    ).join('');
}

function renderReviews() {
    const body = document.getElementById('reviews-tbody');
    if (!reviews.length) {
        body.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">No reviews found for the selected date range.</td>
                </tr>`;
        return;
    }

    body.innerHTML = reviews.map((r) => {
        const rawRating = r.rating != null ? Number(r.rating) : null;
        const rating = Number.isFinite(rawRating) ? rawRating : null;
        const stars = rating
            ? Array.from({ length: 5 }, (_, i) =>
                `<span class="star ${i < rating ? 'star-active' : 'star-inactive'}">★</span>`,
            ).join('')
            : '<span class="text-xs text-gray-400">No rating</span>';

        return `
                <tr>
                <td style="font-weight:500;">${r.review_id || '-'}</td>
                <td style="font-weight:500;">${r.table_number || '-'}</td>
                <td class="rating-cell">${stars}</td>
                <td style="color:var(--muted);max-width:220px;">${r.comment || '-'}</td>
                <td style="color:var(--muted);">${r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                </tr>`;
    }).join('');
}

// ── CRUD ──
async function addCook() {
    const name = document.getElementById('new-cook-name').value;
    const cook_id = document.getElementById('new-cook-id').value;

    if (!name || !cook_id) return;

    try {
        const res = await fetch('/admin/cooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cook_id, name })
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Cook created', text: 'Provide the Cook ID to the cook and ask them to register and set their password.', confirmButtonColor: '#3085d6' });
        } else {
            Swal.fire({ icon: 'error', title: 'Create failed', text: 'Failed to create cook: ' + (data.message || res.statusText), confirmButtonColor: '#3085d6' });
        }
    } catch (err) {
        console.error('addCook error', err);
        Swal.fire({ icon: 'error', title: 'Connection error', text: 'Cannot contact server', confirmButtonColor: '#3085d6' });
    }

    loadCooks();
    closeModal('cook');
}

async function loadOrders() {
    const board = document.getElementById('orders-board');
    if (!board) return;

    try {
        board.innerHTML = `
            <div class="empty-board">
                Loading orders...
            </div>
        `;

        const res = await fetch('/admin/orders');

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        orders = Array.isArray(data) ? data : [];

        renderOrders();

    } catch (err) {
        console.error('loadOrders error:', err);

        board.innerHTML = `
            <div class="empty-board">
                Failed to load orders
            </div>
        `;
    }
}

async function saveMenuItem() {
    const name = document.getElementById('new-item-name').value.trim();
    const price = parseInt(document.getElementById('new-item-price').value) || 0;
    const idx = parseInt(document.getElementById('edit-item-idx').value);

    if (!name) return;

    if (idx >= 0) {
        const menuId = menuItems[idx].menu_id;
        await fetch(`/admin/menu/${menuId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price })
        });
    } else {
        await fetch('/admin/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price })
        });
    }

    loadMenu();
    closeModal('menu');
}

// ── MODAL ──
function openModal(id) {
    if (id === 'menu') {
        document.getElementById('menu-modal-title').textContent = 'Add menu item';
        document.getElementById('edit-item-idx').value = '-1';
        document.getElementById('new-item-name').value = '';
        document.getElementById('new-item-price').value = '';
    }
    document.getElementById('modal-' + id).classList.add('open');
}

function closeModal(id) {
    document.getElementById('modal-' + id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => {
        if (e.target === m) m.classList.remove('open');
    });
});

async function doLogin() {
    const adminID = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    if (!adminID || !password) {
        errorMsg.innerText = "Please enter both username and password.";
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminID, password })
        });

        const data = await response.json();

        if (response.ok) {
            try { localStorage.setItem('adminLoggedIn', '1'); } catch (e) { /* ignore */ }
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            await renderAll();
            startRealtime();
        } else {
            errorMsg.innerText = data.message || "Invalid username or password.";
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error("Login Error:", error);
        errorMsg.innerText = "Cannot connect to server.";
        errorMsg.style.display = 'block';
    }
}

// Initialize auth state on page load so refresh doesn't force login
(function initAuth() {
    try {
        const logged = localStorage.getItem('adminLoggedIn') === '1';
        if (logged) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            renderAll().then(() => startRealtime());
        } else {
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('app').style.display = 'none';
        }
    } catch (e) {
        // if localStorage is unavailable, default to login screen
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }
})();