/* ============================================
   SITE HEADER
   Injects the shared header (logo + nav) into <header id="site-header">.
   Auto-marks the current page link with class="active".
   ============================================ */

(function () {
  'use strict';

  const header = document.getElementById('site-header');
  if (!header) return;

  // Detect current page filename (defaults to index.html for root '/')
  const path = window.location.pathname.split('/').pop() || 'index.html';

  // Build nav links — mark current page as active
  const navItems = [
    { href: 'index.html',    label: 'Home' },
    { href: 'about.html',    label: 'About' },
    { href: 'contacts.html', label: 'Contact' },
  ];
  const navLinks = navItems.map(item => {
    const active = item.href === path ? ' class="active"' : '';
    return `<li><a href="${item.href}"${active}>${item.label}</a></li>`;
  }).join('\n          ');

  header.classList.add('site-header');
  header.innerHTML = `
    <div class="container">
      <a href="index.html" class="site-brand">
        <h1>Tiago Ferrao</h1>
        <span class="subtitle">Digital Innovator</span>
      </a>
      <button class="nav-toggle" aria-label="Toggle navigation">
        <!-- Icon: ui-nav-toggle (img/icons/ui-nav-toggle.svg) -->
        <svg viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
      </button>
      <nav class="site-nav">
        <ul>
          ${navLinks}
        </ul>
      </nav>
    </div>
  `;
})();
