document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.mobile-menu');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
    });

    // Fecha o menu ao clicar fora
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
        nav.classList.remove('active');
      }
    });
  }
});
