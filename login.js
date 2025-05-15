// login.js
// Handle login for both admin and test user

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;  // Only run on login page

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    errorMsg.style.display = 'none';

    // Test user accounts (admin now uses 'admin')
    const accounts = {
      admin: { password: 'admin',    role: 'admin' },
      user:  { password: 'user123',  role: 'user'  }
    };

    const account = accounts[username];
    if (account && account.password === password) {
      sessionStorage.setItem('role', account.role);
      // Redirect based on role
      window.location.href = account.role === 'admin' ? 'admin.html' : 'index.html';
    } else {
      errorMsg.textContent = 'Neplatné přihlašovací údaje.';
      errorMsg.style.display = 'block';
    }
  });
});
