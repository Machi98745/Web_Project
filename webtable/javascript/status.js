function initStatus() {
    const dishes = JSON.parse(localStorage.getItem('kitchen_active_dishes')) || [];
    const listContainer = document.getElementById('dish-tracker-list');
    const billBtn = document.getElementById('bill-btn');

    if (dishes.length === 0) {
        listContainer.innerHTML = "<p class='opacity-50 text-center'>No items being prepared.</p>";
        return;
    }

    const updateFeed = () => {
        const now = Date.now();
        let allFinished = true;

        listContainer.innerHTML = dishes.map((dish, index) => {
            const elapsed = now - dish.startTime;
            let statusLabel = "Pending";
            let statusClass = "badge-ghost";
            let icon = "🕒";

            if (elapsed > 10000) { // After 10s: Finished
                statusLabel = "Served";
                statusClass = "badge-success";
                icon = "✅";
            } else if (elapsed > 0) { // Starts immediately: Cooking
                statusLabel = "Cooking";
                statusClass = "badge-warning";
                icon = "🔥";
                allFinished = false;
            } else {
                allFinished = false;
            }

            return `
                <div class="flex justify-between items-center bg-base-200 p-3 rounded-lg border border-base-300">
                    <span class="font-medium">${icon} ${dish.name} ${index + 1}</span>
                    <span class="badge ${statusClass} badge-sm font-bold uppercase">${statusLabel}</span>
                </div>
            `;
        }).join('');

        // If every single dish is "Served", enable the bill button
        if (allFinished) {
            billBtn.disabled = false;
            billBtn.innerText = "Request Bill & Pay";
            billBtn.classList.replace('btn-neutral', 'btn-warning');
            billBtn.onclick = () => location.href = 'payment.html';
        } else {
            setTimeout(updateFeed, 1000);
        }
    };

    updateFeed();
}

window.onload = initStatus;