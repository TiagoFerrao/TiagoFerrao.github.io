/* ============================================
   SITE HEADER
   Injects the shared header (logo + nav) into <header id="site-header">.
   Auto-marks the current page link with class="active".
   The "Sections" dropdown makes the domain pages reachable from anywhere.
   ============================================ */

(function () {
  'use strict';

  const header = document.getElementById('site-header');
  if (!header) return;

  // Detect current page filename (defaults to index.html for root '/')
  const path = window.location.pathname.split('/').pop() || 'index.html';

  // Top-level (meta) pages
  const navItems = [
    { href: 'index.html',    label: 'Home' },
    { href: 'about.html',    label: 'About' },
    { href: 'contacts.html', label: 'Contact' },
  ];

  // Domain sections — the cards on the homepage, reachable from any page
  const sectionItems = [
    { href: 'digital.html',     label: 'Digital' },
    { href: 'business.html',    label: 'Business' },
    { href: 'education.html',   label: 'Education' },
    { href: 'skills.html',      label: 'Skills' },
    { href: 'energy.html',      label: 'Energy' },
    { href: 'environment.html', label: 'Environment' },
    { href: 'greenscreen.html', label: 'The Green Screen' },
  ];

  const isHome = navItems.some(item => item.href === path);
  const isSection = sectionItems.some(item => item.href === path);

  // Home / About / Contact links
  const navLinks = navItems.map(item => {
    const active = item.href === path ? ' class="active"' : '';
    return `<li><a href="${item.href}"${active}>${item.label}</a></li>`;
  }).join('\n          ');

  // Sections dropdown items
  const sectionLinks = sectionItems.map(item => {
    const active = item.href === path ? ' class="active"' : '';
    return `<li><a href="${item.href}"${active}>${item.label}</a></li>`;
  }).join('\n              ');

  const sectionsActive = isSection ? ' active' : '';

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
          <li class="has-dropdown">
            <button class="nav-dropdown-toggle${sectionsActive}" aria-expanded="false" aria-haspopup="true">
              Sections
              <svg class="nav-caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
            </button>
            <ul class="nav-dropdown">
              ${sectionLinks}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  `;

  // --- Sections dropdown toggle (works for click + keyboard + mobile) ---
  const dropdownLi = header.querySelector('.has-dropdown');
  const dropdownToggle = header.querySelector('.nav-dropdown-toggle');

  if (dropdownLi && dropdownToggle) {
    dropdownToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const open = dropdownLi.classList.toggle('open');
      dropdownToggle.setAttribute('aria-expanded', open);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!dropdownLi.contains(e.target)) {
        dropdownLi.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        dropdownLi.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
