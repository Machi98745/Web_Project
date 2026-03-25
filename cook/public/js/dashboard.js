// Auth
const cookName = sessionStorage.getItem('cookName') || 'Cook';
document.getElementById('cookName').textContent = cookName;

function logout() {
    sessionStorage.clear();
    window.location.href = '/cook/view/login.html';
}


// Top menus
const topMenus = [
    { name: 'Pad Thai',       emoji: '🍜', count: 9, color: 'bg-orange-400' },
    { name: 'Tom Yum Goong',  emoji: '🍲', count: 7, color: 'bg-red-400'    },
    { name: 'Chicken Curry',  emoji: '🍛', count: 6, color: 'bg-yellow-400' },
    { name: 'Fried Rice',     emoji: '🍚', count: 5, color: 'bg-green-400'  },
    { name: 'Caesar Salad',   emoji: '🥗', count: 4, color: 'bg-blue-400'   },
    { name: 'Cheeseburger',   emoji: '🍔', count: 3, color: 'bg-purple-400' },
];

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


// Hourly trend
const hourlyData = [
    { h: '08:00', count: 2  },
    { h: '09:00', count: 5  },
    { h: '10:00', count: 8  },
    { h: '11:00', count: 6  },
    { h: '12:00', count: 12 },
    { h: '13:00', count: 7  },
    { h: '14:00', count: 4  },
    { h: '15:00', count: 3  },
];

function renderHourlyChart() {
    const max = Math.max(...hourlyData.map(h => h.count));

    document.getElementById('hourlyChart').innerHTML = hourlyData.map(h => `
        <div class="flex items-center gap-3">
            <span class="text-xs mono text-gray-400 w-10 shrink-0">${h.h}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div class="bg-yellow-400 h-2 rounded-full" style="width:${Math.round(h.count / max * 100)}%"></div>
            </div>
            <span class="text-xs mono text-gray-400 w-4 text-right">${h.count}</span>
        </div>
    `).join('');
}


// Recent served orders
const recentOrders = [
    { id: 'ORD-030', table: 'T-02', items: ['Caesar Salad', 'Pepperoni Pizza'], time: '10:20', mins: 15 },
    { id: 'ORD-029', table: 'T-06', items: ['Pad Thai', 'Green Tea'],           time: '11:10', mins: 11 },
    { id: 'ORD-028', table: 'T-02', items: ['Fried Rice', 'Tom Yum'],           time: '10:55', mins: 9  },
    { id: 'ORD-027', table: 'T-08', items: ['Chicken Curry', 'Steamed Rice'],   time: '10:30', mins: 14 },
];

function renderRecentOrders() {
    document.getElementById('recentOrders').innerHTML = recentOrders.map(o => `
        <div class="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span class="w-2 h-2 bg-green-400 rounded-full shrink-0"></span>
            <span class="mono text-xs text-yellow-500 w-20 shrink-0">${o.id}</span>
            <span class="text-gray-400 font-normal">${o.items.join(', ')}</span>
            </span>
            <span class="text-xs text-gray-400 mono">${o.mins}m</span>
            <span class="text-xs mono text-gray-300">${o.time}</span>
        </div>
    `).join('');
}


// Init
renderTopMenus();
renderHourlyChart();
renderRecentOrders();