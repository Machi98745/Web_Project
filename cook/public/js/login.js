// ─── Cooks store ─────────────────────────────────────────────────────────────
function getCooks() {
    const stored = localStorage.getItem('cooks');
    if (stored) return JSON.parse(stored);

    // default accounts ถ้ายังไม่มีใน localStorage
    const defaults = {
        'COOK-001': { name: 'Khiaongo', pass: 'pass1' },
        'COOK-002': { name: 'Somchai',  pass: 'pass2' },
        'COOK-003': { name: 'Malee',    pass: 'pass3' },
    };
    localStorage.setItem('cooks', JSON.stringify(defaults));
    return defaults;
}


// ─── Switch between login / register card ─────────────────────────────────────
function switchCard(view) {
    document.getElementById('loginCard').classList.toggle('hidden', view !== 'login');
    document.getElementById('registerCard').classList.toggle('hidden', view !== 'register');

    // clear error banners when switching
    document.getElementById('loginErr').classList.add('hidden');
    document.getElementById('regErr').classList.add('hidden');
    document.getElementById('regOk').classList.add('hidden');
}


// ─── Login ────────────────────────────────────────────────────────────────────
function doLogin() {
    const id = document.getElementById('cookId').value.trim().toUpperCase();
    const pw = document.getElementById('cookPass').value;
    const err = document.getElementById('loginErr');

    const cooks = getCooks();

    if (cooks[id] && cooks[id].pass === pw) {
        sessionStorage.setItem('cookId', id);
        sessionStorage.setItem('cookName', cooks[id].name);
        window.location.href = '/cook/view/orders.html';
    } else {
        err.classList.remove('hidden');
        setTimeout(() => err.classList.add('hidden'), 3000);
    }
}


// ─── Register ─────────────────────────────────────────────────────────────────
function doRegister() {
    const id    = document.getElementById('regId').value.trim().toUpperCase();
    const name  = document.getElementById('regName').value.trim();
    const pass  = document.getElementById('regPass').value;
    const pass2 = document.getElementById('regPass2').value;

    const err    = document.getElementById('regErr');
    const errMsg = document.getElementById('regErrMsg');
    const ok     = document.getElementById('regOk');

    err.classList.add('hidden');
    ok.classList.add('hidden');

    // validation
    if (!id.match(/^COOK-\d{3}$/))  { showRegError(errMsg, err, 'Cook ID must be format COOK-XXX'); return; }
    if (!name)                        { showRegError(errMsg, err, 'Please enter a display name');     return; }
    if (pass.length < 4)              { showRegError(errMsg, err, 'Password must be at least 4 characters'); return; }
    if (pass !== pass2)               { showRegError(errMsg, err, 'Passwords do not match');          return; }

    const cooks = getCooks();
    if (cooks[id])                    { showRegError(errMsg, err, 'Cook ID already exists');          return; }

    // save
    cooks[id] = { name, pass };
    localStorage.setItem('cooks', JSON.stringify(cooks));
    ok.classList.remove('hidden');

    // redirect back to login after a moment
    setTimeout(() => {
        ['regId', 'regName', 'regPass', 'regPass2'].forEach(id => {
            document.getElementById(id).value = '';
        });
        ok.classList.add('hidden');
        switchCard('login');
        document.getElementById('cookId').value = id;
    }, 1500);
}

function showRegError(msgEl, bannerEl, message) {
    msgEl.textContent = message;
    bannerEl.classList.remove('hidden');
}


// ─── Enter key support ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const onLogin = !document.getElementById('loginCard').classList.contains('hidden');
    onLogin ? doLogin() : doRegister();
});