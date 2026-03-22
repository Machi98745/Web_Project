
  const cookName = sessionStorage.getItem('cookName') || 'Cook';
  document.getElementById('cookName').textContent = cookName;

  function logout() { sessionStorage.clear(); window.location.href = '/views/login.html'; }

  const reviews = [
    { order:'#ORD-031', rating:5, text:'อาหารอร่อยมากๆ ครับ เสิร์ฟเร็ว ร้อน สด', table:'T-04', time:'11:30' },
    { order:'#ORD-028', rating:4, text:'รสชาติดี แต่รอนานนิดนึง', table:'T-06', time:'11:10' },
    { order:'#ORD-025', rating:5, text:'ข้าวผัดกระเพราสุดยอด! จะกลับมาอีกแน่นอน', table:'T-02', time:'10:55' },
    { order:'#ORD-022', rating:3, text:'ปกติ ไม่มีอะไรพิเศษ', table:'T-08', time:'10:30' },
    { order:'#ORD-019', rating:5, text:'อาหารสดใหม่ ปรุงร้อนๆ ถูกปากมาก', table:'T-01', time:'10:10' },
    { order:'#ORD-016', rating:4, text:'Green curry was excellent, nicely balanced', table:'T-11', time:'09:50' },
    { order:'#ORD-013', rating:2, text:'รสชาติไม่ค่อยจัด อยากให้เผ็ดกว่านี้', table:'T-03', time:'09:20' },
    { order:'#ORD-010', rating:5, text:'ทุกอย่างสมบูรณ์แบบ ประทับใจมาก', table:'T-07', time:'09:00' },
  ];

  const total = reviews.length;
  const avg = (reviews.reduce((s,r) => s + r.rating, 0) / total).toFixed(1);
  const five = reviews.filter(r => r.rating === 5).length;

  // Stats
  document.getElementById('stats').innerHTML = [
    { value: avg,   label: 'Avg Rating',     color: 'text-warning' },
    { value: total, label: 'Total Reviews',  color: 'text-info' },
    { value: five,  label: '5-Star Reviews', color: 'text-success' },
  ].map(s => `
    <div class="card bg-base-100 shadow">
      <div class="card-body items-center text-center py-5">
        <span class="text-4xl font-bold ${s.color}">${s.value}</span>
        <span class="text-xs text-base-content/40 tracking-widest uppercase">${s.label}</span>
      </div>
    </div>
  `).join('');

  // Breakdown bars
  document.getElementById('breakdown').innerHTML = [5,4,3,2,1].map(n => {
    const count = reviews.filter(r => r.rating === n).length;
    const pct = total ? Math.round(count/total*100) : 0;
    const stars = '★'.repeat(n) + '☆'.repeat(5-n);
    return `<div class="flex items-center gap-3 mb-2">
      <span class="text-warning text-sm w-20 shrink-0">${stars}</span>
      <progress class="progress progress-warning flex-1" value="${pct}" max="100"></progress>
      <span class="text-xs text-base-content/40 font-mono w-4 text-right">${count}</span>
    </div>`;
  }).join('');

  // Review cards
  const ratingColor = { 5:'badge-success', 4:'badge-info', 3:'badge-warning', 2:'badge-error', 1:'badge-error' };
  document.getElementById('review-grid').innerHTML = reviews.map(r => {
    const stars = Array.from({length:5}, (_,i) =>
      `<span class="${i < r.rating ? 'text-warning' : 'text-base-300'}">★</span>`
    ).join('');
    return `<div class="card bg-base-100 shadow hover:-translate-y-1 transition-transform">
      <div class="card-body gap-2">
        <div class="flex justify-between items-center">
          <span class="font-mono text-warning text-sm">${r.order}</span>
          <div class="badge ${ratingColor[r.rating]} badge-sm">${r.rating}.0</div>
        </div>
        <div class="text-lg">${stars}</div>
        <p class="text-sm text-base-content/80 leading-relaxed">${r.text}</p>
        <div class="flex justify-between text-xs text-base-content/40 pt-2 border-t border-base-300 mt-1">
          <span>Table ${r.table}</span>
          <span>${r.time}</span>
        </div>
      </div>
    </div>`;
  }).join('');
