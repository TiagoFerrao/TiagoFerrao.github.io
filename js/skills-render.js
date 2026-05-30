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
    initFilterBehaviour();
    initScrollAnimations();
    initTooltip(d.skills);
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
  // SVG centered at (0,0). Max radius = 180. ViewBox = -220..220.
  function renderRadar(d) {
    const el = document.getElementById('skills-radar');
    if (!el) return;

    const MAX_R = 180;
    const LEVELS = d.levels.length;  // 5
    const ringRadii = [];
    for (let i = 1; i <= LEVELS; i++) {
      ringRadii.push((i / LEVELS) * MAX_R);
    }

    // Build category angular slots
    // Quadrants go clockwise starting at TOP-RIGHT (-90° / 270°).
    // Q1 top-right    (-90° → 0°)   = management
    // Q2 bottom-right (0°   → 90°)  = stem
    // Q3 bottom-left  (90°  → 180°) = digital
    // Q4 top-left     (180° → 270°) = soft
    const quadrantOrder = ['management', 'stem', 'digital', 'soft'];
    const quadrantStart = { management: -90, stem: 0, digital: 90, soft: 180 }; // degrees
    const QUAD_SPAN = 90;

    // Group skills by category preserving data order
    const skillsByCat = {};
    quadrantOrder.forEach(catId => skillsByCat[catId] = []);
    d.skills.forEach(s => { if (skillsByCat[s.category]) skillsByCat[s.category].push(s); });

    // Status to CSS class
    const statusClass = {
      consolidated: 'wedge-consolidated',
      learning:     'wedge-learning',
    };

    // SVG parts — built into separate layer arrays:
    //   rings + axes (background) → wedges (on top) → labels (top)
    const wedgeParts = [];
    const ringParts  = [];
    const axisParts  = [];
    const labelParts = [];

    // Rings (concentric level guides) — drawn dotted in the background
    ringRadii.forEach(r => {
      ringParts.push(`<circle class="ring" cx="0" cy="0" r="${r}" />`);
    });

    // Quadrant separator axes (horizontal + vertical) — extend slightly past the outer ring
    const AXIS_EXT = 20;
    axisParts.push(`<line class="axis" x1="${-(MAX_R + AXIS_EXT)}" y1="0" x2="${MAX_R + AXIS_EXT}" y2="0" />`);
    axisParts.push(`<line class="axis" x1="0" y1="${-(MAX_R + AXIS_EXT)}" x2="0" y2="${MAX_R + AXIS_EXT}" />`);

    // 3) Skill wedges per quadrant — supports 2-band rendering
    //    If skill.consolidatedLevel < skill.level, render two bands:
    //       inner (0 → consolidatedLevel)  = consolidated (dark, mature)
    //       outer (consolidatedLevel → level) = learning (bright, active)
    //    Otherwise the whole wedge uses skill.status.
    quadrantOrder.forEach(catId => {
      const skills = skillsByCat[catId];
      if (!skills || !skills.length) return;
      const startDeg = quadrantStart[catId];
      const segSpan = QUAD_SPAN / skills.length;

      skills.forEach((skill, i) => {
        const a0 = startDeg + i * segSpan;
        const a1 = a0 + segSpan;
        const fullR = (skill.level / 100) * MAX_R;
        const consolidatedLevel = resolveConsolidatedLevel(skill);
        const consolidatedR = (consolidatedLevel / 100) * MAX_R;

        // Wrap each skill's wedges in <g> so hover events flow smoothly
        // between inner and outer bands (no flicker on band crossing).
        const groupAttrs = `data-skill-name="${esc(skill.name)}" data-category="${esc(skill.category)}"`;
        const wedgeAttrs = `data-category="${esc(skill.category)}"`;

        let inner = '';
        if (consolidatedLevel >= skill.level) {
          // Single-status wedge
          const cls = statusClass[skill.status] || 'wedge-consolidated';
          inner = `<path class="wedge ${cls}" ${wedgeAttrs} d="${pieWedgePath(a0, a1, fullR)}"/>`;
        } else {
          // 2-band: outer learning ring slice + inner consolidated pie
          if (consolidatedLevel < skill.level) {
            inner += `<path class="wedge wedge-learning" ${wedgeAttrs} d="${wedgeBandPath(a0, a1, consolidatedR, fullR)}"/>`;
          }
          if (consolidatedLevel > 0) {
            inner += `<path class="wedge wedge-consolidated" ${wedgeAttrs} d="${pieWedgePath(a0, a1, consolidatedR)}"/>`;
          }
        }
        wedgeParts.push(`<g class="skill-group" ${groupAttrs}>${inner}</g>`);
      });
    });

    // 4) Quadrant labels (placed just outside the outer ring, at the mid-angle)
    quadrantOrder.forEach(catId => {
      const cat = d.categories.find(c => c.id === catId);
      if (!cat) return;
      const midDeg = quadrantStart[catId] + QUAD_SPAN / 2;
      const labelR = MAX_R + 24;
      const { x, y } = polarToCart(labelR, midDeg);
      labelParts.push(`
        <text class="quad-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}"
              data-category="${esc(catId)}"
              text-anchor="middle" dominant-baseline="middle">
          ${esc(cat.label)}
        </text>
      `);
    });

    // Final layered assembly: rings + axes underneath → wedges on top → labels.
    el.innerHTML = `
      <svg viewBox="-220 -220 440 440" xmlns="http://www.w3.org/2000/svg" class="radar-svg" role="img" aria-label="Skills radar chart">
        ${ringParts.join('')}
        ${axisParts.join('')}
        ${wedgeParts.join('')}
        ${labelParts.join('')}
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

  function initFilterBehaviour() {
    const tabs = document.querySelectorAll('.filter-tab');
    const wedges = document.querySelectorAll('.wedge');
    const labels = document.querySelectorAll('.quad-label');
    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        const filter = this.dataset.filter;
        tabs.forEach(t => t.classList.toggle('active', t === this));
        wedges.forEach(w => {
          const match = filter === 'all' || w.dataset.category === filter;
          w.classList.toggle('dimmed', !match);
        });
        labels.forEach(l => {
          const match = filter === 'all' || l.dataset.category === filter;
          l.classList.toggle('dimmed', !match);
        });
      });
    });
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
