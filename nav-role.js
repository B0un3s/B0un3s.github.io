// nav-role.js
// Runs on every page with your main navbar

document.addEventListener('DOMContentLoaded', () => {
  const role = sessionStorage.getItem('role');
  if (role !== 'admin') return;  // only admins get the extra menu item

  // find your <ul> in the .navbar
  const navUL = document.querySelector('.navbar nav ul');
  if (!navUL) return;

  // build the stock-control icon link
  const li = document.createElement('li');
  const a  = document.createElement('a');
  a.href      = 'admin.html';      // or wherever your stock-control page lives
  a.title     = 'Stock Control';
  a.innerHTML = '📦';              // choose any icon you like
  li.appendChild(a);

  navUL.appendChild(li);
});
