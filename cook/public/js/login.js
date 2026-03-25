function getCooks() {
            const stored = localStorage.getItem('cooks');
            if (stored) return JSON.parse(stored);
            const defaults = {
                'COOK-001': { name: 'Khiaongo', pass: 'pass1' },
                'COOK-002': { name: 'Somchai', pass: 'pass2' },
                'COOK-003': { name: 'Malee', pass: 'pass3' }
            };
            localStorage.setItem('cooks', JSON.stringify(defaults));
            return defaults;
        }
 
        function switchCard(view) {
            document.getElementById('loginCard').classList.toggle('hidden', view !== 'login');
            document.getElementById('registerCard').classList.toggle('hidden', view !== 'register');
            document.getElementById('loginErr').classList.add('hidden');
            document.getElementById('regErr').classList.add('hidden');
            document.getElementById('regOk').classList.add('hidden');
        }
 
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
 
        function doRegister() {
            const id = document.getElementById('regId').value.trim().toUpperCase();
            const name = document.getElementById('regName').value.trim();
            const pass = document.getElementById('regPass').value;
            const pass2 = document.getElementById('regPass2').value;
            const err = document.getElementById('regErr');
            const errMsg = document.getElementById('regErrMsg');
            const ok = document.getElementById('regOk');
 
            err.classList.add('hidden');
            ok.classList.add('hidden');
 
            if (!id.match(/^COOK-\d{3}$/)) { errMsg.textContent = 'Cook ID must be format COOK-XXX'; err.classList.remove('hidden'); return; }
            if (!name) { errMsg.textContent = 'Please enter a display name'; err.classList.remove('hidden'); return; }
            if (pass.length < 4) { errMsg.textContent = 'Password must be at least 4 characters'; err.classList.remove('hidden'); return; }
            if (pass !== pass2) { errMsg.textContent = 'Passwords do not match'; err.classList.remove('hidden'); return; }
 
            const cooks = getCooks();
            if (cooks[id]) { errMsg.textContent = 'Cook ID already exists'; err.classList.remove('hidden'); return; }
 
            cooks[id] = { name, pass };
            localStorage.setItem('cooks', JSON.stringify(cooks));
            ok.classList.remove('hidden');
 
            setTimeout(() => {
                ['regId', 'regName', 'regPass', 'regPass2'].forEach(f => document.getElementById(f).value = '');
                ok.classList.add('hidden');
                switchCard('login');
                document.getElementById('cookId').value = id;
            }, 1500);
        }
 
        document.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                if (!document.getElementById('loginCard').classList.contains('hidden')) doLogin();
                else doRegister();
            }
        });