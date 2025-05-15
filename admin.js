// admin.js - Automatic Stock Control with Quantity Counts
// Handles Admin panel quantity management and User stock-filtering based on counts

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'stockStatus';
  let stockStatus = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  const productList = [
    { id: 'body_milk', name: 'Tělové mléko' },
    { id: 'body_souffle', name: 'Tělové suflé' },
    { id: 'body_butter', name: 'Tělové máslo' },
    { id: 'argan_gel', name: 'Čistý arganový gel' },
    { id: 'dry_body_oil', name: 'Suchý tělový olej' },
    { id: 'shimmer_body_oil', name: 'Třpytivý tělový olej' },
    { id: 'night_serum', name: 'Noční sérum' },
    { id: 'brumes_du_maroc', name: 'Brumes du Maroc' },
    { id: 'body_scrub', name: 'Tělový peeling' },
    { id: 'soap', name: 'Mýdlo' },
    { id: 'shower_gel', name: 'Sprchový gel' },
    { id: 'hand_soap', name: 'Mýdlo na ruce' }
  ];

  function saveStatus() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stockStatus));
  }

  // Function to generate badge style based on count
  function badgeStyle(count) {
    let bg = 'gray', color = '#fff';
    if (count >= 5)       { bg = 'green'; color = '#fff'; }
    else if (count >= 3)  { bg = 'orange'; color = '#000'; }
    else if (count >= 1)  { bg = 'red';   color = '#fff'; }
    return `display:inline-block; padding:0.25rem 0.5rem; border-radius:0.25rem; background:${bg}; color:${color};`;
  }

  // ADMIN PANEL
  const adminList = document.getElementById('admin-list');
  if (adminList) {
    const role = sessionStorage.getItem('role');
    if (role !== 'admin') {
      window.location.href = 'login.html'; return;
    }

    // Search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Hledat produkt…';
    searchInput.style = 'width:100%; padding:0.5rem; margin-bottom:1rem; border-radius:0.5rem; border:none;';
    adminList.before(searchInput);

    // Bulk controls
    const bulkDiv = document.createElement('div');
    bulkDiv.style = 'margin-bottom:1rem; display:flex; gap:0.5rem;';
    const btnAllIn = document.createElement('button'); btnAllIn.textContent = 'Vše +5';
    const btnMedium = document.createElement('button'); btnMedium.textContent = 'Vše 3-4';
    const btnLow = document.createElement('button');    btnLow.textContent = 'Vše 1';
    const btnOut = document.createElement('button');    btnOut.textContent = 'Vše 0';
    [btnAllIn, btnMedium, btnLow, btnOut].forEach(btn => {
      btn.style = 'padding:0.5rem 1rem; border:none; border-radius:0.5rem; cursor:pointer;';
      bulkDiv.appendChild(btn);
    });
    adminList.before(bulkDiv);

    function renderList(filter = '') {
      adminList.innerHTML = '';
      productList.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(p => {
          const count = stockStatus[p.id] != null ? stockStatus[p.id] : 0;
          const card = document.createElement('div');
          card.className = 'service-card';
          card.style = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;';
          card.innerHTML = `
            <span>${p.name}</span>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <input type="number" min="0" value="${count}" data-id="${p.id}" style="width:60px; padding:0.25rem; border-radius:0.25rem; border:1px solid #ccc;" />
              <span style="${badgeStyle(count)}">${count}</span>
            </div>
          `;
          adminList.appendChild(card);
        });
    }

    renderList();
    searchInput.addEventListener('input', e => renderList(e.target.value));

    // Bulk actions
    btnAllIn.addEventListener('click', () => { productList.forEach(p => stockStatus[p.id] = 5); saveStatus(); renderList(searchInput.value); });
    btnMedium.addEventListener('click', () => { productList.forEach(p => stockStatus[p.id] = 3); saveStatus(); renderList(searchInput.value); });
    btnLow.addEventListener('click',    () => { productList.forEach(p => stockStatus[p.id] = 1); saveStatus(); renderList(searchInput.value); });
    btnOut.addEventListener('click',    () => { productList.forEach(p => stockStatus[p.id] = 0); saveStatus(); renderList(searchInput.value); });

    // Listen for individual count changes
    adminList.addEventListener('change', e => {
      if (e.target.matches('input[type=number][data-id]')) {
        const id = e.target.dataset.id;
        const val = parseInt(e.target.value) || 0;
        stockStatus[id] = val;
        saveStatus();
        renderList(searchInput.value);
      }
    });

    return;
  }

  // USER-FACING: hide out of stock
  document.querySelectorAll('.service-card[data-id]').forEach(card => {
    const id = card.dataset.id;
    const count = stockStatus[id] != null ? stockStatus[id] : 0;
    if (count <= 0) {
      card.style.display = 'none';
    }
  });
});
// Add event listener to the "Add to Cart" button\
document.addEventListener('click', (event) => {
  if (event.target.matches('.add-to-cart')) {
    const productId = event.target.dataset.productId;
    const count = stockStatus[productId] != null ? stockStatus[productId] : 0;
    if (count <= 0) {
      event.preventDefault();
      alert('Tento produkt je momentálně vyprodán.');
    }
  }
});
