/* ============================================
   BUSINESS / CAREER TIMELINE RENDERER
   - Vertical timeline (all sizes), newest-first: year | dot | company.
   - Desktop (>=900px): worked-cities map (window.worldMapData) on the right;
     clicking a role lights its city/cities and shows the story in a wide
     detail panel BELOW the map. Defaults to the newest role.
   - Mobile (<900px): no map; tap a role to expand its story inline (accordion).
   ============================================ */

(function () {
  'use strict';

  const data = window.businessData;
  const tlMount = document.getElementById('business-timeline');
  if (!data || !tlMount) return;

  const map = window.worldMapData;
  const mapMount = document.getElementById('business-map-wrap');

  const esc = s => String(s).replace(/[&<>"]/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));

  // ---------- Timeline (vertical: year | dot | company) ----------
  tlMount.classList.add('timeline');
  tlMount.innerHTML = '<ol class="timeline-items">' + data.map((e, i) => `
    <li class="tl-item" data-i="${i}">
      <button class="tl-dot" id="tl-dot-${i}" type="button" aria-expanded="false" aria-controls="tl-panel-${i}">
        <span class="tl-year">${esc(e.year)}</span>
        <span class="tl-marker" aria-hidden="true"></span>
        <span class="tl-company">${esc(e.company)}</span>
      </button>
      <div class="tl-panel" id="tl-panel-${i}" role="region" aria-labelledby="tl-dot-${i}">
        <p class="tl-role"><span class="accent">${esc(e.role)}</span></p>
        <p class="tl-meta">${esc(e.dates)} &middot; ${esc(e.location)}</p>
        <p class="tl-blurb">${esc(e.blurb)}</p>
      </div>
    </li>`).join('') + '</ol>';

  // ---------- Map + detail panel (desktop enhancement) ----------
  let detail = null;
  const cityEls = {};
  if (map && mapMount) {
    const weight = {};
    data.forEach(e => (e.cities || []).forEach(c => { weight[c] = (weight[c] || 0) + 1; }));

    const circles = Object.keys(map.cities)
      .filter(k => k in weight)
      .map(k => {
        const c = map.cities[k];
        const w = weight[k];
        const r = (1.3 + w * 0.25).toFixed(2); // bigger circle = more roles in that city
        return `<circle class="wm-work" data-city="${k}" cx="${c.cx}" cy="${c.cy}" r="${r}">`
             + `<title>${esc(c.label)} · ${w} role${w > 1 ? 's' : ''}</title></circle>`;
      }).join('');

    mapMount.innerHTML = `
      <p class="wm-title">Where I worked</p>
      <div class="biz-map">
        <div class="wm-frame">
          <svg class="wm-svg" viewBox="${esc(map.viewBox)}" role="img"
               aria-label="Map of European cities where Tiago has worked"
               preserveAspectRatio="xMidYMid meet">
            ${map.land}
            <g class="wm-work-layer">${circles}</g>
          </svg>
        </div>
      </div>
      <div class="biz-detail" id="biz-detail" aria-live="polite"></div>`;

    detail = mapMount.querySelector('.biz-detail');
    mapMount.querySelectorAll('.wm-work').forEach(el => { cityEls[el.dataset.city] = el; });
  }

  const lis = [...tlMount.querySelectorAll('.tl-item')];
  const mapActive = () => !!detail && window.matchMedia('(min-width: 900px)').matches;
  let current = null;

  function clearCities() {
    Object.values(cityEls).forEach(el => el.classList.remove('is-active'));
  }

  function detailHtml(e) {
    return `<h4>${esc(e.company)}</h4>
      <p class="tl-role"><span class="accent">${esc(e.role)}</span></p>
      <p class="tl-meta">${esc(e.dates)} &middot; ${esc(e.location)}</p>
      <p class="tl-blurb">${esc(e.blurb)}</p>`;
  }

  function markRow(li) {
    lis.forEach(x => {
      const on = x === li;
      x.classList.toggle('is-open', on);
      x.querySelector('.tl-dot').setAttribute('aria-expanded', on ? 'true' : 'false');
    });
  }

  // Desktop: select a role -> light cities + fill the panel below the map.
  function select(li) {
    const e = data[+li.dataset.i];
    markRow(li);
    clearCities();
    (e.cities || []).forEach(c => { if (cityEls[c]) cityEls[c].classList.add('is-active'); });
    detail.innerHTML = detailHtml(e);
    current = li;
  }

  // Mobile: accordion toggle.
  function openAccordion(li) {
    if (current && current !== li) closeAccordion(current);
    li.classList.add('is-open');
    li.querySelector('.tl-dot').setAttribute('aria-expanded', 'true');
    current = li;
  }
  function closeAccordion(li) {
    if (!li) return;
    li.classList.remove('is-open');
    li.querySelector('.tl-dot').setAttribute('aria-expanded', 'false');
    if (current === li) current = null;
  }

  lis.forEach(li => {
    li.querySelector('.tl-dot').addEventListener('click', ev => {
      ev.stopPropagation();
      if (mapActive()) {
        select(li);
      } else if (li.classList.contains('is-open')) {
        closeAccordion(li);
      } else {
        openAccordion(li);
      }
    });
  });

  // Mobile only: click-away / Esc close the accordion.
  document.addEventListener('click', ev => {
    if (!mapActive() && current && !current.contains(ev.target)) closeAccordion(current);
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && !mapActive() && current) {
      const dot = current.querySelector('.tl-dot');
      closeAccordion(current);
      dot.focus();
    }
  });

  // Default selection on desktop = newest role (last in DOM).
  function selectNewest() { if (lis.length) select(lis[lis.length - 1]); }
  if (mapActive()) selectNewest();

  let wasMap = mapActive();
  window.addEventListener('resize', () => {
    const now = mapActive();
    if (now === wasMap) return;
    wasMap = now;
    // reset state cleanly when crossing the breakpoint
    lis.forEach(x => {
      x.classList.remove('is-open');
      x.querySelector('.tl-dot').setAttribute('aria-expanded', 'false');
    });
    clearCities();
    current = null;
    if (now) selectNewest();
  });
})();
