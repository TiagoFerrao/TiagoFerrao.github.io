/* ============================================
   LANDING TERMINAL
   Interactive prompt on the homepage. Commands navigate the site;
   free-text questions go to the "ask me" agent.

   NOTE: askAgent() is currently a placeholder. To go live, point it at
   the Notion knowledge agent at https://api.ferrao.me/chat (see backend
   /chat contract) — that is the only function that needs to change.
   ============================================ */

(function () {
  'use strict';

  const out = document.getElementById('lp-out');
  const inp = document.getElementById('lp-inp');
  const term = document.getElementById('lp-term');
  if (!out || !inp || !term) return;

  function print(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    out.appendChild(d);
    term.scrollIntoView({ block: 'end' });
  }
  function echo(cmd) {
    print(`<span class="lp-ps1" style="color:var(--accent-secondary)">tiago@ferrao.me:~$</span> <span class="lp-echo">${esc(cmd)}</span>`);
  }
  function esc(s) { return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  const COMMANDS = {
    help() {
      print(
        `<span class="lp-sys">commands:</span>\n` +
        `  <span class="lp-teal">ls</span>       list the deeper sections\n` +
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
        `<span class="lp-ghost">innovation (soon)</span>  <a href="greenscreen.html">greenscreen</a>\n` +
        `<span class="lp-ghost">(business · education · skills are the cards above)</span>`);
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
  COMMANDS['cv'] = COMMANDS.cv;

  // Placeholder for the Notion knowledge agent. Swap the body for a
  // fetch('https://api.ferrao.me/chat', ...) once rate-limiting is in place.
  function askAgent(question) {
    print(`<span class="lp-sys">› querying knowledge base…</span>`);
    setTimeout(() => {
      print(`<span class="lp-ok">[coming soon]</span> <span class="lp-sys">soon you'll be able to ask me anything and get an answer drawn from my Notion archive. For now, browse the sections above or type </span><span class="lp-teal">help</span><span class="lp-sys">.</span>`);
    }, 500);
  }

  function run(raw) {
    const text = raw.trim();
    if (!text) return;
    echo(text);
    const cmd = text.toLowerCase();
    if (COMMANDS[cmd]) COMMANDS[cmd]();
    else askAgent(text);
    term.scrollIntoView({ block: 'end' });
  }

  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { run(inp.value); inp.value = ''; } });
  term.addEventListener('click', () => inp.focus());
  document.querySelectorAll('.lp-chip').forEach(c => c.addEventListener('click', () => run(c.textContent)));

  // boot line
  print(`<span class="lp-ghost">session started · type </span><span class="lp-teal">help</span><span class="lp-ghost"> for commands, or ask a question about me.</span>`);
})();
