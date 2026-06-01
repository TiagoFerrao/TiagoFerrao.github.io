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
        wedgeParts.push(`<g class="skill-group" ${groupAttrs} data-mid="${am.toFixed(2)}" style="--mid:${am.toFixed(1)}">${inner}</g>`);
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
    let tooltip = document.querySelector('.radar-tooltip.skill-tt');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'radar-tooltip skill-tt';
      tooltip.setAttribute('role', 'tooltip');
      document.body.appendChild(tooltip);
    }

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
    let tip = document.querySelector('.radar-tooltip.hybrid-tt');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'radar-tooltip hybrid-tt';
      tip.setAttribute('role', 'tooltip');
      document.body.appendChild(tip);
    }
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

  // Selecting a domain tab closes the full radar (wedges collapse radially),
  // then opens that domain as a half-fan on the left with its skill bar list on the right.
  function initFilterBehaviour(d) {
    const tabs = [...document.querySelectorAll('.filter-tab')];
    if (!tabs.length) return;
    const dashboard = document.querySelector('.skills-dashboard');

    function activate(filter) {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
      selectDomain(d, filter, dashboard);
    }

    tabs.forEach(tab => tab.addEventListener('click', () => activate(tab.dataset.filter)));

    // Clicking a sector label around the radar selects that domain too.
    // Delegated on the container so it survives re-renders.
    const radar = document.getElementById('skills-radar');
    if (radar) {
      radar.addEventListener('click', e => {
        const lbl = e.target.closest('.quad-label');
        if (lbl && lbl.dataset.category) activate(lbl.dataset.category);
      });
    }
  }

  function selectDomain(d, filter, dashboard) {
    const radar = document.getElementById('skills-radar');
    if (!radar) return;
    const current = radar.querySelector('.radar-svg');
    const isOnFull = dashboard && !dashboard.classList.contains('focused');

    // Smooth in-place finish after Phase 1+2 — NO SVG swap.
    // Triggers dashboard grid resize, area-bar reveal, and viewBox zoom in parallel.
    const finishInPlace = (svg) => {
      // Remember which category is focused so reverseToFull can undo it later
      svg.dataset.focusedCategory = filter;

      const DASH_DUR = 500;
      const VB_DUR   = 600;
      const BARS_DUR = 400;

      if (dashboard) {
        dashboard.style.transition = `grid-template-columns ${DASH_DUR}ms ease`;
        dashboard.classList.add('focused');
      }

      renderAreaBars(d, filter);
      const legend = document.getElementById('skills-legend');
      if (legend) {
        legend.style.opacity = '0';
        requestAnimationFrame(() => {
          legend.style.transition = `opacity ${BARS_DUR}ms ease ${Math.round(BARS_DUR * 0.2)}ms`;
          legend.style.opacity = '1';
        });
      }

      // Drop in the focus-state hub (category name + skill count) since the
      // original hybridization hub was faded out during Phase 1.
      const focusHub = addFocusHub(svg, d, filter);
      if (focusHub) {
        requestAnimationFrame(() => {
          focusHub.style.transition = `opacity ${VB_DUR}ms ease ${Math.round(VB_DUR * 0.35)}ms`;
          focusHub.style.opacity = '1';
        });
      }

      transitionViewBox(svg, [-80, -210, 300, 420], VB_DUR, () => {
        initTooltip(d.skills);
      });
    };

    // Fallback: original behaviour with SVG swap (used for non-Phase1+2 paths)
    const finishToFocusedSwap = () => {
      if (dashboard) dashboard.classList.add('focused');
      renderRadarFocus(d, filter);
      renderAreaBars(d, filter);
      const next = radar.querySelector('.radar-svg');
      if (next) requestAnimationFrame(() => next.classList.add('animate'));
      initTooltip(d.skills);
    };
    const finishToFull = () => {
      if (dashboard) dashboard.classList.remove('focused');
      renderRadar(d);
      renderLegend(d);
      initHybridTooltip(d);
      const next = radar.querySelector('.radar-svg');
      if (next) requestAnimationFrame(() => next.classList.add('animate'));
      initTooltip(d.skills);
    };

    // From the FULL radar to a category: Phase 1 + Phase 2 + smooth in-place finish.
    // From a category back to All: reverse Phase 3 → Phase 2 → Phase 1 in place.
    // Other transitions (focused → other focused) fall back to close + re-render.
    if (current && isOnFull && filter !== 'all') {
      foldNonSelected(current, filter, () => {
        slideAndExpand(current, filter, d, () => {
          finishInPlace(current);
        });
      });
    } else if (current && !isOnFull && filter === 'all') {
      const prevCat = current.dataset.focusedCategory;
      if (prevCat) {
        reverseToFull(current, prevCat, d, dashboard);
      } else {
        current.classList.add('closing');
        setTimeout(finishToFull, 430);
      }
    } else if (current && !isOnFull && filter !== 'all') {
      // Focused → other focused: radial wipe between categories
      const prevCat = current.dataset.focusedCategory;
      if (prevCat && prevCat !== filter) {
        radialSwapCategory(current, prevCat, filter, d);
      } else if (prevCat === filter) {
        return; // tab already active, no-op
      } else {
        current.classList.add('closing');
        setTimeout(finishToFocusedSwap, 430);
      }
    } else if (current) {
      current.classList.add('closing');
      setTimeout(() => {
        if (filter === 'all') finishToFull();
        else finishToFocusedSwap();
      }, 430);
    } else {
      if (filter === 'all') finishToFull();
      else finishToFocusedSwap();
    }
  }

  // ---------- REVERSE Phase 1: unfold non-selected wedges, fade decorations back in ----------
  function unfoldNonSelected(svg, selectedCat, callback) {
    const cwEdge  = { management: 0,   stem: 90, digital: 180, soft: 270 };
    const ccwEdge = { management: -90, stem: 0,  digital: 90,  soft: 180 };
    const start  = cwEdge[selectedCat]  || 0;
    const target = ccwEdge[selectedCat] || 0;

    const allGroups = [...svg.querySelectorAll('.skill-group')];
    const toUnfold = allGroups.filter(g => g.dataset.category !== selectedCat);

    // Reverse stagger: wedges that folded LAST unfold FIRST
    toUnfold.sort((a, b) => {
      const cw = mid => ((mid - start) % 360 + 360) % 360;
      return cw(parseFloat(b.dataset.mid) || 0) - cw(parseFloat(a.dataset.mid) || 0);
    });

    // Each wedge's folded-state rotation (same formula as foldNonSelected)
    const folded = toUnfold.map(g => {
      const mid = parseFloat(g.dataset.mid) || 0;
      let cw = ((target - mid) % 360 + 360) % 360;
      if (cw === 0) cw = 360;
      return cw;
    });

    const decorations = [...svg.querySelectorAll('.quad-label, .hybrid-hub, .sector-bg, .ring')];

    const PER_WEDGE_DUR = 360;
    const STEP = 11;
    const startTime = performance.now();
    const totalDur = (toUnfold.length - 1) * STEP + PER_WEDGE_DUR + 20;

    function tick(now) {
      const elapsed = now - startTime;

      toUnfold.forEach((g, i) => {
        const delay = i * STEP;
        const lt = Math.max(0, Math.min(1, (elapsed - delay) / PER_WEDGE_DUR));
        const eased = 1 - Math.pow(1 - lt, 3);
        const angle = folded[i] * (1 - eased);
        g.setAttribute('transform', `rotate(${angle.toFixed(2)})`);
        g.style.opacity = String(eased);
      });

      // Decorations fade IN over the full unfold duration
      const decorT = Math.min(1, elapsed / totalDur);
      const decorEased = 1 - Math.pow(1 - decorT, 2);
      const decorOpacity = String(decorEased);
      decorations.forEach(el => { el.style.opacity = decorOpacity; });

      if (elapsed < totalDur) requestAnimationFrame(tick);
      else {
        // Clean up inline styles so CSS defaults apply on next render
        toUnfold.forEach(g => {
          g.removeAttribute('transform');
          g.style.opacity = '';
        });
        decorations.forEach(el => { el.style.opacity = ''; });
        if (callback) callback();
      }
    }

    requestAnimationFrame(tick);
  }

  // ---------- REVERSE Phase 2: contract selected wedges from right hemisphere back to quadrant ----------
  function unslideSelectedWedges(svg, selectedCat, dataObj, duration, callback) {
    const skills = dataObj.skills
      .filter(s => s.category === selectedCat)
      .sort((a, b) => b.level - a.level);
    const N = skills.length;
    if (N === 0) { if (callback) callback(); return; }

    const R0 = 64;
    const MAX_R = 205;
    const GAP = MAX_R - R0;
    const lvlR = lvl => R0 + (Math.max(0, Math.min(100, lvl)) / 100) * GAP;

    const quadStartMap = { management: -90, stem: 0, digital: 90, soft: 180 };
    const quadStart = quadStartMap[selectedCat];
    const QUAD_SEG = 90 / N;
    const QUAD_PAD = QUAD_SEG * 0.12;
    const HEMI_SEG = 180 / N;
    const HEMI_PAD = HEMI_SEG * 0.12;
    const HEMI_START = -90;

    const groups = [...svg.querySelectorAll('.skill-group')]
      .filter(g => g.dataset.category === selectedCat);

    const entries = skills.map((skill, i) => {
      const group = groups.find(g => g.dataset.skillName === skill.name);
      if (!group) return null;
      const paths = [...group.querySelectorAll('path.wedge')];
      const fullR = lvlR(skill.level);
      const consR = lvlR(resolveConsolidatedLevel(skill));
      return {
        paths, fullR, consR,
        startA0:  HEMI_START + i * HEMI_SEG + HEMI_PAD,
        startA1:  HEMI_START + (i + 1) * HEMI_SEG - HEMI_PAD,
        targetA0: quadStart + i * QUAD_SEG + QUAD_PAD,
        targetA1: quadStart + (i + 1) * QUAD_SEG - QUAD_PAD,
      };
    }).filter(Boolean);

    const startTime = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);

      entries.forEach(({ paths, fullR, consR, startA0, startA1, targetA0, targetA1 }) => {
        const a0 = startA0 + (targetA0 - startA0) * eased;
        const a1 = startA1 + (targetA1 - startA1) * eased;
        if (consR >= fullR) {
          if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, R0, fullR));
        } else {
          if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, consR, fullR));
          if (paths[1] && consR > R0) paths[1].setAttribute('d', wedgeBandPath(a0, a1, R0, consR));
        }
      });

      if (t < 1) requestAnimationFrame(tick);
      else if (callback) callback();
    }
    requestAnimationFrame(tick);
  }

  // ---------- REVERSE Phase 3: uncrop viewBox, unfocus dashboard, restore legend, remove focus hub ----------
  function reversePhase3(svg, dataObj, dashboard, duration, callback) {
    // Focus hub fades out quickly and gets removed
    const focusHub = svg.querySelector('.focus-hub-overlay');
    if (focusHub) {
      const halfDur = Math.round(duration * 0.5);
      focusHub.style.transition = `opacity ${halfDur}ms ease`;
      focusHub.style.opacity = '0';
      setTimeout(() => focusHub.remove(), halfDur + 50);
    }

    if (dashboard) {
      dashboard.style.transition = `grid-template-columns ${duration}ms ease`;
      dashboard.classList.remove('focused');
    }

    // Swap area-bars back to the original legend, with a cross-fade
    const legend = document.getElementById('skills-legend');
    if (legend) {
      const fadeDur = Math.round(duration * 0.4);
      legend.style.transition = `opacity ${fadeDur}ms ease`;
      legend.style.opacity = '0';
      setTimeout(() => {
        renderLegend(dataObj);
        requestAnimationFrame(() => { legend.style.opacity = '1'; });
      }, fadeDur);
    }

    transitionViewBox(svg, [-272, -272, 544, 544], duration, callback);
  }

  // Orchestrate the full reverse: Phase 3 first (so focus hub fully fades before
  // hybrid hub starts coming back), then Phase 2 + Phase 1 in parallel.
  function reverseToFull(svg, prevCat, dataObj, dashboard) {
    reversePhase3(svg, dataObj, dashboard, 600, () => {
      unslideSelectedWedges(svg, prevCat, dataObj, 600, null);
      unfoldNonSelected(svg, prevCat, () => {
        delete svg.dataset.focusedCategory;
      });
    });
  }

  // ---------- Radial wipe between two focused categories ----------
  // Old category's wedges retract into the hub, new category's wedges grow back out.
  // Hub text and area-bars cross-fade in parallel. ViewBox & dashboard stay focused.
  function radialSwapCategory(svg, prevCat, newCat, dataObj) {
    if (prevCat === newCat) return;

    const RETRACT_DUR = 400;
    const GROW_DUR = 400;
    const OVERLAP = 100; // grow starts this many ms before retract finishes

    // Update tracked focused category up-front so concurrent state checks see new value
    svg.dataset.focusedCategory = newCat;

    // Cross-fade the focus-hub text (whole overlay fades so disc fades briefly too — acceptable)
    const focusHub = svg.querySelector('.focus-hub-overlay');
    if (focusHub) {
      const cat = dataObj.categories.find(c => c.id === newCat) || {};
      const count = dataObj.skills.filter(s => s.category === newCat).length;
      focusHub.style.transition = 'opacity 250ms ease';
      focusHub.style.opacity = '0';
      setTimeout(() => {
        const nameText = focusHub.querySelector('.focus-hub-name');
        const subText = focusHub.querySelector('.focus-hub-sub');
        if (nameText) nameText.textContent = (cat.label || newCat).toUpperCase();
        if (subText) subText.textContent = `${count} skills`;
        requestAnimationFrame(() => { focusHub.style.opacity = '1'; });
      }, 250);
    }

    // Cross-fade the area-bars
    const legend = document.getElementById('skills-legend');
    if (legend) {
      legend.style.transition = 'opacity 200ms ease';
      legend.style.opacity = '0';
      setTimeout(() => {
        renderAreaBars(dataObj, newCat);
        requestAnimationFrame(() => { legend.style.opacity = '1'; });
      }, 200);
    }

    // Retract old wedges into the hub
    retractSelectedWedges(svg, prevCat, dataObj, RETRACT_DUR, () => {
      // Old wedges are now collapsed — restore their paths to original quadrant
      // geometry and fold them at the NEW category's target (invisible, but consistent
      // state for later reverseToFull).
      resetWedgePathsToOriginal(svg, prevCat, dataObj);
      foldGroupToTarget(svg, prevCat, newCat);

      // Re-fold the OTHER non-newCat categories (they were folded at prevCat's target)
      // so they're consistent with the new focused state.
      const allCats = ['management', 'stem', 'digital', 'soft'];
      allCats.filter(c => c !== prevCat && c !== newCat)
        .forEach(c => foldGroupToTarget(svg, c, newCat));
    });

    // Slightly before the retract finishes, start growing the new wedges from the hub
    setTimeout(() => {
      growNewWedges(svg, newCat, dataObj, GROW_DUR, null);
    }, RETRACT_DUR - OVERLAP);
  }

  // Animate a category's wedges' outer radii from their level-R down to R0 (collapse to hub).
  function retractSelectedWedges(svg, selectedCat, dataObj, duration, callback) {
    const skills = dataObj.skills.filter(s => s.category === selectedCat).sort((a, b) => b.level - a.level);
    const N = skills.length;
    if (N === 0) { if (callback) callback(); return; }

    const R0 = 64;
    const MAX_R = 205;
    const GAP = MAX_R - R0;
    const lvlR = lvl => R0 + (Math.max(0, Math.min(100, lvl)) / 100) * GAP;

    const HEMI_SEG = 180 / N;
    const HEMI_PAD = HEMI_SEG * 0.12;
    const HEMI_START = -90;

    const groups = [...svg.querySelectorAll('.skill-group')]
      .filter(g => g.dataset.category === selectedCat);

    const entries = skills.map((skill, i) => {
      const group = groups.find(g => g.dataset.skillName === skill.name);
      if (!group) return null;
      const paths = [...group.querySelectorAll('path.wedge')];
      const fullR = lvlR(skill.level);
      const consR = lvlR(resolveConsolidatedLevel(skill));
      return {
        paths, fullR, consR,
        a0: HEMI_START + i * HEMI_SEG + HEMI_PAD,
        a1: HEMI_START + (i + 1) * HEMI_SEG - HEMI_PAD,
      };
    }).filter(Boolean);

    const startTime = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t * t; // ease-in: slow start, fast end — like inhaling

      entries.forEach(({ paths, fullR, consR, a0, a1 }) => {
        const currFullR = fullR + (R0 - fullR) * eased;
        const currConsR = consR + (R0 - consR) * eased;
        if (consR >= fullR) {
          if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, R0, currFullR));
        } else {
          if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, currConsR, currFullR));
          if (paths[1] && consR > R0) paths[1].setAttribute('d', wedgeBandPath(a0, a1, R0, currConsR));
        }
      });

      if (t < 1) requestAnimationFrame(tick);
      else if (callback) callback();
    }
    requestAnimationFrame(tick);
  }

  // Grow a category's wedges from R0 outward into the right-hemisphere fan.
  // Resets the groups' transforms and opacities first so they appear at HEMI angles.
  function growNewWedges(svg, newCat, dataObj, duration, callback) {
    const skills = dataObj.skills.filter(s => s.category === newCat).sort((a, b) => b.level - a.level);
    const N = skills.length;
    if (N === 0) { if (callback) callback(); return; }

    const R0 = 64;
    const MAX_R = 205;
    const GAP = MAX_R - R0;
    const lvlR = lvl => R0 + (Math.max(0, Math.min(100, lvl)) / 100) * GAP;

    const HEMI_SEG = 180 / N;
    const HEMI_PAD = HEMI_SEG * 0.12;
    const HEMI_START = -90;

    const groups = [...svg.querySelectorAll('.skill-group')]
      .filter(g => g.dataset.category === newCat);

    const entries = skills.map((skill, i) => {
      const group = groups.find(g => g.dataset.skillName === skill.name);
      if (!group) return null;
      group.removeAttribute('transform'); // un-fold (no animation)
      group.style.opacity = '0';
      const paths = [...group.querySelectorAll('path.wedge')];
      const fullR = lvlR(skill.level);
      const consR = lvlR(resolveConsolidatedLevel(skill));
      const a0 = HEMI_START + i * HEMI_SEG + HEMI_PAD;
      const a1 = HEMI_START + (i + 1) * HEMI_SEG - HEMI_PAD;
      // Start collapsed at hub
      if (consR >= fullR) {
        if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, R0, R0));
      } else {
        if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, R0, R0));
        if (paths[1] && consR > R0) paths[1].setAttribute('d', wedgeBandPath(a0, a1, R0, R0));
      }
      return { group, paths, fullR, consR, a0, a1 };
    }).filter(Boolean);

    const startTime = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out: fast start, slow finish

      entries.forEach(({ group, paths, fullR, consR, a0, a1 }) => {
        const currFullR = R0 + (fullR - R0) * eased;
        const currConsR = R0 + (consR - R0) * eased;
        if (consR >= fullR) {
          if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, R0, currFullR));
        } else {
          if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, currConsR, currFullR));
          if (paths[1] && consR > R0) paths[1].setAttribute('d', wedgeBandPath(a0, a1, R0, currConsR));
        }
        group.style.opacity = String(eased);
      });

      if (t < 1) requestAnimationFrame(tick);
      else {
        entries.forEach(({ group }) => { group.style.opacity = ''; });
        if (callback) callback();
      }
    }
    requestAnimationFrame(tick);
  }

  // Instantly reset a category's wedge paths to their original quadrant geometry
  function resetWedgePathsToOriginal(svg, catId, dataObj) {
    const skills = dataObj.skills.filter(s => s.category === catId).sort((a, b) => b.level - a.level);
    const N = skills.length;
    if (N === 0) return;

    const R0 = 64;
    const MAX_R = 205;
    const GAP = MAX_R - R0;
    const lvlR = lvl => R0 + (Math.max(0, Math.min(100, lvl)) / 100) * GAP;

    const quadStartMap = { management: -90, stem: 0, digital: 90, soft: 180 };
    const quadStart = quadStartMap[catId];
    const QUAD_SEG = 90 / N;
    const QUAD_PAD = QUAD_SEG * 0.12;

    const groups = [...svg.querySelectorAll('.skill-group')]
      .filter(g => g.dataset.category === catId);

    skills.forEach((skill, i) => {
      const group = groups.find(g => g.dataset.skillName === skill.name);
      if (!group) return;
      const paths = [...group.querySelectorAll('path.wedge')];
      const fullR = lvlR(skill.level);
      const consR = lvlR(resolveConsolidatedLevel(skill));
      const a0 = quadStart + i * QUAD_SEG + QUAD_PAD;
      const a1 = quadStart + (i + 1) * QUAD_SEG - QUAD_PAD;
      if (consR >= fullR) {
        if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, R0, fullR));
      } else {
        if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, consR, fullR));
        if (paths[1] && consR > R0) paths[1].setAttribute('d', wedgeBandPath(a0, a1, R0, consR));
      }
    });
  }

  // Instantly set a category's wedges to the "folded for newSelectedCat" state (no animation)
  function foldGroupToTarget(svg, catId, newSelectedCat) {
    const ccwEdge = { management: -90, stem: 0, digital: 90, soft: 180 };
    const target = ccwEdge[newSelectedCat] || 0;

    const groups = [...svg.querySelectorAll('.skill-group')]
      .filter(g => g.dataset.category === catId);

    groups.forEach(g => {
      const mid = parseFloat(g.dataset.mid) || 0;
      let cw = ((target - mid) % 360 + 360) % 360;
      if (cw === 0) cw = 360;
      g.setAttribute('transform', `rotate(${cw.toFixed(2)})`);
      g.style.opacity = '0';
    });
  }

  // Build a fresh hub overlay (disc + category label + count) and append it to the SVG.
  // Returns the new <g> element so the caller can fade it in.
  function addFocusHub(svg, dataObj, selectedCat) {
    if (svg.querySelector('.focus-hub-overlay')) return null;

    const cat = dataObj.categories.find(c => c.id === selectedCat) || {};
    const count = dataObj.skills.filter(s => s.category === selectedCat).length;
    const ns = 'http://www.w3.org/2000/svg';
    const R0 = 64; // matches renderRadar's R0 — keeps the disc the right size in the SVG's user space

    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'focus-hub-overlay');
    g.style.opacity = '0';

    const disc = document.createElementNS(ns, 'circle');
    disc.setAttribute('class', 'radar-center-disc');
    disc.setAttribute('cx', '0');
    disc.setAttribute('cy', '0');
    disc.setAttribute('r', String(R0 - 6));

    const nameText = document.createElementNS(ns, 'text');
    nameText.setAttribute('class', 'focus-hub-name');
    nameText.setAttribute('x', '0');
    nameText.setAttribute('y', '-2');
    nameText.setAttribute('text-anchor', 'middle');
    nameText.setAttribute('font-size', '16');
    nameText.textContent = (cat.label || selectedCat).toUpperCase();

    const subText = document.createElementNS(ns, 'text');
    subText.setAttribute('class', 'focus-hub-sub');
    subText.setAttribute('x', '0');
    subText.setAttribute('y', '16');
    subText.setAttribute('text-anchor', 'middle');
    subText.setAttribute('font-size', '11');
    subText.textContent = `${count} skills`;

    g.appendChild(disc);
    g.appendChild(nameText);
    g.appendChild(subText);
    svg.appendChild(g);
    return g;
  }

  // Animate the SVG's viewBox attribute over `duration` ms to crop/zoom smoothly.
  function transitionViewBox(svg, targetVB, duration, callback) {
    const startVB = (svg.getAttribute('viewBox') || '0 0 0 0').split(/\s+/).map(parseFloat);
    const startTime = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const vb = startVB.map((s, i) => s + (targetVB[i] - s) * eased);
      svg.setAttribute('viewBox', vb.map(v => v.toFixed(1)).join(' '));
      if (t < 1) requestAnimationFrame(tick);
      else if (callback) callback();
    }
    requestAnimationFrame(tick);
  }

  // ---------- Phase 1: fold non-selected wedges flat to the 0° axis ----------
  // Uses SVG's native `transform` attribute (rotate around 0,0 by default),
  // which avoids the CSS transform-box quirks that broke earlier attempts.
  // Stagger order: clockwise distance from the selected quadrant's leading edge.
  function foldNonSelected(svg, selectedCat, callback) {
    // Stagger STARTS at the selected quadrant's clockwise edge (so the wedge
    // just past selected — e.g. first stem wedge for management — falls first).
    const cwEdge  = { management: 0,   stem: 90, digital: 180, soft: 270 };
    // Wedges CONVERGE at the selected quadrant's counter-clockwise edge
    // (e.g. -90°/top for management) — that's where the CW spin stops.
    const ccwEdge = { management: -90, stem: 0,  digital: 90,  soft: 180 };
    const start  = cwEdge[selectedCat]  || 0;
    const target = ccwEdge[selectedCat] || 0;

    const allGroups = [...svg.querySelectorAll('.skill-group')];
    const toFold = allGroups.filter(g => g.dataset.category !== selectedCat);

    toFold.sort((a, b) => {
      const cw = mid => ((mid - start) % 360 + 360) % 360;
      return cw(parseFloat(a.dataset.mid) || 0) - cw(parseFloat(b.dataset.mid) || 0);
    });

    const decorations = [...svg.querySelectorAll('.quad-label, .hybrid-hub, .sector-bg, .ring')];

    const PER_WEDGE_DUR = 360;
    const STEP = 11;
    const DECOR_FADE_DUR = 300;
    const startTime = performance.now();
    const totalDur = (toFold.length - 1) * STEP + PER_WEDGE_DUR + 20;

    function tick(now) {
      const elapsed = now - startTime;

      toFold.forEach((g, i) => {
        const delay = i * STEP;
        const lt = Math.max(0, Math.min(1, (elapsed - delay) / PER_WEDGE_DUR));
        const eased = 1 - Math.pow(1 - lt, 3);
        const mid = parseFloat(g.dataset.mid) || 0;
        // Always clockwise (positive) the long way around to reach `target`.
        // Wedges nearest the target spin the most — first in the stagger = biggest swing.
        let cw = ((target - mid) % 360 + 360) % 360;
        if (cw === 0) cw = 360;
        const angle = cw * eased;
        g.setAttribute('transform', `rotate(${angle.toFixed(2)})`);
        g.style.opacity = String(1 - eased);
      });

      // Fade decorations over the slower debug window so they don't disappear instantly
      const decorT = Math.min(1, elapsed / DECOR_FADE_DUR);
      const decorEased = 1 - Math.pow(1 - decorT, 2);
      const decorOpacity = String(1 - decorEased);
      decorations.forEach(el => { el.style.opacity = decorOpacity; });

      if (elapsed < totalDur) requestAnimationFrame(tick);
      else if (callback) callback();
    }

    requestAnimationFrame(tick);
  }

  // ---------- Phase 2: slide & expand selected wedges to the right hemisphere ----------
  // Interpolates each wedge's path `d` attribute from its quadrant slot (90° fan)
  // to its new slot in the right-hemisphere fan (180°). No CSS transforms involved.
  function slideAndExpand(svg, selectedCat, dataObj, callback) {
    const skills = dataObj.skills
      .filter(s => s.category === selectedCat)
      .sort((a, b) => b.level - a.level);
    const N = skills.length;
    if (N === 0) { if (callback) callback(); return; }

    // Must match the geometry constants used in renderRadar()
    const R0 = 64;
    const MAX_R = 205;
    const GAP = MAX_R - R0;
    const lvlR = lvl => R0 + (Math.max(0, Math.min(100, lvl)) / 100) * GAP;

    const quadStartMap = { management: -90, stem: 0, digital: 90, soft: 180 };
    const quadStart = quadStartMap[selectedCat];
    const ORIG_SEG = 90 / N;
    const ORIG_PAD = ORIG_SEG * 0.12;
    const NEW_SEG = 180 / N;
    const NEW_PAD = NEW_SEG * 0.12;
    const NEW_START = -90;

    const groups = [...svg.querySelectorAll('.skill-group')]
      .filter(g => g.dataset.category === selectedCat);

    const entries = skills.map((skill, i) => {
      const group = groups.find(g => g.dataset.skillName === skill.name);
      if (!group) return null;
      const paths = [...group.querySelectorAll('path.wedge')];
      const fullR = lvlR(skill.level);
      const consR = lvlR(resolveConsolidatedLevel(skill));
      return {
        paths, fullR, consR,
        origA0: quadStart + i * ORIG_SEG + ORIG_PAD,
        origA1: quadStart + (i + 1) * ORIG_SEG - ORIG_PAD,
        newA0:  NEW_START + i * NEW_SEG + NEW_PAD,
        newA1:  NEW_START + (i + 1) * NEW_SEG - NEW_PAD,
      };
    }).filter(Boolean);

    const DURATION = 600;
    const startTime = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - startTime) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);

      entries.forEach(({ paths, fullR, consR, origA0, origA1, newA0, newA1 }) => {
        const a0 = origA0 + (newA0 - origA0) * eased;
        const a1 = origA1 + (newA1 - origA1) * eased;
        // Recompute path d matching renderRadar's wedge-band layout
        if (consR >= fullR) {
          if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, R0, fullR));
        } else {
          if (paths[0]) paths[0].setAttribute('d', wedgeBandPath(a0, a1, consR, fullR));
          if (paths[1] && consR > R0) paths[1].setAttribute('d', wedgeBandPath(a0, a1, R0, consR));
        }
      });

      if (t < 1) requestAnimationFrame(tick);
      else if (callback) callback();
    }

    requestAnimationFrame(tick);
  }

  // Focused render: one domain as a 180° fan opening right, hub on the left.
  function renderRadarFocus(d, catId) {
    const el = document.getElementById('skills-radar');
    if (!el) return;
    const cat = d.categories.find(c => c.id === catId) || {};
    const skills = d.skills.filter(s => s.category === catId).sort((a, b) => b.level - a.level);

    const R0 = 46, MAX_R = 180, GAP = MAX_R - R0;
    const lvlR = l => R0 + (Math.max(0, Math.min(100, l)) / 100) * GAP;
    const A0 = -90, SPAN = 180;
    const seg = skills.length ? SPAN / skills.length : SPAN;

    const wedgeParts = [];
    skills.forEach((s, i) => {
      const a0 = A0 + i * seg + seg * 0.1;
      const a1 = A0 + (i + 1) * seg - seg * 0.1;
      const am = (a0 + a1) / 2;
      const fullR = lvlR(s.level);
      const consR = lvlR(resolveConsolidatedLevel(s));
      let inner = '';
      if (consR >= fullR) {
        const cls = s.status === 'learning' ? 'wedge-learning' : 'wedge-consolidated';
        inner = `<path class="wedge ${cls}" d="${wedgeBandPath(a0, a1, R0, fullR)}"/>`;
      } else {
        inner += `<path class="wedge wedge-learning" d="${wedgeBandPath(a0, a1, consR, fullR)}"/>`;
        if (consR > R0) inner += `<path class="wedge wedge-consolidated" d="${wedgeBandPath(a0, a1, R0, consR)}"/>`;
      }
      wedgeParts.push(`<g class="skill-group" data-skill-name="${esc(s.name)}" data-category="${esc(s.category)}" data-mid="${am.toFixed(2)}" style="--mid:${am.toFixed(1)}">${inner}</g>`);
    });

    const hub = `
      <circle class="radar-center-disc" cx="0" cy="0" r="${R0 - 6}"/>
      <text class="focus-hub-name" x="0" y="-1" text-anchor="middle">${esc(cat.label || catId)}</text>
      <text class="focus-hub-sub" x="0" y="13" text-anchor="middle">${skills.length} skills</text>`;

    el.innerHTML = `
      <svg viewBox="-80 -210 300 420" xmlns="http://www.w3.org/2000/svg" class="radar-svg focus" role="img" aria-label="${esc(cat.label || catId)} skills">
        <circle class="sector-bg" cx="0" cy="0" r="${MAX_R + 10}"/>
        ${wedgeParts.join('')}
        ${hub}
      </svg>
    `;
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
