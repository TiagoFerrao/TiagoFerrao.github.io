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
  var listeners = [];
  var cfg = {
    toolNamespace: null,   // e.g. 'assumptions-tracker'
    onActiveData: null,    // fn(id) -> the tool re-loads its data for id
    getToolData: null,     // fn() -> serialisable snapshot of current tool data (for duplicate)
    setToolData: null      // fn(id, data) -> write a tool-data snapshot under a case id
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
    for (var i = 0; i < reg.cases.length; i++) if (reg.cases[i].id === id) { reg.cases[i].name = name; reg.cases[i].updated = now(); }
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

    var reg = loadRegistry();

    // first run with migration: adopt an existing single-state blob as case #1
    if (!reg.cases.length && opts.migrateFrom) {
      var legacy = null;
      try { legacy = localStorage.getItem(opts.migrateFrom); } catch (e) {}
      if (legacy != null) {
        var id = create(opts.migrateName || 'Imported case', true); // silent: no emit yet
        try { localStorage.setItem(dataKey(id), legacy); } catch (e) {} // write data FIRST
        emit(); // now emit — the tool loads the already-populated per-case key
        // leave the legacy key in place (non-destructive); tool now reads per-case
        return { migrated: true, id: id };
      }
    }
    // no cases yet and nothing to migrate -> create a starter case so the tool always has one
    if (!reg.cases.length && opts.createInitial) {
      var sid = create(opts.initialName || 'New case');
      return { migrated: false, id: sid };
    }
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

    var html = '<div class="fp-bar">' +
      '<span class="fp-label">' + esc(label) + '</span>' +
      '<button class="fp-select" data-act="toggle">' +
        '<span class="fp-name">' + esc(a ? a.name : 'Sem caso') + '</span>' +
        '<span class="fp-chev">' + (openId ? '\u25b4' : '\u25be') + '</span>' +
      '</button>' +
      '<span class="fp-actions">' +
        '<button class="fp-btn" data-act="rename" title="Renomear">renomear</button>' +
        '<button class="fp-btn" data-act="duplicate" title="Duplicar">duplicar</button>' +
        '<button class="fp-btn fp-danger" data-act="remove" title="Apagar">apagar</button>' +
      '</span>';

    if (openId) {
      html += '<div class="fp-dd">';
      cases.forEach(function (c) {
        var on = a && c.id === a.id;
        html += '<button class="fp-dd-item' + (on ? ' fp-on' : '') + '" data-act="pick" data-id="' + c.id + '">' +
          '<span class="fp-di-name">' + esc(c.name) + '</span>' +
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
        if (act === 'toggle') { el.setAttribute('data-open', openId ? '0' : '1'); renderBar(el, opts); return; }
        if (act === 'pick') { setActive(node.getAttribute('data-id')); el.setAttribute('data-open', '0'); return; }
        if (act === 'create') {
          var n = prompt('Nome do novo business case:', '');
          if (n && n.trim()) create(n.trim());
          el.setAttribute('data-open', '0');
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
    touch: touch
  };
})(window);
