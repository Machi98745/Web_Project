// ── DATA ──
let cooks = [
    { id: 'COOK-001', name: 'Somchai K.', added: '2024-03-10', enabled: true },
    { id: 'COOK-002', name: 'Nattaporn S.', added: '2024-04-02', enabled: true },
    { id: 'COOK-003', name: 'Wanchai R.', added: '2024-05-15', enabled: false },
    { id: 'COOK-004', name: 'Piyanut T.', added: '2024-06-01', enabled: true }
];

let menuItems = [
    { name: 'Pad Thai', cat: 'Main course', price: 120, enabled: true },
    { name: 'Tom Yum Kung', cat: 'Appetizer', price: 150, enabled: true },
    { name: 'Mango Sticky Rice', cat: 'Dessert', price: 80, enabled: true },
    { name: 'Green Curry', cat: 'Main course', price: 130, enabled: true },
    { name: 'Thai Iced Tea', cat: 'Drink', price: 45, enabled: false },
    { name: 'Som Tum', cat: 'Appetizer', price: 90, enabled: true }
];

const orders = [
    { id: '#1044', items: 'Pad Thai × 1', cook: 'Somchai K.', time: '12:15', total: '฿120', status: 'pending' },
    { id: '#1043', items: 'Som Tum, Mango Sticky Rice', cook: 'Piyanut T.', time: '12:10', total: '฿170', status: 'cooking' },
    { id: '#1042', items: 'Pad Thai × 2, Thai Tea', cook: 'Somchai K.', time: '12:04', total: '฿285', status: 'done' },
    { id: '#1041', items: 'Tom Yum, Green Curry', cook: 'Nattaporn S.', time: '11:52', total: '฿280', status: 'done' },
    { id: '#1040', items: 'Green Curry × 2, Thai Tea', cook: 'Wanchai R.', time: '11:30', total: '฿305', status: 'done' }
];

const payments = [
    { ref: 'PAY-8821', order: '#1042', amount: '฿285', method: 'QR code', date: '2025-06-01', status: 'paid' },
    { ref: 'PAY-8820', order: '#1041', amount: '฿280', method: 'Cash', date: '2025-06-01', status: 'paid' },
    { ref: 'PAY-8819', order: '#1040', amount: '฿305', method: 'Card', date: '2025-05-31', status: 'paid' },
    { ref: 'PAY-8818', order: '#1039', amount: '฿95', method: 'QR code', date: '2025-05-31', status: 'paid' },
    { ref: 'PAY-8817', order: '#1038', amount: '฿210', method: 'Cash', date: '2025-05-30', status: 'paid' }
];

const reviews = [
    { customer: 'Arisa T.', order: '#1040', rating: 5, comment: 'Amazing curry, will come back!', date: '2025-05-31' },
    { customer: 'Thanapol S.', order: '#1038', rating: 4, comment: 'Good food, slightly slow service.', date: '2025-05-30' },
    { customer: 'Mika O.', order: '#1035', rating: 5, comment: 'Best Pad Thai I have ever had.', date: '2025-05-28' },
    { customer: 'David R.', order: '#1032', rating: 3, comment: 'Decent but Tom Yum was too salty.', date: '2025-05-25' },
    { customer: 'Siriwan P.', order: '#1028', rating: 5, comment: 'Everything was perfect!', date: '2025-05-20' }
];

const topMenu = [
    { name: 'Pad Thai', count: 142 },
    { name: 'Tom Yum Kung', count: 98 },
    { name: 'Green Curry', count: 87 },
    { name: 'Som Tum', count: 74 },
    { name: 'Mango Sticky Rice', count: 61 }
];

// ── LOGIN ──
document.getElementById('password').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
function doLogin() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    if (u === 'admin' && p === 'admin123') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        renderAll();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function doLogout() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('password').value = '';
    document.getElementById('login-error').style.display = 'none';
}

// ── NAVIGATION ──
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => {
        if (n.textContent.trim().toLowerCase().startsWith(id.slice(0, 4))) n.classList.add('active');
    });
}

// ── RENDER ──
function renderAll() {
    renderCooks(); renderMenu(); renderOrders('all'); renderPayments(); renderReviews(); renderDash();
}

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
    document.getElementById('cooks-tbody').innerHTML = cooks.map(
        (c, i) => `
            <tr>
            <td style="color:var(--muted);font-size:12px;font-family:monospace;">${c.id}</td>
            <td style="font-weight:500;">${c.name}</td>
            <td style="color:var(--muted);">${c.added}</td>
            <td><span class="badge ${c.enabled ? 'badge-on' : 'badge-off'}">${c.enabled ? 'Active' : 'Disabled'}</span></td>
            <td>
                <label class="toggle"><input type="checkbox" ${c.enabled ? 'checked' : ''} onchange="cooks[${i}].enabled=this.checked;renderCooks()"><span class="slider"></span></label>
                <button class="icon-btn del" onclick="deleteCook(${i})" style="margin-left:6px;">✕</button>
            </td>
            </tr>`
    ).join('');
}

function deleteCook(i) {
    if (confirm('Remove ' + cooks[i].name + '?')) {
        cooks.splice(i, 1); renderCooks();
    }
}

function renderMenu() {
    document.getElementById('menu-tbody').innerHTML = menuItems.map(
        (m, i) => `
            <tr>
            <td style="font-weight:500;">${m.name}</td>
            <td><span class="badge badge-info">${m.cat}</span></td>
            <td style="color:var(--accent);font-weight:500;">฿${m.price}</td>
            <td><span class="badge ${m.enabled ? 'badge-on' : 'badge-off'}">${m.enabled ? 'Active' : 'Disabled'}</span></td>
            <td>
                <label class="toggle"><input type="checkbox" ${m.enabled ? 'checked' : ''} onchange="menuItems[${i}].enabled=this.checked;renderMenu()"><span class="slider"></span></label>
                <button class="icon-btn" onclick="editMenuItem(${i})" style="margin-left:4px;">✎</button>
                <button class="icon-btn del" onclick="deleteMenuItem(${i})">✕</button>
            </td>
            </tr>`
    ).join('');
}

function deleteMenuItem(i) {
    if (confirm('Delete ' + menuItems[i].name + '?')) {
        menuItems.splice(i, 1); renderMenu();
    }
}

function editMenuItem(i) {
    const m = menuItems[i];
    document.getElementById('menu-modal-title').textContent = 'Edit menu item';
    document.getElementById('edit-item-idx').value = i;
    document.getElementById('new-item-name').value = m.name;
    document.getElementById('new-item-cat').value = m.cat;
    document.getElementById('new-item-price').value = m.price;
    openModal('menu');
}

function renderOrders(filter) {
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    const sc = { done: 'badge-on', cooking: 'badge-warn', pending: 'badge-info' };
    document.getElementById('orders-tbody').innerHTML = filtered.map(
        o => `
            <tr>
            <td style="font-weight:500;color:var(--accent);font-family:monospace;">${o.id}</td>
            <td style="color:var(--muted);max-width:180px;">${o.items}</td>
            <td>${o.cook}</td>
            <td style="color:var(--muted);">${o.time}</td>
            <td style="font-weight:500;">${o.total}</td>
            <td><span class="badge ${sc[o.status]}">${o.status}</span></td>
            </tr>`
    ).join('');
}
function filterOrders(val) { renderOrders(val); }

function renderPayments() {
    document.getElementById('payments-tbody').innerHTML = payments.map(
        p => `
            <tr>
            <td style="color:var(--muted);font-size:12px;font-family:monospace;">${p.ref}</td>
            <td style="color:var(--accent);">${p.order}</td>
            <td style="font-weight:500;">${p.amount}</td>
            <td>${p.method}</td>
            <td style="color:var(--muted);">${p.date}</td>
            <td><span class="badge badge-on">${p.status}</span></td>
            </tr>`
    ).join('');
}

function renderReviews() {
    document.getElementById('reviews-tbody').innerHTML = reviews.map(
        r => `
            <tr>
            <td style="font-weight:500;">${r.customer}</td>
            <td style="color:var(--accent);">${r.order}</td>
            <td><span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></td>
            <td style="color:var(--muted);max-width:220px;">${r.comment}</td>
            <td style="color:var(--muted);">${r.date}</td>
            </tr>`
    ).join('');
}

// ── CRUD ──
function addCook() {
    const name = document.getElementById('new-cook-name').value.trim();
    const id = document.getElementById('new-cook-id').value.trim();
    if (!name || !id) return;
    cooks.push({ id, name, added: new Date().toISOString().slice(0, 10), enabled: true });
    renderCooks();
    closeModal('cook');
    document.getElementById('new-cook-name').value = '';
    document.getElementById('new-cook-id').value = '';
}

function saveMenuItem() {
    const name = document.getElementById('new-item-name').value.trim();
    const cat = document.getElementById('new-item-cat').value;
    const price = parseInt(document.getElementById('new-item-price').value) || 0;
    const idx = parseInt(document.getElementById('edit-item-idx').value);
    if (!name) return;
    if (idx >= 0) { menuItems[idx] = { ...menuItems[idx], name, cat, price }; }
    else { menuItems.push({ name, cat, price, enabled: true }); }
    renderMenu();
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