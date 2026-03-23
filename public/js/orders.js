
  const cookName = sessionStorage.getItem('cookName') || 'Cook';
  document.getElementById('cookName').textContent = cookName;

  function logout() { sessionStorage.clear(); window.location.href = '/views/login.html'; }

  function startCooking(btn) {
    const card = btn.closest('.card');
    if (card.classList.contains('pending')) {
      card.classList.remove('pending');
      card.classList.add('cooking');
      btn.innerText = "Cooking...";
      btn.classList.remove("bg-green-700");
      btn.classList.add("bg-yellow-400");
      setTab('cooking');
    } else if (card.classList.contains('cooking')) {
      card.classList.remove('cooking');
      card.classList.add('serving');
      btn.outerHTML = `<span class="text-green-700 font-semibold text-sm">✔ Done</span>`;
      setTab('serving');
    }
  }

  function setTab(tab) {
    document.querySelectorAll(".tab").forEach(t => {
      t.classList.remove("bg-green-700", "text-white");
      t.classList.add("bg-gray-200", "text-gray-600");
    });
    const active = document.getElementById("tab-" + tab);
    active.classList.add("bg-green-700", "text-white");
    active.classList.remove("bg-gray-200", "text-gray-600");

    document.querySelectorAll(".card").forEach(card => {
      card.style.display = "none";
      if (card.classList.contains(tab)) card.style.display = "block";
    });
  }

  setTab('pending');
