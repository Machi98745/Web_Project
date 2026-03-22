
  const COOKS = { 'COOK-001': 'Khiaongo' };

  function doLogin() {
    const id = document.getElementById('cookId').value.trim().toUpperCase();
    const pw = document.getElementById('cookPass').value;
    const err = document.getElementById('err');
    if (COOKS[id] && pw.length >= 4) {
      sessionStorage.setItem('cookId', id);
      sessionStorage.setItem('cookName', COOKS[id]);
      window.location.href = '/views/reviews.html';
    } else {
      err.classList.remove('hidden');
    }
  }

  document.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
