/* ============================================
   CV RENDERER
   Reads window.cvData (from cv-data.js) and populates the
   placeholder sections in cv.html.
   ============================================ */

(function () {
  'use strict';

  // Wait until both the DOM and cvData are available
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.cvData) {
      console.error('cv-render: window.cvData not found. Did cv-data.js load?');
      return;
    }
    const d = window.cvData;

    renderIdentity(d.identity, d.pdfPath);
    renderSummary(d.summary);
    renderCompetencies(d.competencies);
    renderExperience(d.experience);
    renderEducation(d.education);
    renderRecognition(d.recognition);
    renderPublications(d.publications);
    renderLanguages(d.languages);
    renderAdditionalTraining(d.additionalTraining);
    renderOther(d.other);
  });

  // ---------- Section renderers ----------

  function renderIdentity(id, pdfPath) {
    const el = document.getElementById('cv-identity');
    if (!el || !id) return;
    el.innerHTML = `
      <div class="cv-identity-text">
        <h2>${esc(id.name)}</h2>
        <p class="cv-role">${esc(id.role)}</p>
        <p class="cv-domains">${esc(id.domains)}</p>
      </div>
      <div class="cv-identity-contact">
        <p>${esc(id.location)}</p>
        <p><a href="mailto:${esc(id.email)}">${esc(id.email)}</a></p>
        <p><a href="tel:${esc(id.phone.replace(/\s+/g, ''))}">${esc(id.phone)}</a></p>
        <p><a href="${esc(id.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> · <a href="${esc(id.github)}" target="_blank" rel="noopener">GitHub</a></p>
        ${pdfPath ? `<p><a href="${esc(pdfPath)}" class="cv-pdf-btn" download>↓ Download PDF</a></p>` : ''}
      </div>
    `;
  }

  function renderSummary(text) {
    const el = document.getElementById('cv-summary');
    if (!el || !text) return;
    el.innerHTML = `<p>${esc(text)}</p>`;
  }

  function renderCompetencies(items) {
    const el = document.getElementById('cv-competencies');
    if (!el || !items) return;
    el.innerHTML = items.map(i => `<span class="competency-pill">${esc(i)}</span>`).join('');
  }

  function renderExperience(items) {
    const el = document.getElementById('cv-experience');
    if (!el || !items) return;
    el.innerHTML = items.map(role => {
      const period = `${esc(role.start)}–${esc(role.end)}`;
      const bullets = role.bullets && role.bullets.length
        ? `<ul>${role.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`
        : '';
      const context = role.context ? `<p class="exp-context">${esc(role.context)}</p>` : '';
      return `
        <article class="content-card fade-in">
          <h3>${esc(role.role)}</h3>
          <p class="card-meta">
            <span class="accent">${esc(role.company)}</span>
            &middot; ${period}
            &middot; ${esc(role.location)}
          </p>
          ${context}
          ${bullets}
        </article>
      `;
    }).join('');
  }

  function renderEducation(items) {
    const el = document.getElementById('cv-education');
    if (!el || !items) return;
    el.innerHTML = items.map(group => `
      <article class="edu-domain-card fade-in">
        <h3>${esc(group.domain)}</h3>
        <ul>${group.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      </article>
    `).join('');
  }

  function renderRecognition(items) {
    const el = document.getElementById('cv-recognition');
    if (!el || !items) return;
    el.innerHTML = `<ul class="compact-list">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
  }

  function renderPublications(items) {
    const el = document.getElementById('cv-publications');
    if (!el || !items) return;
    el.innerHTML = items.map(p => {
      const doi = p.doi
        ? ` <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener" class="pub-doi">doi:${esc(p.doi)}</a>`
        : '';
      return `
        <article class="publication-item fade-in">
          <p class="pub-authors">${esc(p.authors)} <span class="pub-year">(${esc(p.year)})</span></p>
          <p class="pub-title">${esc(p.title)}</p>
          <p class="pub-venue">${esc(p.venue)}${doi}</p>
        </article>
      `;
    }).join('');
  }

  function renderLanguages(items) {
    const el = document.getElementById('cv-languages');
    if (!el || !items) return;
    el.innerHTML = items.map(l => `
      <div class="language-item">
        <span class="lang-name">${esc(l.name)}</span>
        <span class="lang-level">${esc(l.level)}</span>
      </div>
    `).join('');
  }

  function renderAdditionalTraining(items) {
    const el = document.getElementById('cv-additional-training');
    if (!el || !items) return;
    el.innerHTML = `<ul class="compact-list">${items.map(i => `
      <li><strong>${esc(i.course)}</strong> — ${esc(i.institution)}</li>
    `).join('')}</ul>`;
  }

  function renderOther(items) {
    const el = document.getElementById('cv-other');
    if (!el || !items) return;
    el.innerHTML = `<ul class="compact-list">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
  }

  // ---------- Helpers ----------

  // Minimal HTML-escape: prevents stray '<' or '&' in data from breaking layout
  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
