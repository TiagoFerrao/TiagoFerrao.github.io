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

  // Top-level (meta) pages — the brand logo is the Home link, so no Home tab
  const navItems = [
    { href: 'about.html',    label: 'About' },
    { href: 'contacts.html', label: 'Contact' },
    { href: 'cv.html',       label: 'CV' },
  ];

  // Home / About / Contact links
  const navLinks = navItems.map(item => {
    const active = item.href === path ? ' class="active"' : '';
    return `<li><a href="${item.href}"${active}>${item.label}</a></li>`;
  }).join('\n          ');

  // Deeper sections — discreet CLI row under the brand (desktop; the footer row covers mobile)
  const sections = [
    ['digital.html', 'digital'],
    ['business.html', 'business'],
    ['education.html', 'education'],
    ['skills.html', 'skills'],
    ['energy.html', 'energy'],
    ['#', 'innovation', true],
    ['greenscreen.html', 'greenscreen'],
  ];
  const sectionLinks = sections.map(s => {
    const cls = s[2] ? ' class="soon"' : (s[0] === path ? ' class="here"' : '');
    return `<a href="${s[0]}"${cls}>${s[1]}</a>`;
  }).join('');

  header.classList.add('site-header');
  header.innerHTML = `
    <div class="container">
      <div class="site-head-left">
        <a href="index.html" class="site-brand">
          <h1>Tiago Ferrão</h1>
          <span class="subtitle">Innovation Leader · Hybrid Manager</span>
        </a>
        <nav class="site-sections" aria-label="Sections"><span class="pfx">~/</span>${sectionLinks}</nav>
      </div>
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
