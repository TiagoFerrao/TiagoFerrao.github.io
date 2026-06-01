/* ============================================
   HUB — master/detail interaction (index page)
   Hovering or focusing a section in .hub-list updates the
   .hub-panel preview window. Clicking a live item navigates.
   Descriptions/icons are single-sourced from the list markup.
   ============================================ */

(function () {
  'use strict';

  const list = document.querySelector('.hub-list');
  const panel = document.querySelector('.hub-panel');
  if (!list || !panel) return;

  const items = Array.from(list.querySelectorAll('.hub-item'));
  if (!items.length) return;

  const pathEl  = panel.querySelector('.hub-panel-path');
  const iconEl  = panel.querySelector('.hub-panel-icon');
  const titleEl = panel.querySelector('.hub-panel-title');
  const descEl  = panel.querySelector('.hub-panel-desc');
  const ctaEl   = panel.querySelector('.hub-panel-cta');

  let activeItem = null;

  function select(item) {
    if (!item || item === activeItem) return;
    activeItem = item;

    const title = item.querySelector('.hub-item-title').textContent.trim();
    const desc  = item.querySelector('.hub-item-desc').textContent.trim();
    const slug  = item.dataset.slug || '';
    const href  = item.getAttribute('href');
    const soon  = item.dataset.soon === 'true';
    const live  = href && href !== '#';

    // Mark active state
    items.forEach(function (el) { el.classList.toggle('active', el === item); });

    // Terminal path
    pathEl.textContent = '~/' + slug;

    // Icon (clone the list item's SVG so it's defined once)
    const svg = item.querySelector('.hub-item-icon');
    iconEl.innerHTML = '';
    if (svg) iconEl.appendChild(svg.cloneNode(true));

    // Text
    titleEl.textContent = title;
    descEl.textContent = desc;

    // Call to action
    if (live) {
      ctaEl.textContent = 'open ' + title + ' ▸';
      ctaEl.setAttribute('href', href);
      ctaEl.removeAttribute('aria-disabled');
      ctaEl.classList.remove('disabled');
    } else {
      ctaEl.textContent = soon ? 'coming soon' : title;
      ctaEl.removeAttribute('href');
      ctaEl.setAttribute('aria-disabled', 'true');
      ctaEl.classList.add('disabled');
    }
  }

  // Preview on hover / keyboard focus — navigation stays on click.
  items.forEach(function (item) {
    item.addEventListener('mouseenter', function () { select(item); });
    item.addEventListener('focus', function () { select(item); });
  });

  // Initial state: first section.
  select(items[0]);
})();
