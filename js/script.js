// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.service-card, main h2, .social-icon img').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});

// Reservation modal logic
const reserveButtons = document.querySelectorAll('.reserve-btn');
const modal = document.getElementById('reserve-modal');
const modalText = document.getElementById('modal-text');
const closeModalBtn = document.getElementById('close-modal');
const confirmBtn = document.getElementById('confirm-btn');

reserveButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const product = btn.getAttribute('data-product');
    modalText.textContent = `Chceš rezervovat "${product}". Potvrď svou rezervaci.`;
    modal.classList.remove('hidden');
  });
});

closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});

confirmBtn.addEventListener('click', () => {
  // TODO: send reservation data to server or store locally
  alert('Rezervace úspěšně odeslána! Těšíme se na Tebe.');
  modal.classList.add('hidden');
});

// AOS & Swiper (if used)
if (typeof AOS !== 'undefined') AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
if (typeof Swiper !== 'undefined') {
  new Swiper('.swiper-container', { loop: true, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }});
}
// Form validation
const form = document.getElementById('contact-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const submitBtn = document.getElementById('submit-btn');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const namePattern = /^[a-zA-Z\s]+$/;
const messagePattern = /^.{10,}$/;
const validateForm = () => {
  let valid = true;
  errorMessage.textContent = '';
  successMessage.textContent = '';

  if (!namePattern.test(nameInput.value)) {
    errorMessage.textContent += 'Jméno musí obsahovat pouze písmena a mezery.\n';
    valid = false;
  }
  if (!emailPattern.test(emailInput.value)) {
    errorMessage.textContent += 'Zadejte platnou e-mailovou adresu.\n';
    valid = false;
  }
  if (!messagePattern.test(messageInput.value)) {
    errorMessage.textContent += 'Zpráva musí mít alespoň 10 znaků.\n';
    valid = false;
  }
  return valid;
};
submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (validateForm()) {
    successMessage.textContent = 'Formulář byl úspěšně odeslán!';
    errorMessage.textContent = '';
   // TODO: send form data to server or store locally
    nameInput.value = '';
    emailInput.value = '';
    messageInput.value = '';
    }
    else {
        successMessage.textContent = '';
        errorMessage.textContent = 'Opravit chyby ve formuláři.';
        }
    }
);
// admin-toggle.js
document.addEventListener('DOMContentLoaded', () => {
  const ua = navigator.userAgent;
  // povol Windows, Mac a mobilní Android/iOS
  const isAllowed = /Windows NT|Macintosh|Android|iPhone|iPad/.test(ua);
  if (isAllowed) {
    const adminLi = document.querySelector('.admin-link');
    if (adminLi) adminLi.style.display = 'block';
  }
});
