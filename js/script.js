// === CURSOR SHINE EFFECT ===
const cursorShine = document.createElement("div");
cursorShine.style.position = "fixed";
cursorShine.style.width = "30px";
cursorShine.style.height = "30px";
cursorShine.style.borderRadius = "50%";
cursorShine.style.pointerEvents = "none";
cursorShine.style.background = "radial-gradient(circle, #00f6ff, transparent)";
cursorShine.style.opacity = "0.4";
cursorShine.style.zIndex = "9999";
document.body.appendChild(cursorShine);

document.addEventListener("mousemove", (e) => {
  cursorShine.style.left = `${e.clientX - 15}px`;
  cursorShine.style.top = `${e.clientY - 15}px`;
});
// === SCROLL TO TOP BUTTON ===
const scrollToTopBtn = document.createElement("button");
scrollToTopBtn.textContent = "↑";
scrollToTopBtn.style.position = "fixed";
scrollToTopBtn.style.bottom = "20px";
scrollToTopBtn.style.right = "20px";
scrollToTopBtn.style.padding = "10px 15px";
scrollToTopBtn.style.border = "none";
scrollToTopBtn.style.borderRadius = "5px";
scrollToTopBtn.style.background = "#00f6ff";
scrollToTopBtn.style.color = "#fff";
scrollToTopBtn.style.cursor = "pointer";
scrollToTopBtn.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
scrollToTopBtn.style.display = "none";
document.body.appendChild(scrollToTopBtn);

scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollToTopBtn.style.display = "block";
  } else {
    scrollToTopBtn.style.display = "none";
  }
});
