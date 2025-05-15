// eshop.js
// Hide out-of-stock products
// Add data-in-stock="false" to any .service-card div to mark it as unavailable

document.addEventListener('DOMContentLoaded', () => {
  const outOfStockCards = document.querySelectorAll('.service-card[data-in-stock="false"]');
  outOfStockCards.forEach(card => card.remove());
});
