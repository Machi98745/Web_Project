if (sessionStorage.getItem('tableNumber')) {
    window.location.href = '/customer/view/menu.html';
}

async function doLogin() {
    const tableNumberInput = document.getElementById('tableNumber').value.trim();
    const errBanner = document.getElementById('loginErr');
    errBanner.classList.add('hidden');
    
    const tableNum = parseInt(tableNumberInput);
    if (!tableNumberInput || isNaN(tableNum) || tableNum < 1 || tableNum > 8) {
        errBanner.textContent = "Please enter a valid table number (1-8)";
        errBanner.classList.remove('hidden');
        return;
    }

    try {
        const res = await fetch('/customer/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableNumber: tableNum }) 
        });

        if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem('tableNumber', data.tableNumber);
            sessionStorage.setItem('customerId', data.customerId);
            window.location.href = '/customer/view/menu.html';
        } else {
            const errorData = await res.json();
            errBanner.textContent = errorData.message || "Login failed";
            errBanner.classList.remove('hidden');
        }
    } catch (e) {
        console.error(e);
    }
}