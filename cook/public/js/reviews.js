// Auth
const cookName = sessionStorage.getItem('cookId') || 'Cook';
document.getElementById('cookName').textContent = cookName;

function logout() {
    sessionStorage.clear();
    window.location.href = '/cook/view/login.html';
}


// Review data
const reviews = [
    { order: '#ORD-030', rating: 5, text: 'อาหารอร่อยมากๆ ครับ เสิร์ฟเร็ว ร้อน สด',          table: 'T-02', time: '10:20' },
    { order: '#ORD-029', rating: 4, text: 'รสชาติดี แต่รอนานนิดนึง',                           table: 'T-06', time: '11:10' },
    { order: '#ORD-028', rating: 5, text: 'ข้าวผัดกระเพราสุดยอด! จะกลับมาอีกแน่นอน',          table: 'T-02', time: '10:55' },
    { order: '#ORD-027', rating: 3, text: 'ปกติ ไม่มีอะไรพิเศษ',                               table: 'T-08', time: '10:30' },
    { order: '#ORD-026', rating: 5, text: 'อาหารสดใหม่ ปรุงร้อนๆ ถูกปากมาก',                  table: 'T-01', time: '10:10' },
    { order: '#ORD-025', rating: 4, text: 'Green curry was excellent, nicely balanced',         table: 'T-11', time: '09:50' },
    { order: '#ORD-024', rating: 2, text: 'รสชาติไม่ค่อยจัด อยากให้เผ็ดกว่านี้',              table: 'T-03', time: '09:20' },
    { order: '#ORD-023', rating: 5, text: 'ทุกอย่างสมบูรณ์แบบ ประทับใจมาก',                   table: 'T-07', time: '09:00' },
];


// Style maps
const STAR_LABEL = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' };
const BAR_COLOR  = { 5: 'bg-green-400', 4: 'bg-blue-400', 3: 'bg-yellow-400', 2: 'bg-orange-400', 1: 'bg-red-400' };
const BADGE_BG   = { 5: 'bg-green-100 text-green-700', 4: 'bg-blue-100 text-blue-700', 3: 'bg-yellow-100 text-yellow-700', 2: 'bg-orange-100 text-orange-700', 1: 'bg-red-100 text-red-700' };


// Stats
function renderStats() {
    const total     = reviews.length;
    const avg       = (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1);
    const fiveStars = reviews.filter(r => r.rating === 5).length;

    const statItems = [
        { value: avg,       label: 'Avg Rating',    icon: '⭐', color: 'text-yellow-500' },
        { value: total,     label: 'Total Reviews',  icon: '💬', color: 'text-blue-500'   },
        { value: fiveStars, label: '5-Star',         icon: '🏆', color: 'text-green-500'  },
    ];

    document.getElementById('stats').innerHTML = statItems.map(s => `
        <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <div class="text-2xl mb-1">${s.icon}</div>
            <div class="text-2xl font-bold ${s.color}">${s.value}</div>
            <div class="text-xs text-gray-400 mono uppercase tracking-wider mt-1">${s.label}</div>
        </div>
    `).join('');
}


// Rating breakdown bars
function renderBreakdown() {
    const total = reviews.length;

    document.getElementById('breakdown').innerHTML = [5, 4, 3, 2, 1].map(n => {
        const count = reviews.filter(r => r.rating === n).length;
        const pct   = total ? Math.round(count / total * 100) : 0;

        return `
            <div class="flex items-center gap-3 mb-3">
                <span class="text-yellow-400 text-sm w-24 shrink-0 mono">${STAR_LABEL[n]}</span>
                <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="${BAR_COLOR[n]} h-2 rounded-full transition-all" style="width:${pct}%"></div>
                </div>
                <span class="text-xs text-gray-400 mono w-4 text-right">${count}</span>
            </div>
        `;
    }).join('');
}


// Review cards
function renderReviewGrid() {
    document.getElementById('review-grid').innerHTML = reviews.map(r => {
        const stars = Array.from({ length: 5 }, (_, i) =>
            `<span class="${i < r.rating ? 'text-yellow-400' : 'text-gray-200'}">★</span>`
        ).join('');

        return `
            <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div class="flex justify-between items-start mb-2">
                    <span class="mono text-yellow-500 text-xs font-medium">${r.order}</span>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_BG[r.rating]}">${r.rating}.0</span>
                </div>
                <div class="text-base mb-2">${stars}</div>
                <p class="text-sm text-gray-600 leading-relaxed">${r.text}</p>
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 mono">
                    <span>Table ${r.table}</span>
                    <span>${r.time}</span>
                </div>
            </div>
        `;
    }).join('');
}


// Init
renderStats();
renderBreakdown();
renderReviewGrid();