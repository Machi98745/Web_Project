// Redirect already-logged-in users straight to orders
if (sessionStorage.getItem('cookId')) {
    window.location.href = '/cook/view/orders.html';
}

// Switch between login / register card 
function switchCard(view) {
    document.getElementById('loginCard').classList.toggle('hidden', view !== 'login');
    document.getElementById('registerCard').classList.toggle('hidden', view !== 'register');
 
    document.getElementById('loginErr').classList.add('hidden');
    document.getElementById('regErr').classList.add('hidden');
    document.getElementById('regOk').classList.add('hidden');

    loadCooks(view);
}


// Load cooks for dropdown
async function loadCooks(type) {
    try {
        const res = await fetch(`/cook/cooks-list?type=${type}`);
        if (!res.ok) throw new Error('Failed to load cooks');
        const cooks = await res.json();
        const selectId = type === 'register' ? 'regCookId' : 'cookId';
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Cook ID</option>';
        cooks.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.username;
            opt.textContent = c.username;
            select.appendChild(opt);
        });
    } catch (e) {
        console.error('Error loading cooks:', e);
    }
}


// Login
async function doLogin() {
    const cookId = document.getElementById('cookId').value.trim();
    const password = document.getElementById('cookPass').value;
    const errBanner = document.getElementById('loginErr');
 
    errBanner.classList.add('hidden');
 
    if (!cookId || !password) {
        errBanner.classList.remove('hidden');
        return;
    }
 
    try {
        const res = await fetch('/cook/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cookId, password }) 
        });
 
        if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem('cookId', data.cookId);
            sessionStorage.setItem('cookName', data.name); 
            window.location.href = '/cook/view/orders.html'; 
        } else {
              const errorData = await res.json().catch(() => ({}));
              errBanner.classList.remove('hidden');
              const span = errBanner.querySelector('span');
              const note = errorData.note ? (' — ' + errorData.note) : '';
              span.textContent = (errorData.message || 'Login failed') + note;
              console.error(errorData.message, errorData.note);
        }
    } catch (e) {
        console.error("Connection error:", e);
        Swal.fire({ icon: 'error', title: 'Connection error', text: 'Cannot connect to server', confirmButtonColor: '#3085d6' });
    }
}


// Register
async function doRegister() {
    const cookId = document.getElementById('regCookId').value.trim();
    const pass   = document.getElementById('regPass').value;

    const err    = document.getElementById('regErr');
    const errMsg = document.getElementById('regErrMsg');
    const ok     = document.getElementById('regOk');

    err.classList.add('hidden');
    ok.classList.add('hidden');

    if (!cookId)         { showRegError(errMsg, err, 'Please enter the Cook ID provided by admin'); return; }
    if (pass.length < 4) { showRegError(errMsg, err, 'Password must be at least 4 characters'); return; }

    try {
        const res = await fetch('/cook/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cookId: cookId, password: pass })
        });

        if (res.status === 200) {
            // Registration successful - return to login (no auto-login)
            ok.classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('regPass').value = '';
                document.getElementById('regCookId').value = '';
                ok.classList.add('hidden');
                switchCard('login');
                Swal.fire({ icon: 'success', title: 'Registered', text: 'You can now login using your Cook ID and password.', confirmButtonColor: '#3085d6' });
            }, 900);
        } else if (res.status === 404) {
            showRegError(errMsg, err, 'Cook ID not found. Please ask admin to create your Cook ID.');
        } else if (res.status === 409) {
            showRegError(errMsg, err, 'Cook ID already active. Cannot register.');
        } else {
            const data = await res.json().catch(() => ({}));
            showRegError(errMsg, err, data.message || 'Registration failed. Please try again.');
        }
    } catch (e) {
        showRegError(errMsg, err, 'Cannot connect to server. Please try again.');
    }
}

function showRegError(msgEl, bannerEl, message) {
    msgEl.textContent = message;
    bannerEl.classList.remove('hidden');
}


// Enter key support
document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const onLogin = !document.getElementById('loginCard').classList.contains('hidden');
    onLogin ? doLogin() : doRegister();
});

loadCooks('login');