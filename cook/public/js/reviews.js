// Auth
let cookName = "Cook";
document.getElementById("cookName").textContent = cookName;

async function loadCookNameFromServer() {
  try {
    const cached = sessionStorage.getItem("cookName");
    if (cached) {
      cookName = cached;
      document.getElementById("cookName").textContent = cookName;
      return;
    }

    const cookId = sessionStorage.getItem("cookId");
    if (!cookId) return;

    const res = await fetch(`/cook/info?cookId=${encodeURIComponent(cookId)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.name) {
      cookName = data.name;
      sessionStorage.setItem("cookName", cookName);
      document.getElementById("cookName").textContent = cookName;
    }
  } catch (e) {
    console.error("Failed to load cook name", e);
  }
}

// Try to load cook name immediately
loadCookNameFromServer();
function logout() {
  sessionStorage.clear();
  window.location.href = "/cook/view/login.html";
}

// Review data (loaded from server)
let reviews = [];
let currentPage = 1;
const pageSize = 9;

function getReviewQueryParams() {
  const start = document.getElementById("review-start")?.value;
  const end = document.getElementById("review-end")?.value;
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);
  return params.toString();
}

async function loadCookReviews() {
  try {
    const query = getReviewQueryParams();
    const res = await fetch("/cook/reviews" + (query ? `?${query}` : ""));
    if (!res.ok) throw new Error("Failed to fetch reviews");
    const data = await res.json();

    // map server rows into frontend-friendly objects
    reviews = (data || []).map((r) => {
      const ratingValue = r.rating != null ? Number(r.rating) : null;
      return {
        order: r.review_id ? `#REV-${r.review_id}` : "-",
        rating: Number.isFinite(ratingValue) ? ratingValue : null,
        text: r.comment || r.text || "-",
        table: r.table_number ? `T-${r.table_number}` : "-",
        time: r.created_at ? new Date(r.created_at).toLocaleTimeString() : "-",
      };
    });

    currentPage = 1;
    renderStats();
    renderBreakdown();
    renderReviewGrid();
    updateReviewCount();
    renderPagination();
  } catch (err) {
    console.error("loadCookReviews error", err);
    document.getElementById("review-count").textContent = "Unable to load reviews.";
  }
}

function applyReviewFilter() {
  currentPage = 1;
  loadCookReviews();
}

function clearReviewFilter() {
  const start = document.getElementById("review-start");
  const end = document.getElementById("review-end");
  if (start) start.value = "";
  if (end) end.value = "";
  applyReviewFilter();
}

// Style maps
const STAR_LABEL = {
  5: "★★★★★",
  4: "★★★★☆",
  3: "★★★☆☆",
  2: "★★☆☆☆",
  1: "★☆☆☆☆",
};
const BAR_COLOR = {
  5: "bg-green-400",
  4: "bg-blue-400",
  3: "bg-yellow-400",
  2: "bg-orange-400",
  1: "bg-red-400",
};
const BADGE_BG = {
  5: "bg-green-100 text-green-700",
  4: "bg-blue-100 text-blue-700",
  3: "bg-yellow-100 text-yellow-700",
  2: "bg-orange-100 text-orange-700",
  1: "bg-red-100 text-red-700",
};

// Stats
function renderStats() {
  const total = reviews.length;
  const rated = reviews.filter((r) => typeof r.rating === "number");
  const avg = rated.length
    ? (rated.reduce((sum, r) => sum + r.rating, 0) / rated.length).toFixed(1)
    : "-";
  const fiveStars = rated.filter((r) => r.rating === 5).length;

  const statItems = [
    { value: avg, label: "Avg Rating", icon: "⭐", color: "text-yellow-500" },
    {
      value: total,
      label: "Total Reviews",
      icon: "💬",
      color: "text-blue-500",
    },
    { value: fiveStars, label: "5-Star", icon: "🏆", color: "text-green-500" },
  ];

  document.getElementById("stats").innerHTML = statItems
    .map(
      (s) => `
        <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
            <div class="text-2xl mb-1">${s.icon}</div>
            <div class="text-2xl font-bold ${s.color}">${s.value}</div>
            <div class="text-xs text-gray-400 mono uppercase tracking-wider mt-1">${s.label}</div>
        </div>
    `,
    )
    .join("");
}

// Rating breakdown bars
function renderBreakdown() {
  const total = reviews.length;
  document.getElementById("breakdown").innerHTML = [5, 4, 3, 2, 1]
    .map((n) => {
      const count = reviews.filter((r) => r.rating === n).length;
      const pct = total ? Math.round((count / total) * 100) : 0;

      return `
            <div class="flex items-center gap-3 mb-3">
                <span class="text-yellow-400 text-sm w-24 shrink-0 mono">${STAR_LABEL[n]}</span>
                <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="${BAR_COLOR[n]} h-2 rounded-full transition-all" style="width:${pct}%"></div>
                </div>
                <span class="text-xs text-gray-400 mono w-4 text-right">${count}</span>
            </div>
        `;
    })
    .join("");
}

// Review cards
function renderReviewGrid() {
  const grid = document.getElementById("review-grid");
  if (!reviews.length) {
    grid.innerHTML = `
      <div class="col-span-full bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500">
        <p class="text-lg font-semibold mb-2">No reviews available yet</p>
        <p class="text-sm">Once customers submit feedback, reviews will appear here.</p>
      </div>
    `;
    return;
  }

  const start = (currentPage - 1) * pageSize;
  const pageReviews = reviews.slice(start, start + pageSize);

  grid.innerHTML = pageReviews
    .map((r) => {
      const stars =
        typeof r.rating === "number"
          ? Array.from(
              { length: 5 },
              (_, i) =>
                `<span class="${i < r.rating ? "text-yellow-400" : "text-gray-200"}">★</span>`,
            ).join("")
          : '<span class="text-xs text-gray-400">No rating</span>';

      const badge =
        typeof r.rating === "number"
          ? `<span class="text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_BG[r.rating]}">${r.rating}.0</span>`
          : "";

      return `
            <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div class="flex justify-between items-start mb-2 gap-3">
                    <span class="mono text-yellow-500 text-xs font-medium">${r.order}</span>
                    ${badge}
                </div>
                <div class="text-base mb-2">${stars}</div>
                <p class="text-sm text-gray-600 leading-relaxed min-h-[3rem] break-words">${r.text}</p>
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 mono gap-2">
                    <span>${r.table}</span>
                    <span>${r.time}</span>
                </div>
            </div>
        `;
    })
    .join("");
}

function renderPagination() {
  const controls = document.getElementById("pagination-controls");
  if (!controls) return;

  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  if (totalPages <= 1) {
    controls.innerHTML = "";
    return;
  }

  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pages.push(`
      <button class="btn btn-xs ${currentPage === i ? 'btn-primary' : 'btn-ghost'}" onclick="gotoPage(${i})">${i}</button>
    `);
  }

  controls.innerHTML = `
    <button class="btn btn-xs btn-outline" ${currentPage === 1 ? 'disabled' : ''} onclick="gotoPage(${currentPage - 1})">Prev</button>
    ${pages.join('')}
    <button class="btn btn-xs btn-outline" ${currentPage === totalPages ? 'disabled' : ''} onclick="gotoPage(${currentPage + 1})">Next</button>
  `;
}

function gotoPage(page) {
  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderReviewGrid();
  renderPagination();
}

function updateReviewCount() {
  const countEl = document.getElementById("review-count");
  if (!countEl) return;
  countEl.textContent = reviews.length
    ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}`
    : "No reviews found.";
}

// Init
loadCookReviews();

