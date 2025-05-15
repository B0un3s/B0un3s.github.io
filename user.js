document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      themeBtn.textContent = document.body.classList.contains('dark') ? '🌙' : '🌞';
    });
  }

  // Reservation modal (optional)
  const reserveButtons = document.querySelectorAll('.reserve-btn');
  const modal = document.getElementById('reserve-modal');
  const modalText = document.getElementById('modal-text');
  const closeBtn = document.getElementById('close-modal');
  const confirmBtn = document.getElementById('confirm-btn');
  reserveButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modalText.textContent = `Rezervace: ${btn.dataset.product}`;
      modal.classList.remove('hidden');
    });
  });
  closeBtn?.addEventListener('click', () => modal.classList.add('hidden'));
  window.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
  confirmBtn?.addEventListener('click', () => {
    alert('Rezervace potvrzena!');
    modal.classList.add('hidden');
  });

  // E-shop stock filtering: hide cards with data-id marked false in localStorage
  const stock = JSON.parse(localStorage.getItem('stockStatus') || '{}');
  document.querySelectorAll('.service-card[data-id]').forEach(card => {
    const id = card.dataset.id;
    if (stock[id] === false) card.style.display = 'none';
  });
});