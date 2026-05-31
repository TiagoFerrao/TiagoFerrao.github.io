/* ============================================
   SKILLS RENDERER — Radar visualisation
   Builds an SVG radar from window.skillsData:
   - 4 quadrants (categories), 5 level rings
   - Each skill = a pie wedge, radius = level
   - Opacity = status (consolidated / learning)
   - Hover: tooltip via native <title>
   - Filter tabs: highlight one quadrant (others dim)
   ============================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.skillsData) {
      console.error('skills-render: window.skillsData not found.');
      return;
    }
    const d = window.skillsData;
    renderHero(d.hero);
    renderRadar(d);
    renderLegend(d);
    renderFilterTabs(d.categories);
    initFilterBehaviour(d);
    initScrollAnimations();
    initTooltip(d.skills);
    initHybridTooltip(d);
  });

  // ---------- Hero stats ----------
  function renderHero(hero) {
    const el = document.getElementById('skills-hero');
    if (!el || !hero) return;
    el.innerHTML = hero.stats.map(s => `
      <div class="hero-stat">
        <span class="hero-stat-number" data-target="${s.number}" data-suffix="${esc(s.suffix)}">0${esc(s.suffix)}</span>
        <span class="hero-stat-label">${esc(s.label)}</span>
      </div>
    `).join('');
  }

  // ---------- Radar SVG ----------
  // Donut layout: wedges grow from an inner hub (R0) out to MAX_R.
  // Center hub holds the headline stats; sectors get a background fan,
  // a sector label, and radial skill labels with leader lines.
  function renderRadar(d) {
    const el = document.getElementById('skills-radar');
    if (!el) return;

    const R0    = 64;   // inner hub radius (donut hole)
    const MAX_R = 205;  // outer radius of a level-100 wedge
    const GAP   = MAX_R - R0;
    const LEVELS = d.levels.length;  // 5

    const ringRadii = [];
    for (let i = 1; i <= LEVELS; i++) ringRadii.push(R0 + (i / LEVELS) * GAP);

    // map a 0-100 level onto the [R0, MAX_R] band
    const levelR = lvl => R0 + (Math.max(0, Math.min(100, lvl)) / 100) * GAP;

    // Quadrants clockwise from TOP-RIGHT.
    const quadrantOrder = ['management', 'stem', 'digital', 'soft'];
    const quadrantStart = { management: -90, stem: 0, digital: 90, soft: 180 };
    const QUAD_SPAN = 90;

    // Group by category, then sort each sector by level (desc) for a clean fan.
    const skillsByCat = {};
    quadrantOrder.forEach(catId => skillsByCat[catId] = []);
    d.skills.forEach(s => { if (skillsByCat[s.category]) skillsByCat[s.category].push(s); });
    quadrantOrder.forEach(catId => skillsByCat[catId].sort((a, b) => b.level - a.level));

    const statusClass = { consolidated: 'wedge-consolidated', learning: 'wedge-learning' };

    const defsParts   = [];
    const ringParts   = [];
    const sectorParts = [];
    const wedgeParts  = [];
    const dotParts    = [];

    // Single continuous background disc — no per-quadrant seams.
    const bgParts = [`<circle class="sector-bg" cx="0" cy="0" r="${(MAX_R + 16).toFixed(1)}"/>`];

    // Curved sector headings on an arc above each quadrant (bottom arcs reversed so text stays upright).
    const RL = MAX_R + 22;
    quadrantOrder.forEach(catId => {
      const cat = d.categories.find(c => c.id === catId);
      if (!cat) return;
      const s = quadrantStart[catId];
      const bottom = Math.sin((s + QUAD_SPAN / 2) * Math.PI / 180) > 0;
      const a0 = bottom ? s + QUAD_SPAN : s;
      const a1 = bottom ? s : s + QUAD_SPAN;
      const sweep = bottom ? 0 : 1;
      const p0 = polarToCart(RL, a0), p1 = polarToCart(RL, a1);
      const id = `sector-arc-${catId}`;
      defsParts.push(`<path id="${id}" d="M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A ${RL} ${RL} 0 0 ${sweep} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}" fill="none"/>`);
      sectorParts.push(`<text class="quad-label" data-category="${esc(catId)}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc((cat.label || '').toUpperCase())}</textPath></text>`);
    });

    // Level guide rings (dotted, behind wedges)
    ringRadii.forEach(r => ringParts.push(`<circle class="ring" cx="0" cy="0" r="${r.toFixed(1)}" />`));

    // Skill wedges (sorted), 2-band aware, with a 10+yr tip dot. Names read on hover.
    quadrantOrder.forEach(catId => {
      const skills = skillsByCat[catId];
      if (!skills.length) return;
      const startDeg = quadrantStart[catId];
      const segSpan = QUAD_SPAN / skills.length;
      const pad = segSpan * 0.12;

      skills.forEach((skill, i) => {
        const a0 = startDeg + i * segSpan + pad;
        const a1 = startDeg + (i + 1) * segSpan - pad;
        const am = (a0 + a1) / 2;
        const fullR = levelR(skill.level);
        const consR = levelR(resolveConsolidatedLevel(skill));

        const groupAttrs = `data-skill-name="${esc(skill.name)}" data-category="${esc(skill.category)}"`;
        const wedgeAttrs = `data-category="${esc(skill.category)}"`;

        let inner = '';
        if (consR >= fullR) {
          const cls = statusClass[skill.status] || 'wedge-consolidated';
          inner = `<path class="wedge ${cls}" ${wedgeAttrs} d="${wedgeBandPath(a0, a1, R0, fullR)}"/>`;
        } else {
          inner += `<path class="wedge wedge-learning" ${wedgeAttrs} d="${wedgeBandPath(a0, a1, consR, fullR)}"/>`;
          if (consR > R0) inner += `<path class="wedge wedge-consolidated" ${wedgeAttrs} d="${wedgeBandPath(a0, a1, R0, consR)}"/>`;
        }
        wedgeParts.push(`<g class="skill-group" ${groupAttrs}>${inner}</g>`);

        // tip dot — marks 10+ years of practice
        if (skill.years >= 10) {
          const dp = polarToCart(MAX_R + 6, am);
          dotParts.push(`<circle class="skill-dot" data-category="${esc(skill.category)}" cx="${dp.x.toFixed(1)}" cy="${dp.y.toFixed(1)}" r="2.4"/>`);
        }
      });
    });

    // Center hub — hybridization index (geometric mean of per-domain mean level)
    // with a 270° gauge filled to the index. Tooltip explains the calc.
    const means = areaMeans(d);
    const H = Math.round(hybridIndex(means));
    const gaugeR = 46, gStart = 135, gSweep = 270;
    const gaugeArc = frac => {
      const a0 = gStart, a1 = gStart + gSweep * frac;
      const p0 = polarToCart(gaugeR, a0), p1 = polarToCart(gaugeR, a1);
      const la = (gSweep * frac) > 180 ? 1 : 0;
      return `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A ${gaugeR} ${gaugeR} 0 ${la} 1 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    };
    const areaAttr = means
      .map(m => `${(d.categories.find(c => c.id === m.id) || {}).label || m.id} ${Math.round(m.mean)}`)
      .join(' · ');
    const centerPart = `
      <g class="hybrid-hub" tabindex="0" role="img" aria-label="Hybridization index ${H} of 100"
         data-h="${H}" data-areas="${esc(areaAttr)}">
        <circle class="radar-center-disc" cx="0" cy="0" r="${R0 - 6}"/>
        <path class="gauge-bg" d="${gaugeArc(1)}"/>
        <path class="gauge-fg" d="${gaugeArc(H / 100)}"/>
        <text class="radar-center-num" x="0" y="2" text-anchor="middle">${H}</text>
        <text class="radar-center-label" x="0" y="22" text-anchor="middle">HYBRIDIZATION</text>
      </g>
    `;

    const V = 272;
    el.innerHTML = `
      <svg viewBox="-${V} -${V} ${2 * V} ${2 * V}" xmlns="http://www.w3.org/2000/svg" class="radar-svg" role="img" aria-label="Skills radar chart">
        <defs>${defsParts.join('')}</defs>
        ${bgParts.join('')}
        ${ringParts.join('')}
        ${wedgeParts.join('')}
        ${dotParts.join('')}
        ${sectorParts.join('')}
        ${centerPart}
      </svg>
    `;
  }

  // SVG path for a pie wedge from center to radius r between two angles (degrees).
  function pieWedgePath(a0, a1, r) {
    if (r <= 0) return '';
    const p0 = polarToCart(r, a0);
    const p1 = polarToCart(r, a1);
    const largeArc = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M 0 0 L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
  }

  // SVG path for a ring/donut slice between inner and outer radii.
  function wedgeBandPath(a0, a1, rIn, rOut) {
    if (rOut <= rIn || rOut <= 0) return '';
    const innerStart = polarToCart(rIn,  a0);
    const outerStart = polarToCart(rOut, a0);
    const outerEnd   = polarToCart(rOut, a1);
    const innerEnd   = polarToCart(rIn,  a1);
    const largeArc = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return [
      `M ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
      `L ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
      `A ${rOut.toFixed(2)} ${rOut.toFixed(2)} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
      `L ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
      `A ${rIn.toFixed(2)} ${rIn.toFixed(2)} 0 ${largeArc} 0 ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
      'Z',
    ].join(' ');
  }

  // Standard polar to cartesian (0° = right, increases clockwise on SVG canvas since SVG y is inverted)
  function polarToCart(r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
  }

  // If skill.consolidatedLevel is set, use it. Otherwise derive from status:
  //   consolidated → whole skill (= level)
  //   learning     → most of the skill is being learned (consolidated only ~40%)
  function resolveConsolidatedLevel(skill) {
    if (typeof skill.consolidatedLevel === 'number') return skill.consolidatedLevel;
    switch (skill.status) {
      case 'learning':    return Math.round(skill.level * 0.4);
      case 'consolidated':
      default:            return skill.level;
    }
  }

  // Mean skill level per domain (count-robust, unlike a raw sum).
  function areaMeans(d) {
    const cats = ['management', 'stem', 'digital', 'soft'];
    const by = {}; cats.forEach(c => by[c] = []);
    d.skills.forEach(s => { if (by[s.category]) by[s.category].push(s.level); });
    return cats.map(id => {
      const arr = by[id];
      const mean = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return { id, mean };
    });
  }

  // Hybridization index = geometric mean of the per-domain strengths (0-100).
  // Like the UN HDI (post-2010): a weak domain can't be fully offset by a strong one.
  function hybridIndex(means) {
    const prod = means.reduce((a, m) => a * (m.mean / 100), 1);
    return Math.pow(prod, 1 / means.length) * 100;
  }

  // ---------- HTML tooltip (rich, follows cursor) ----------
  function initTooltip(skills) {
    const tooltip = document.createElement('div');
    tooltip.className = 'radar-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    document.body.appendChild(tooltip);

    const skillMap = new Map();
    skills.forEach(s => skillMap.set(s.name, s));

    const groups = document.querySelectorAll('.skill-group');
    let hideTimer = null;

    groups.forEach(group => {
      const skill = skillMap.get(group.dataset.skillName);
      if (!skill) return;

      group.addEventListener('mouseenter', e => {
        clearTimeout(hideTimer);
        tooltip.innerHTML = buildTooltipHtml(skill);
        tooltip.classList.add('visible');
        positionTooltip(tooltip, e);
      });
      group.addEventListener('mousemove', e => positionTooltip(tooltip, e));
      group.addEventListener('mouseleave', () => {
        hideTimer = setTimeout(() => tooltip.classList.remove('visible'), 80);
      });

      // Touch / keyboard support — tap a wedge group to pin tooltip briefly
      group.addEventListener('click', e => {
        tooltip.innerHTML = buildTooltipHtml(skill);
        tooltip.classList.add('visible');
        positionTooltip(tooltip, e);
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => tooltip.classList.remove('visible'), 4000);
      });
    });

    // Hide if pointer leaves the SVG entirely
    const svg = document.querySelector('.radar-svg');
    if (svg) {
      svg.addEventListener('mouseleave', () => {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => tooltip.classList.remove('visible'), 80);
      });
    }
  }

  function positionTooltip(tooltip, event) {
    const offset = 16;
    let x = event.clientX + offset;
    let y = event.clientY + offset;
    // Ensure visible to measure size, then clamp to viewport
    const rect = tooltip.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (x + rect.width  + 8 > vw) x = event.clientX - rect.width  - offset;
    if (y + rect.height + 8 > vh) y = event.clientY - rect.height - offset;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  }

  function buildTooltipHtml(skill) {
    const consolidatedLevel = resolveConsolidatedLevel(skill);
    const isBanded = consolidatedLevel < skill.level;

    const statusLabel = {
      consolidated: 'Consolidated',
      learning:     'Learning now'
    }[skill.status] || skill.status;

    const categoryLabel = (window.skillsData.categories.find(c => c.id === skill.category) || {}).label || skill.category;

    const evidenceItems = (skill.evidence || []).map(e => `<li>${esc(e)}</li>`).join('');

    return `
      <div class="tt-head">
        <span class="tt-name">${esc(skill.name)}</span>
        <span class="tt-status tt-status-${esc(skill.status)}">${esc(statusLabel)}</span>
      </div>
      <div class="tt-meta">
        <span class="tt-cat">${esc(categoryLabel)}</span>
        <span class="tt-years">${skill.years} yr${skill.years === 1 ? '' : 's'}</span>
      </div>
      <div class="tt-bar">
        <div class="tt-bar-track">
          ${isBanded ? `
            <div class="tt-bar-consolidated" style="width:${consolidatedLevel}%"></div>
            <div class="tt-bar-learning" style="left:${consolidatedLevel}%; width:${skill.level - consolidatedLevel}%"></div>
          ` : `
            <div class="tt-bar-${esc(skill.status)}" style="width:${skill.level}%"></div>
          `}
        </div>
        <div class="tt-bar-numbers">
          ${isBanded
            ? `<span>consolidated to <strong>${consolidatedLevel}</strong></span><span>pushing to <strong>${skill.level}</strong></span>`
            : `<span>level <strong>${skill.level}</strong>/100</span>`}
        </div>
      </div>
      ${evidenceItems ? `<div class="tt-evidence-label">Evidence</div><ul class="tt-evidence">${evidenceItems}</ul>` : ''}
    `;
  }

  // ---------- Legend ----------
  function renderLegend(d) {
    const el = document.getElementById('skills-legend');
    if (!el) return;
    const statusItems = d.statuses.map(s => `
      <li><span class="status-swatch status-swatch-${esc(s.id)}" style="opacity: ${s.opacity}"></span>${esc(s.label)}</li>
    `).join('');
    const levelItems = d.levels.map((l, i) => `
      <li><span class="level-dot">${i + 1}</span>${esc(l.label)}</li>
    `).join('');
    el.innerHTML = `
      <div class="legend-section">
        <h4 class="legend-title">Status</h4>
        <ul class="legend-list">${statusItems}</ul>
      </div>
      <div class="legend-section">
        <h4 class="legend-title">Level (radius)</h4>
        <ul class="legend-list level-list">${levelItems}</ul>
      </div>
      <p class="legend-note">Dark inner band = consolidated; bright outer = currently being pushed. Hover any wedge for evidence, years, and consolidation point.</p>
    `;
  }

  // ---------- Hybridization hub tooltip (explains the calculation) ----------
  function initHybridTooltip(d) {
    const hub = document.querySelector('.hybrid-hub');
    if (!hub) return;
    const tip = document.createElement('div');
    tip.className = 'radar-tooltip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    const html = `
      <div class="tt-head"><span class="tt-name">Hybridization ${esc(hub.dataset.h)}/100</span></div>
      <p class="tt-hybrid-note">Geometric mean of the average skill level across the four domains — high only when you are strong in <em>all</em> four; a weak domain pulls it down (the aggregation the UN's HDI uses).</p>
      <div class="tt-hybrid-areas">${esc(hub.dataset.areas)}</div>
    `;
    const show = e => { tip.innerHTML = html; tip.classList.add('visible'); positionTooltip(tip, e); };
    hub.addEventListener('mouseenter', show);
    hub.addEventListener('mousemove', e => positionTooltip(tip, e));
    hub.addEventListener('mouseleave', () => tip.classList.remove('visible'));
    hub.addEventListener('focus', () => {
      tip.innerHTML = html; tip.classList.add('visible');
      const r = hub.getBoundingClientRect();
      positionTooltip(tip, { clientX: r.left + r.width / 2, clientY: r.top });
    });
    hub.addEventListener('blur', () => tip.classList.remove('visible'));
  }

  // ---------- Filter tabs ----------
  function renderFilterTabs(categories) {
    const el = document.getElementById('skills-filter');
    if (!el || !categories) return;
    el.innerHTML = `
      <button class="filter-tab active" data-filter="all">All</button>
      ${categories.map(cat => `
        <button class="filter-tab" data-filter="${esc(cat.id)}">${esc(cat.label)}</button>
      `).join('')}
    `;
  }

  // Selecting a domain tab lights up that quadrant, collapses (dims) the others,
  // and swaps the side legend for a bar list of that domain's skills.
  function initFilterBehaviour(d) {
    const tabs = document.querySelectorAll('.filter-tab');
    if (!tabs.length) return;
    const groups = document.querySelectorAll('.radar-svg .skill-group, .radar-svg .quad-label, .radar-svg .skill-dot');

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        const filter = this.dataset.filter;
        tabs.forEach(t => t.classList.toggle('active', t === this));
        groups.forEach(el => {
          const match = filter === 'all' || el.dataset.category === filter;
          el.classList.toggle('dimmed', !match);
        });
        if (filter === 'all') renderLegend(d);
        else renderAreaBars(d, filter);
      });
    });
  }

  // Bar list of one domain's skills (sorted), shown in the side panel.
  function renderAreaBars(d, catId) {
    const el = document.getElementById('skills-legend');
    if (!el) return;
    const cat = d.categories.find(c => c.id === catId) || {};
    const skills = d.skills.filter(s => s.category === catId).sort((a, b) => b.level - a.level);
    const rows = skills.map(s => {
      const cons = resolveConsolidatedLevel(s);
      const banded = cons < s.level;
      const bar = banded
        ? `<span class="abar-consolidated" style="width:${cons}%"></span><span class="abar-learning" style="left:${cons}%;width:${s.level - cons}%"></span>`
        : `<span class="abar-${esc(s.status)}" style="width:${s.level}%"></span>`;
      return `<li class="area-row"><span class="area-name">${esc(s.name)}</span><span class="area-lvl">${s.level}</span><span class="abar-track">${bar}</span></li>`;
    }).join('');
    el.innerHTML = `<h4 class="legend-title">${esc(cat.label || catId)} — ${skills.length} skills</h4><ul class="area-list">${rows}</ul>`;
  }

  // ---------- Scroll animations ----------
  function initScrollAnimations() {
    const heroNumbers = document.querySelectorAll('.hero-stat-number');
    const radarSvg = document.querySelector('.radar-svg');

    if (!('IntersectionObserver' in window)) {
      heroNumbers.forEach(n => n.textContent = n.dataset.target + (n.dataset.suffix || ''));
      if (radarSvg) radarSvg.classList.add('animate');
      return;
    }

    const heroObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    heroNumbers.forEach(n => heroObs.observe(n));

    if (radarSvg) {
      const radarObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('animate'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      radarObs.observe(radarSvg);
    }
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Helpers ----------
  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
