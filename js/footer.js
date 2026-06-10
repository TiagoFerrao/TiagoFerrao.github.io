/* ============================================
   SITE FOOTER → terminal strip
   Injects a slim, persistent terminal prompt into <footer id="site-footer">
   on every content page. Collapsed by default (one line); expands on focus.
   On contacts.html it auto-expands and runs `cat contact.txt`.
   Single source of truth — edit here to update all pages.
   ============================================ */

(function () {
  'use strict';

  const footer = document.getElementById('site-footer');
  if (!footer) return;

  // Ensure the terminal styles are present (landing.css holds the .lp- rules).
  if (!document.querySelector('link[href$="css/landing.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/landing.css';
    document.head.appendChild(link);
  }

  // Contacts page seeds the terminal with the contact card (auto-expands).
  const page = (location.pathname.split('/').pop() || '').toLowerCase();
  const isContacts = page === 'contacts.html' || page === 'contacts';
  const initAttr = isContacts ? ' data-init="cat contact.txt"' : '';

  // discreet section nav above the terminal (sections live on the homepage hub otherwise)
  const sections = [
    ['digital.html', 'Digital'],
    ['business.html', 'Business'],
    ['education.html', 'Education'],
    ['skills.html', 'Skills'],
    ['energy.html', 'Energy'],
    ['innovation.html', 'Innovation'],
    ['greenscreen.html', 'Green Screen'],
  ];
  const browse = sections.map(function (s) {
    const cls = s[2] ? ' class="lp-soon"' : (s[0] === page ? ' class="lp-here"' : '');
    return '<a href="' + s[0] + '"' + cls + '>' + s[1] + '</a>';
  }).join('');

  footer.classList.add('site-term-footer');
  footer.innerHTML = `
    <div class="stf-inner">
      <div class="lp-term st" id="lp-term"${initAttr} aria-label="Terminal">
        <div class="lp-term-bar">
          <span class="lp-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="lp-term-path">~/ — ferrao.me</span>
          <span class="lp-term-copy">&copy; 2026 Tiago Ferrão</span>
        </div>
        <div class="lp-term-body">
          <div class="lp-out" id="lp-out" aria-live="polite"></div>
          <div class="lp-line">
            <span class="lp-ps1">tiago@ferrao.me:~$</span>
            <input class="lp-inp" id="lp-inp" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal input" placeholder="type a command, or ask me anything…">
          </div>
          <div class="lp-chips">try:
            <button class="lp-chip">ls</button>
            <button class="lp-chip">contact</button>
            <button class="lp-chip">cat cv</button>
          </div>
        </div>
      </div>
      <nav class="lp-browse stf-browse" aria-label="Sections"><span class="lp-browse-label">sections:</span>${browse}</nav>
    </div>
  `;

  // Load the terminal behaviour once the markup exists.
  if (!document.querySelector('script[src$="js/terminal.js"]')) {
    const s = document.createElement('script');
    s.src = 'js/terminal.js';
    document.body.appendChild(s);
  }
})();
