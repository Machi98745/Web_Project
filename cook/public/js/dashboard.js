// Auth
const cookName = sessionStorage.getItem('cookId') || 'Cook';
document.getElementById('cookName').textContent = cookName;

function logout() {
    sessionStorage.clear();
    window.location.href = '/cook/view/login.html';
}


// Top menus (populated from server)
let topMenus = [];

async function loadCookDashboard() {
    try {
        const res = await fetch('/cook/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard');
        const data = await res.json();

        // total served
        document.getElementById('menus-served-val').textContent = data.total_served || 0;

        // orders done
        const ordersDoneEl = document.getElementById('orders-done-val');
        if (ordersDoneEl) ordersDoneEl.textContent = data.orders_done || 0;

        // avg rating
        const avgRatingEl = document.getElementById('avg-rating-val');
        if (avgRatingEl) avgRatingEl.textContent = data.avg_rating ? data.avg_rating + ' ★' : '-';

        // avg cook time
        const avgTimeEl = document.getElementById('avg-time-val');
        if (avgTimeEl) avgTimeEl.textContent = (data.avg_cook_time !== null && data.avg_cook_time !== undefined) ? (data.avg_cook_time + ' m') : '-';

        // map top items
        const colors = ['bg-orange-400','bg-red-400','bg-yellow-400','bg-green-400','bg-blue-400','bg-purple-400'];
        topMenus = (data.top_items || []).map((t, i) => ({
            name: t.name,
            emoji: '🍽',
            count: t.count,
            color: colors[i % colors.length]
        }));

        renderTopMenus();
    } catch (err) {
        console.error('loadCookDashboard error', err);
    }
}

function renderTopMenus() {
    const max = topMenus[0].count;

    document.getElementById('topMenus').innerHTML = topMenus.map((menu, i) => `
        <div class="flex items-center gap-3">
            <span class="w-5 text-xs mono text-gray-300 text-right">${i + 1}</span>
            <span class="text-lg">${menu.emoji}</span>
            <div class="flex-1">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-medium text-gray-700">${menu.name}</span>
                    <span class="text-xs mono text-gray-400">${menu.count}x</span>
                </div>
                <div class="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div class="${menu.color} h-1.5 rounded-full" style="width:${Math.round(menu.count / max * 100)}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}


// Hourly trend (loaded from server)
let hourlyData = [];

function buildHourlySlots(data) {
    // data: [{hour: 8, count: N}, ...]
    // Build slots between 8..17 (or based on data range)
    const slots = [];
    const hours = [];
    // choose range from min to max hour in data or default 8-17
    if (data && data.length) {
        const hrs = data.map(d => d.hour);
        const minH = Math.min(...hrs);
        const maxH = Math.max(...hrs);
        for (let h = Math.max(0, minH); h <= Math.min(23, maxH); h++) hours.push(h);
    } else {
        for (let h = 8; h <= 17; h++) hours.push(h);
    }

    for (const h of hours) {
        const found = (data || []).find(d => Number(d.hour) === Number(h));
        slots.push({ h: (h < 10 ? '0' + h + ':00' : h + ':00'), count: found ? found.count : 0 });
    }
    return slots;
}

function renderHourlyChart() {
    const slots = buildHourlySlots(hourlyData);
    const max = slots.length ? Math.max(...slots.map(h => h.count)) : 1;

    document.getElementById('hourlyChart').innerHTML = slots.map(h => `
        <div class="flex items-center gap-3">
            <span class="text-xs mono text-gray-400 w-10 shrink-0">${h.h}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div class="bg-yellow-400 h-2 rounded-full" style="width:${max === 0 ? 0 : Math.round(h.count / max * 100)}%"></div>
            </div>
            <span class="text-xs mono text-gray-400 w-4 text-right">${h.count}</span>
        </div>
    `).join('');
}

async function loadHourlyData() {
    try {
        const res = await fetch('/cook/orders-by-hour');
        if (!res.ok) throw new Error('Failed to load hourly data');
        const data = await res.json();
        hourlyData = Array.isArray(data) ? data : [];
        renderHourlyChart();
    } catch (err) {
        console.error('loadHourlyData error', err);
    }
}


// Recent served orders (loaded from server)
let recentOrders = [];

function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function calcMinutes(start, end) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (!s || !e) return 0;
    return Math.max(0, Math.round((e - s) / 60000));
}

function renderRecentOrders() {
    const el = document.getElementById('recentOrders');
    if (!recentOrders || recentOrders.length === 0) {
        el.innerHTML = `<p class="text-center text-gray-400 text-sm mt-6">No recent served orders</p>`;
        return;
    }

    el.innerHTML = recentOrders.map(o => {
        const orderLabel = 'ORD-' + String(o.order_id).padStart(3, '0');
        return `
        <div class="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span class="w-2 h-2 bg-green-400 rounded-full shrink-0"></span>
            <span class="mono text-xs text-yellow-500 w-20 shrink-0">${orderLabel}</span>
            <span class="text-gray-400 font-normal">${o.menu_name}${o.quantity > 1 ? ' x' + o.quantity : ''}</span>
            <span class="text-xs mono text-gray-300 ml-auto">${formatTime(o.updated_at || o.created_at)}</span>
        </div>
    `}).join('');
}

async function loadRecentOrders() {
    try {
        const res = await fetch('/cook/recent-served');
        if (!res.ok) throw new Error('Failed to load recent served');
        const data = await res.json();
        recentOrders = Array.isArray(data) ? data : [];
        renderRecentOrders();
    } catch (err) {
        console.error('loadRecentOrders error', err);
        recentOrders = [];
        renderRecentOrders();
    }
}


// Init
loadCookDashboard();
loadHourlyData();
loadRecentOrders();