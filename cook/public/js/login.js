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
        alert("Cannot connect to server");
    }
}


// Register
async function doRegister() {
    const pass   = document.getElementById('regPass').value;

    const err    = document.getElementById('regErr');
    const errMsg = document.getElementById('regErrMsg');
    const ok     = document.getElementById('regOk');

    err.classList.add('hidden');
    ok.classList.add('hidden');

    if (!cookId)         { showRegError(errMsg, err, 'Please enter a Cook ID'); return; }
    if (pass.length < 4) { showRegError(errMsg, err, 'Password must be at least 4 characters'); return; }

    try {
        const res = await fetch('/cook/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
        });

        if (res.status === 201) {
            const data = await res.json().catch(() => ({}));
            ok.classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('regPass').value = '';
                ok.classList.add('hidden');
                switchCard('login');
                if (data.cookId) {
                    alert('Registered. Your Cook ID: ' + data.cookId + '\nWait for admin to enable your account.');
                    document.getElementById('cookId').value = data.cookId;
                }
            }, 1200);
        } else if (res.status === 409) {
            showRegError(errMsg, err, 'Cook ID already exists');
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