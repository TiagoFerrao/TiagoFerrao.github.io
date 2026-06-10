/* ============================================
   SITE TERMINAL (reusable)
   Drop a .lp-term block on any page; this binds to it.
   Commands navigate the site; free-text questions go to the "ask me" agent.

   Per-page seeding: add data-init="cmd1; cmd2" on #lp-term to auto-run
   commands on load (shown as a real session). No data-init → boot hint.

   NOTE: askAgent() is a placeholder. To go live, point it at the Notion
   knowledge agent at https://api.ferrao.me/chat — that is the only
   function that needs to change.
   ============================================ */

(function () {
  'use strict';

  const out = document.getElementById('lp-out');
  const inp = document.getElementById('lp-inp');
  const term = document.getElementById('lp-term');
  if (!out || !inp || !term) return;

  let booting = true; // suppress scroll-into-view while seeding on load
  const isStrip = term.classList.contains('st'); // slim footer strip vs full terminal
  function expand() { if (isStrip) term.classList.add('st-expanded'); }

  function esc(s) { return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function print(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    out.appendChild(d);
    if (!booting) term.scrollIntoView({ block: 'end' });
  }
  function echo(cmd) {
    print(`<span class="lp-ps1" style="color:var(--accent-secondary)">tiago@ferrao.me:~$</span> <span class="lp-echo">${esc(cmd)}</span>`);
  }
  function link(href, text, blank) {
    return `<a href="${href}"${blank ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
  }
  function pad(label) { return `<span class="lp-ghost">${(label + '          ').slice(0, 10)}</span>`; }

  const COMMANDS = {
    help() {
      print(
        `<span class="lp-sys">commands:</span>\n` +
        `  <span class="lp-teal">ls</span>       list the deeper sections\n` +
        `  <span class="lp-teal">contact</span>  ways to reach me\n` +
        `  <span class="lp-teal">cat cv</span>   open my CV\n` +
        `  <span class="lp-teal">about</span>    who I am\n` +
        `  <span class="lp-teal">lamp</span>     open the energyOFF lighting tool\n` +
        `  <span class="lp-teal">clear</span>    clear the screen\n` +
        `<span class="lp-ghost"># or just ask a question about me in plain language ;)</span>`);
    },
    ls() {
      print(
        `<span class="lp-sys">deeper sections:</span> ` +
        `<a href="digital.html">digital</a>  <a href="energy.html">energy</a>  ` +
        `<a href="innovation.html">innovation</a>  <a href="greenscreen.html">greenscreen</a>\n` +
        `<span class="lp-ghost">(business · education · skills are the cards on the homepage)</span>`);
    },
    contact() {
      print(
        pad('email') + link('mailto:tiago.cunha.ferrao@me.com', 'tiago.cunha.ferrao@me.com') + '\n' +
        pad('phone') + link('tel:+351917101075', '(+351) 917 101 075') + '\n' +
        pad('github') + link('https://github.com/TiagoFerrao', 'github.com/TiagoFerrao', true) + '\n' +
        pad('linkedin') + link('https://www.linkedin.com/in/tferrao/', 'linkedin.com/in/tferrao', true) + '\n' +
        pad('cv') + link('cv.html', 'cv.html'));
    },
    about() {
      print(`<span class="lp-sys">Tiago Ferrão — Innovation Leader · Hybrid Manager.\n20+ years across renewables, retail, sport, water and urban policy.</span> <a href="about.html">more →</a>`);
    },
    cv() { print(`<span class="lp-sys">opening CV →</span> <a href="cv.html">cv.html</a>`); },
    lamp() {
      print(`<span class="lp-sys">launching</span> <span class="lp-ok">energyOFF lighting identifier</span> <span class="lp-sys">→</span> <a href="lampadas.html">open tool</a>`);
    },
    whoami() { print(`<span class="lp-ghost">visitor@ferrao.me — but curiosity belongs to those who explore terminals.</span>`); },
    sudo() { print(`<span class="lp-ghost">visitor is not in the sudoers file. This incident will be reported. 😏</span>`); },
    clear() { out.innerHTML = ''; },
  };
  // aliases
  ['luz', 'lampada', 'lâmpada', 'energyoff', 'lampadas'].forEach(a => COMMANDS[a] = COMMANDS.lamp);
  COMMANDS['cat cv'] = COMMANDS.cv;
  COMMANDS['cat contact.txt'] = COMMANDS.contact;
  COMMANDS['cat contact'] = COMMANDS.contact;
  COMMANDS['contacts'] = COMMANDS.contact;

  // Placeholder for the Notion knowledge agent. Swap the body for a
  // fetch('https://api.ferrao.me/chat', ...) once rate-limiting is in place.
  function askAgent(question) {
    print(`<span class="lp-sys">› querying knowledge base…</span>`);
    setTimeout(() => {
      print(`<span class="lp-ok">[coming soon]</span> <span class="lp-sys">soon you'll be able to ask me anything and get an answer drawn from my Notion archive. For now, try </span><span class="lp-teal">help</span><span class="lp-sys">.</span>`);
    }, 500);
  }

  function run(raw) {
    const text = raw.trim();
    if (!text) return;
    expand();
    echo(text);
    const cmd = text.toLowerCase();
    if (COMMANDS[cmd]) COMMANDS[cmd]();
    else askAgent(text);
    if (!booting) term.scrollIntoView({ block: 'end' });
  }

  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { run(inp.value); inp.value = ''; } });
  term.addEventListener('click', () => inp.focus());
  if (isStrip) inp.addEventListener('focus', expand);
  document.querySelectorAll('.lp-chip').forEach(c => c.addEventListener('click', () => run(c.textContent)));

  // --- Seed on load ---
  const init = term.getAttribute('data-init');
  if (init) {
    if (isStrip) {
      // let the collapsed strip render first, then animate open + seed output
      requestAnimationFrame(() => requestAnimationFrame(() => {
        expand();
        init.split(';').forEach(c => { if (c.trim()) run(c.trim()); });
        booting = false;
      }));
    } else {
      init.split(';').forEach(c => { if (c.trim()) run(c.trim()); });
      booting = false;
    }
  } else {
    // full terminal (homepage) gets a boot hint; the slim strip stays quiet until focused
    if (!isStrip) {
      print(`<span class="lp-ghost">session started · type </span><span class="lp-teal">help</span><span class="lp-ghost"> for commands, or ask a question about me.</span>`);
    }
    booting = false;
  }
})();
