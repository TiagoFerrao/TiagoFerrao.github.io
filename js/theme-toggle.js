/* ============================================
   THEME TOGGLE BUTTON
   Injects the floating theme-toggle button.
   The click behaviour itself lives in js/main.js.
   ============================================ */

(function () {
  'use strict';

  const mount = document.getElementById('theme-toggle');
  if (!mount) return;

  mount.classList.add('theme-toggle');
  mount.setAttribute('aria-label', 'Switch theme');
  mount.setAttribute('title', 'Switch theme');
  mount.innerHTML = `
    <!-- Icon: ui-theme-toggle-moon (img/icons/ui-theme-toggle-moon.svg) -->
    <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>
  `;
})();
