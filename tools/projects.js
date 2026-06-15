/* ferrao.me — shared business-case layer (projects.js)
 *
 * One small module every innovation tool can import. It owns the list of
 * business cases (projects) and which one is active, in localStorage, and
 * renders a thin selector bar. Tools store their own per-case data under a
 * namespaced key and ask this layer which case is active.
 *
 * Design rules:
 *  - GRACEFUL: a tool works with or without this file. If it is absent, the
 *    tool keeps its single-state behaviour. If present, it goes per-case.
 *  - STANDALONE: no framework, no build step, no dependencies. Plain ES5-ish.
 *  - NEUTRAL: knows nothing about any specific tool's data shape.
 *
 * Public API (window.FerraoProjects):
 *   init(opts)                  -> set up the layer for a tool
 *   list()                      -> [{id, name, created, updated}]
 *   activeId()                  -> current active case id (or null)
 *   active()                    -> active case meta (or null)
 *   create(name)                -> new case, becomes active, returns id
 *   rename(id, name)
 *   duplicate(id, newName)      -> deep-copies the calling tool's data too
 *   remove(id)
 *   setActive(id)
 *   key(toolNamespace)          -> the localStorage key for the active case
 *   onChange(fn)                -> subscribe to active-case changes
 *   mountBar(el, opts)          -> render the selector bar into el
 */
(function (global) {
  'use strict';

  var REGISTRY_KEY = 'ferrao-projects-v1';      // {cases:[...], activeId}
  // Permanent, undeletable example cases — always present as reference. Each
  // tool supplies its OWN seed for these via init({ exampleSeeds: {id: data} }),
  // so this layer stays neutral about any tool's data shape.
  var EXAMPLES = [
    { id: 'ex-sportspots', name: 'SportSpots' },
    { id: 'ex-safe-cycle', name: 'SAFE-Cycle' }
  ];
  var listeners = [];
  var cfg = {
    toolNamespace: null,   // e.g. 'assumptions-tracker'
    onActiveData: null,    // fn(id) -> the tool re-loads its data for id
    getToolData: null,     // fn() -> serialisable snapshot of current tool data (for duplicate)
    setToolData: null,     // fn(id, data) -> write a tool-data snapshot under a case id
    exampleSeeds: {}       // { exampleCaseId: toolData } -> seed for the locked examples
  };

  /* ---------- registry persistence ---------- */
  function loadRegistry() {
    try {
      var raw = localStorage.getItem(REGISTRY_KEY);
      if (!raw) return { cases: [], activeId: null };
      var o = JSON.parse(raw);
      if (!o || !Array.isArray(o.cases)) return { cases: [], activeId: null };
      return o;
    } catch (e) { return { cases: [], activeId: null }; }
  }
  function saveRegistry(reg) {
    try { localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg)); } catch (e) {}
  }
  function uid() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function now() { return new Date().toISOString(); }

  /* ---------- core ops ---------- */
  function list() { return loadRegistry().cases.slice(); }
  function activeId() { return loadRegistry().activeId; }
  function active() {
    var reg = loadRegistry();
    for (var i = 0; i < reg.cases.length; i++) if (reg.cases[i].id === reg.activeId) return reg.cases[i];
    return null;
  }
  function touch(id) {
    var reg = loadRegistry();
    for (var i = 0; i < reg.cases.length; i++) if (reg.cases[i].id === id) { reg.cases[i].updated = now(); }
    saveRegistry(reg);
  }
  function create(name, silent) {
    var reg = loadRegistry();
    var id = uid();
    reg.cases.push({ id: id, name: name || 'Untitled case', created: now(), updated: now() });
    reg.activeId = id;
    saveRegistry(reg);
    if (!silent) emit();
    return id;
  }
  function rename(id, name) {
    var reg = loadRegistry();
    for (var i = 0; i < reg.cases.length; i++) if (reg.cases[i].id === id) {
      if (reg.cases[i].locked) return;            // example names are canonical
      reg.cases[i].name = name; reg.cases[i].updated = now();
    }
    saveRegistry(reg);
    emit();
  }
  function duplicate(id, newName) {
    var reg = loadRegistry();
    var src = null;
    for (var i = 0; i < reg.cases.length; i++) if (reg.cases[i].id === id) src = reg.cases[i];
    if (!src) return null;
    var nid = uid();
    reg.cases.push({ id: nid, name: newName || (src.name + ' (copy)'), created: now(), updated: now() });
    reg.activeId = nid;
    saveRegistry(reg);
    // deep-copy the calling tool's data from src to nid, if wired
    if (cfg.toolNamespace) {
      try {
        var raw = localStorage.getItem(dataKey(id));
        if (raw != null) localStorage.setItem(dataKey(nid), raw);
      } catch (e) {}
    }
    emit();
    return nid;
  }
  function remove(id) {
    var reg = loadRegistry();
    for (var k = 0; k < reg.cases.length; k++) if (reg.cases[k].id === id && reg.cases[k].locked) return; // examples are permanent
    reg.cases = reg.cases.filter(function (c) { return c.id !== id; });
    if (reg.activeId === id) reg.activeId = reg.cases.length ? reg.cases[0].id : null;
    saveRegistry(reg);
    // drop this tool's data for the removed case
    if (cfg.toolNamespace) { try { localStorage.removeItem(dataKey(id)); } catch (e) {} }
    emit();
  }
  function setActive(id) {
    var reg = loadRegistry();
    if (reg.activeId === id) return;
    reg.activeId = id;
    saveRegistry(reg);
    emit();
  }

  /* ---------- permanent example cases ---------- */
  function caseById(id) {
    var reg = loadRegistry();
    for (var i = 0; i < reg.cases.length; i++) if (reg.cases[i].id === id) return reg.cases[i];
    return null;
  }
  function isLocked(id) { var c = caseById(id); return !!(c && c.locked); }

  // Make sure the locked example cases exist in the registry. Non-destructive:
  // never touches cases the user already has. Adds them at the front so the
  // examples read as the canonical reference set.
  function ensureExamples() {
    var reg = loadRegistry();
    var have = {};
    reg.cases.forEach(function (c) { have[c.id] = true; });
    var missing = EXAMPLES.filter(function (ex) { return !have[ex.id]; })
      .map(function (ex) { return { id: ex.id, name: ex.name, created: now(), updated: now(), locked: true }; });
    if (missing.length) reg.cases = missing.concat(reg.cases);
    if (!reg.activeId && reg.cases.length) reg.activeId = reg.cases[0].id;
    if (missing.length || !loadRegistry().activeId) saveRegistry(reg);
  }
  // Write this tool's seed for each example case, but only if that case+tool
  // has no data yet — we must never clobber the user's own edits.
  function seedExampleData() {
    if (!cfg.toolNamespace) return;
    Object.keys(cfg.exampleSeeds || {}).forEach(function (id) {
      try {
        if (localStorage.getItem(dataKey(id)) == null) {
          localStorage.setItem(dataKey(id), JSON.stringify(cfg.exampleSeeds[id]));
        }
      } catch (e) {}
    });
  }
  // Restore an example case's data for THIS tool from its registered seed.
  function resetExample(id) {
    if (!isLocked(id) || !cfg.exampleSeeds || cfg.exampleSeeds[id] == null) return false;
    try { localStorage.setItem(dataKey(id), JSON.stringify(cfg.exampleSeeds[id])); } catch (e) {}
    touch(id);
    emit();
    return true;
  }

  /* ---------- per-tool data keys ---------- */
  function dataKey(caseId) {
    return 'ferrao-case-' + caseId + '-' + cfg.toolNamespace;
  }
  function key() {
    var id = activeId();
    if (!id || !cfg.toolNamespace) return null;
    return dataKey(id);
  }

  /* ---------- events ---------- */
  function onChange(fn) { if (typeof fn === 'function') listeners.push(fn); }
  function emit() {
    var id = activeId();
    if (cfg.onActiveData) { try { cfg.onActiveData(id); } catch (e) {} }
    listeners.forEach(function (fn) { try { fn(id); } catch (e) {} });
    renderBars();
  }

  /* ---------- init + optional migration ---------- */
  function init(opts) {
    opts = opts || {};
    cfg.toolNamespace = opts.toolNamespace || null;
    cfg.onActiveData = opts.onActiveData || null;
    cfg.getToolData = opts.getToolData || null;
    cfg.setToolData = opts.setToolData || null;
    cfg.exampleSeeds = opts.exampleSeeds || {};

    // the permanent example cases are always present and pre-seeded for this tool
    ensureExamples();
    seedExampleData();

    // one-time: adopt a pre-existing single-state blob as the user's OWN case
    // (only if they have no editable case yet — the locked examples don't count).
    if (opts.migrateFrom) {
      var reg = loadRegistry();
      var hasUserCase = reg.cases.some(function (c) { return !c.locked; });
      if (!hasUserCase) {
        var legacy = null;
        try { legacy = localStorage.getItem(opts.migrateFrom); } catch (e) {}
        if (legacy != null) {
          var id = create(opts.migrateName || 'Imported case', true); // silent: sets active
          try { localStorage.setItem(dataKey(id), legacy); } catch (e) {}
          emit(); // tool loads the migrated per-case data, now active
          return { migrated: true, id: id };
        }
      }
    }
    emit(); // sync the tool to the active case (an example, by default)
    return { migrated: false, id: activeId() };
  }

  /* ---------- selector bar UI ---------- */
  var bars = [];
  function mountBar(el, opts) {
    if (!el) return;
    bars.push({ el: el, opts: opts || {} });
    renderBar(el, opts || {});
  }
  function renderBars() { bars.forEach(function (b) { renderBar(b.el, b.opts); }); }

  function fmtAgo(iso) {
    try {
      var d = new Date(iso).getTime();
      var s = Math.floor((Date.now() - d) / 1000);
      if (s < 60) return 'agora';
      if (s < 3600) return Math.floor(s / 60) + ' min';
      if (s < 86400) return Math.floor(s / 3600) + ' h';
      return Math.floor(s / 86400) + ' d';
    } catch (e) { return ''; }
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderBar(el, opts) {
    var label = opts.label || 'Business case';
    var a = active();
    var cases = list();
    var openId = el.getAttribute('data-open') === '1';
    var locked = !!(a && a.locked);
    // optional app-specific buttons (e.g. import/export/reset) rendered in the action row
    var extras = opts.extras || [];
    var extrasHtml = extras.map(function (x, i) {
      return '<button class="fp-btn" data-act="extra" data-x="' + i + '" title="' + esc(x.title || '') + '">' + esc(x.label) + '</button>';
    }).join('') + (extras.length ? '<span class="fp-sep"></span>' : '');

    var html = '<div class="fp-bar">' +
      '<span class="fp-label">' + esc(label) + '</span>' +
      '<button class="fp-select" data-act="toggle">' +
        '<span class="fp-name">' + esc(a ? a.name : 'Sem caso') + '</span>' +
        (locked ? '<span class="fp-ex-tag">exemplo</span>' : '') +
        '<span class="fp-chev">' + (openId ? '\u25b4' : '\u25be') + '</span>' +
      '</button>' +
      '<span class="fp-actions">' +
        extrasHtml +
        (locked
          ? '<button class="fp-btn" data-act="reset" title="Repor os dados originais do exemplo">repor exemplo</button>'
          : '<button class="fp-btn" data-act="rename" title="Renomear">renomear</button>') +
        '<button class="fp-btn" data-act="duplicate" title="' + (locked ? 'Duplicar este exemplo para um caso edit\u00e1vel' : 'Duplicar') + '">duplicar</button>' +
        (locked
          ? '<button class="fp-btn" data-act="remove" title="Exemplo permanente \u2014 n\u00e3o pode ser apagado" disabled>apagar</button>'
          : '<button class="fp-btn fp-danger" data-act="remove" title="Apagar">apagar</button>') +
      '</span>';

    if (openId) {
      html += '<div class="fp-dd">';
      cases.forEach(function (c) {
        var on = a && c.id === a.id;
        html += '<button class="fp-dd-item' + (on ? ' fp-on' : '') + '" data-act="pick" data-id="' + c.id + '">' +
          '<span class="fp-di-name">' + esc(c.name) + (c.locked ? ' <span class="fp-di-ex">exemplo</span>' : '') + '</span>' +
          '<span class="fp-di-meta">' + fmtAgo(c.updated) + (on ? ' \u00b7 <span class="fp-di-check">\u2713 ativo</span>' : '') + '</span>' +
        '</button>';
      });
      html += '<button class="fp-dd-new" data-act="create">\uFF0B novo business case</button>';
      html += '</div>';
    }
    html += '</div>';
    el.innerHTML = html;

    el.querySelectorAll('[data-act]').forEach(function (node) {
      node.addEventListener('click', function (e) {
        e.stopPropagation();
        var act = node.getAttribute('data-act');
        if (act === 'extra') {
          var xs = opts.extras || [], x = xs[+node.getAttribute('data-x')];
          if (x && typeof x.onClick === 'function') x.onClick();
          return;
        }
        // read the live data-open at click time (not the captured render-time
        // openId): pick/create re-render before the attribute settles, so the
        // closure value can be stale.
        if (act === 'toggle') {
          el.setAttribute('data-open', el.getAttribute('data-open') === '1' ? '0' : '1');
          renderBar(el, opts);
          return;
        }
        // close BEFORE the op: setActive/create emit() -> renderBars(), so the
        // attribute must already be '0' for that re-render to draw the bar closed.
        if (act === 'pick') {
          el.setAttribute('data-open', '0');
          setActive(node.getAttribute('data-id'));
          renderBar(el, opts);
          return;
        }
        if (act === 'create') {
          el.setAttribute('data-open', '0');
          var n = prompt('Nome do novo business case:', '');
          if (n && n.trim()) create(n.trim());
          renderBar(el, opts);
          return;
        }
        if (act === 'reset') {
          if (!a || !a.locked) return;
          el.setAttribute('data-open', '0');
          if (confirm('Repor o exemplo «' + a.name + '»?\n\nAs tuas edições a este caso NESTA ferramenta serão substituídas pelos dados originais do exemplo. Outras ferramentas não são afetadas.')) {
            resetExample(a.id);
          } else {
            renderBar(el, opts);
          }
          return;
        }
        if (act === 'rename') {
          if (!a) return;
          var nn = prompt('Renomear business case:', a.name);
          if (nn && nn.trim()) rename(a.id, nn.trim());
          return;
        }
        if (act === 'duplicate') {
          if (!a) return;
          var dn = prompt('Nome da cópia:', a.name + ' (cópia)');
          if (dn && dn.trim()) duplicate(a.id, dn.trim());
          return;
        }
        if (act === 'remove') {
          if (!a) return;
          if (cases.length <= 1) { alert('Não podes apagar o único business case. Cria outro primeiro.'); return; }
          if (confirm('Apagar o business case "' + a.name + '"?\n\nIsto remove os dados deste caso nesta ferramenta. Outras ferramentas mantêm os seus dados até também apagares lá. Esta ação não se desfaz.')) {
            remove(a.id);
          }
          return;
        }
      });
    });
  }

  // close any open dropdown when clicking elsewhere
  global.addEventListener('click', function () {
    bars.forEach(function (b) {
      if (b.el.getAttribute('data-open') === '1') { b.el.setAttribute('data-open', '0'); renderBar(b.el, b.opts); }
    });
  });

  global.FerraoProjects = {
    init: init, list: list, activeId: activeId, active: active,
    create: create, rename: rename, duplicate: duplicate, remove: remove,
    setActive: setActive, key: key, onChange: onChange, mountBar: mountBar,
    touch: touch, resetExample: resetExample, isLocked: isLocked,
    EXAMPLE_IDS: { sportspots: 'ex-sportspots', safeCycle: 'ex-safe-cycle' }
  };
})(window);
