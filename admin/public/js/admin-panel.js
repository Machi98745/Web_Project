    // ── DATA ──
    let cooks = [];
    let menuItems = [];
    let orders = [];
    let payments = [];
    let reviews = [];

    async function loadCooks() {
        const res = await fetch('/admin/cooks');
        if (!res.ok) {
            console.error('Failed to load cooks', res.status, res.statusText);
            cooks = [];
            renderCooks();
            return;
        }
        const data = await res.json();
        cooks = Array.isArray(data) ? data : [];
        renderCooks();
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


    async function loadPayments() {
        const res = await fetch('/admin/payments');
        const data = await res.json();
        payments = data;
        renderPayments();
    }

    async function loadReviews() {
        const res = await fetch('/admin/reviews');
        const data = await res.json();
        reviews = data;
        renderReviews();
    }

    function renderAll() {
        loadCooks();
        loadMenu();
        loadOrders();
        loadPayments();
        loadReviews();
    }
    // ── LOGIN ──


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
            <td>-</td>
            <td>
                <span class="badge ${c.status === 'enable' ? 'badge-on' : 'badge-off'}">
                    ${c.status}
                </span>
            </td>
            <td>
                <button onclick="deleteCook(${c.cook_id})">✕</button>
            </td>
            </tr>
        `).join('');
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
                <td><span class="badge badge-info">${m.cat || 'ทั่วไป'}</span></td>
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
        document.getElementById('new-item-cat').value = m.cat;
        document.getElementById('new-item-price').value = m.price;
        openModal('menu');
    }

    function renderOrders() {
        document.getElementById('orders-tbody').innerHTML = orders.map(o => `
            <tr>
            <td>${o.order_id}</td>
            <td>${o.items}</td>
            <td>${o.cook_name || '-'}</td>
            <td>${new Date(o.created_at).toLocaleTimeString()}</td>
            <td>฿${o.total}</td>
            <td>${o.status}</td>
            </tr>
        `).join('');
    }
    function filterOrders(val) { renderOrders(val); }

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
        document.getElementById('reviews-tbody').innerHTML = reviews.map(
            r => `
                <tr>
                <td style="font-weight:500;">Table  ${r.table_number || 'Unknown'}</td>
                <td style="color:var(--accent);">${r.comment || '-'} (ID ${r.review_id})</td>
                <td><span class="stars">★★★★★</span></td>
                <td style="color:var(--muted);max-width:220px;">${r.comment || '-'}</td>
                <td style="color:var(--muted);">${r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                </tr>`
        ).join('');
    }

    // ── CRUD ──
    async function addCook() {
        const name = document.getElementById('new-cook-name').value;
        const cook_id = document.getElementById('new-cook-id').value;

        if (!name || !cook_id) return;

        await fetch('/admin/cooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cook_id, name })
        });

        loadCooks();
        closeModal('cook');
    }

    async function loadOrders() {
        const res = await fetch('/admin/orders');
        const data = await res.json();
        orders = data;
        renderOrders();
    }

    async function saveMenuItem() {
        const name = document.getElementById('new-item-name').value.trim();
        const cat = document.getElementById('new-item-cat').value;
        const price = parseInt(document.getElementById('new-item-price').value) || 0;
        const idx = parseInt(document.getElementById('edit-item-idx').value);

        if (!name) return;

        if (idx >= 0) {
            const menuId = menuItems[idx].menu_id;
            await fetch(`/admin/menu/${menuId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, cat, price })
            });
        } else {
            await fetch('/admin/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, cat, price })
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
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                renderAll();
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