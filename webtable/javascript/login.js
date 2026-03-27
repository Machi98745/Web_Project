  function login() {
            const table = document.getElementById('tableInput').value;
            if(!table) return alert("Please enter a table number");
            localStorage.setItem('kitchen_table', table);
            localStorage.setItem('kitchen_user_id', `T${table}-${Date.now()}`);
            localStorage.setItem('kitchen_is_paid', 'false');
            location.href = 'menu.html';
        }