    let grandTotal = 0; 

    async function renderPayment() {
        const orderIds = JSON.parse(sessionStorage.getItem('allOrderIds')) || [];
        const summary = document.getElementById('bill-summary');
        const totalDisplay = document.getElementById('grand-total');

        if (orderIds.length === 0) {
            summary.innerHTML = "<p class='text-center text-slate-300 italic py-10'>No orders found.</p>";
            return;
        }

        try {
            const responses = await Promise.all(
                orderIds.map(id => 
                    fetch(`/customer/order-status/${id}`).then(r => r.json()).then(items => {
                        // Add order_id to each item from the response
                        return Array.isArray(items) ? items.map(item => ({ ...item, order_id: id })) : [{ ...items, order_id: id }];
                    })
                )
            );
            const allItems = responses.flat();

            // Group items by name
            const groupedItems = {};
            allItems.forEach(item => {
                if (!groupedItems[item.name]) {
                    groupedItems[item.name] = {
                        name: item.name,
                        price: item.price,
                        totalQty: 0,
                        items: []
                    };
                }
                groupedItems[item.name].totalQty += item.quantity;
                groupedItems[item.name].items.push(item);
            });

            grandTotal = 0;
            summary.innerHTML = Object.values(groupedItems).map((group, index) => {
                const groupTotal = group.price * group.totalQty;
                grandTotal += groupTotal;
                const detailsId = `details-${index}`;
                
                return `
                    <div class="py-2">
                        <div class="flex justify-between items-center py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 px-2 rounded transition-colors" 
                             onclick="toggleDetails('${detailsId}')">
                            <div class="flex flex-col flex-1">
                                <span class="font-bold text-slate-700">${group.name}</span>
                                <span class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Qty: ${group.totalQty}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-black text-slate-600">${groupTotal}฿</span>
                                <span id="arrow-${detailsId}" class="text-slate-400 transition-transform">▼</span>
                            </div>
                        </div>
                        <div id="${detailsId}" class="hidden pl-4 bg-slate-50 rounded">
                            ${group.items.map(item => `
                                <div class="text-xs py-2 text-slate-500 border-b border-slate-100 last:border-b-0">
                                    <span class="font-medium">Order #${item.order_id}</span> - Qty: ${item.quantity}
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
            }).join('');
            
            totalDisplay.innerHTML = `${grandTotal}<span class="text-amber-400 ml-1">฿</span>`;
            localStorage.setItem('temp_final_amount', grandTotal);
            
        } catch (e) {
            console.error("Error loading combined bill:", e);
            summary.innerHTML = "<p class='text-red-500 font-bold text-center'>Failed to load bill details.</p>";
        }
    }

    function toggleDetails(detailsId) {
        const detailsEl = document.getElementById(detailsId);
        const arrowEl = document.getElementById(`arrow-${detailsId}`);
        
        detailsEl.classList.toggle('hidden');
        arrowEl.classList.toggle('rotate-180');
    }

    async function processPayment() {
        const orderIds = JSON.parse(sessionStorage.getItem('allOrderIds')) || [];
        const customerId = sessionStorage.getItem('customerId');

        if (orderIds.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Orders',
                text: 'No orders to pay.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        try {
            const res = await fetch('/customer/complete-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: customerId,
                    orderIds: orderIds, 
                    totalPrice: grandTotal
                })
            });

            if (res.ok) {
                localStorage.setItem('last_paid_amount', grandTotal);
                Swal.fire({
                    icon: 'success',
                    title: 'Payment Successful',
                    text: 'Thank you!',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    window.location.href = 'review.html';
                });
            }
        } catch (e) {
            console.error("Payment Error:", e);
            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: 'Please contact staff.',
                confirmButtonColor: '#3085d6'
            });
        }
    }

    renderPayment();
