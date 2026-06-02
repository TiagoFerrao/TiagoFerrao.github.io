/* ============================================
   SKILLS DATA
   Structured source for skills.html (radar visualisation).

   Quadrant identity (label) → fixed geographic position (internal id):
     Strategist → id "management" (top-right)
     Engineer   → id "stem"       (bottom-right)
     Builder    → id "digital"    (bottom-left)
     Connector  → id "soft"       (top-left)
   The render/layout code keys off the internal id (position); the
   displayed name comes from `label`. Relabel here, not in the renderer.

   Skill schema (canonical):
   - name:          display name
   - category:      management | stem | digital | soft   (= position id)
   - consolidated:  0-100  inner dark band — bedrock mastery
   - total:         0-100  outer band ceiling — active-practice reach
                    (consolidated <= total; if equal, no bright band)
   - years:         optional (tooltip)
   - evidence:      array of strings (tooltip)

   Back-compat: the renderer consumes level / consolidatedLevel / status.
   Those are DERIVED from consolidated/total in the normalisation pass at
   the bottom of this file, so the radar/SVG logic stays untouched and the
   two bands are driven by the explicit consolidated/total values:
     level           = total            (outer radius)
     consolidatedLevel = consolidated   (inner band depth)
     status          = consolidated >= total ? 'consolidated' : 'learning'
   ============================================ */

const skillsData = {

  hero: {
    stats: [
      { number: 20, suffix: '+', label: 'Years of experience' },
      { number: 14, suffix: '',  label: 'Professional roles' },
      { number: 4,  suffix: '',  label: 'Disciplines' }
    ]
  },

  // Quadrant order = clockwise starting at TOP-RIGHT.
  // id = fixed geographic position; label = identity-coded role name.
  categories: [
    { id: 'management', label: 'Strategist', tagline: 'Strategy, governance, finance' },
    { id: 'stem',       label: 'Engineer',   tagline: 'Science, engineering, research' },
    { id: 'digital',    label: 'Builder',    tagline: 'Code, AI, tools' },
    { id: 'soft',       label: 'Connector',  tagline: 'Connect & inspire' }
  ],

  statuses: [
    { id: 'consolidated', label: 'Consolidated (mature)',   opacity: 0.75 },
    { id: 'learning',     label: 'Learning now (active)',    opacity: 0.75 }
  ],

  levels: [
    { id: 1, label: 'Novice' },
    { id: 2, label: 'Advanced Beginner' },
    { id: 3, label: 'Competent' },
    { id: 4, label: 'Proficient' },
    { id: 5, label: 'Expert' }
  ],

  skills: [

    // ===== STRATEGIST  (id: management, top-right) — 13 =====
    { name: 'Innovation Strategy',      category: 'management', consolidated: 70, total: 86, years: 12,
      evidence: ['Innovation Director AdP VALOR', 'CEiiA Policy Manager', 'INTELI'] },
    { name: 'ISO 56000 series',         category: 'management', consolidated: 64, total: 80, years: 8,
      evidence: ['National rep ISO TC 279 WG3', 'IPAC accreditation expert', 'CT 169 IPQ member'] },
    { name: 'Innovation Portfolio Management', category: 'management', consolidated: 57, total: 80, years: 8,
      evidence: ['~€1M/yr R&D portfolio AdP', 'CEiiA portfolios'] },
    { name: 'Multi-year Roadmaps',      category: 'management', consolidated: 75, total: 80, years: 6,
      evidence: ['AdP multi-horizon roadmaps (short/medium/long)'] },
    { name: 'Operating Models',         category: 'management', consolidated: 75, total: 80, years: 8,
      evidence: ['Built AdP innovation from scratch', 'SmartEnergyLab governance'] },
    { name: 'Business Case Construction', category: 'management', consolidated: 75, total: 80, years: 12,
      evidence: ['AdP innovation cases', 'M&A Lanco / Martifer'] },
    { name: 'Strategic Intelligence',   category: 'management', consolidated: 70, total: 70, years: 4,
      evidence: ['SmartEnergyLab methodology for major utility'] },
    { name: 'Compliance Frameworks',    category: 'management', consolidated: 60, total: 65, years: 8,
      evidence: ['IPAC ISO 56002 / NP 4457'] },
    { name: 'Financial Modelling',      category: 'management', consolidated: 60, total: 60, years: 12,
      evidence: ['Multi-scale (M&A → pilot)', 'Lanco/Martifer DD'] },
    { name: 'Process Optimization',     category: 'management', consolidated: 50, total: 60, years: 8,
      evidence: ['AdP Group process owners', 'Simplification + automation'] },
    { name: 'Cross-border Operations',  category: 'management', consolidated: 45, total: 47, years: 10,
      evidence: ['PT, IT, UK teams across Lanco, Martifer, Sonae'] },
    { name: 'KPI Design',               category: 'management', consolidated: 40, total: 42, years: 8,
      evidence: ['AdP innovation governance', 'CEiiA indicators'] },
    { name: 'M&A Due Diligence',        category: 'management', consolidated: 40, total: 42, years: 6,
      evidence: ['Lanco Solar (1 M&A)', 'Martifer PV + wind acquisitions'] },

    // ===== ENGINEER  (id: stem, bottom-right) — 6 =====
    { name: 'Environmental Engineering', category: 'stem', consolidated: 60, total: 80, years: 20,
      evidence: ['Graduate degree — University of Aveiro (1995-2002)', 'Air pollution specialisation', 'Sonae Sierra EMS work'] },
    { name: 'Research Methodology',     category: 'stem', consolidated: 50, total: 70, years: 6,
      evidence: ['PhD candidate NOVA IMS (Data-Driven Innovation)', 'WIT Transactions paper (2014)'] },
    { name: 'Energy Systems',           category: 'stem', consolidated: 60, total: 65, years: 18,
      evidence: ['INTELI Energy Programme', 'Martifer renewables', 'Lanco Solar utility-scale PV', 'SmartEnergyLab CoLAB'] },
    { name: 'Sustainability (GHG/LCA/EMS)', category: 'stem', consolidated: 60, total: 60, years: 15,
      evidence: ['Enerdinâmica GHG mitigation plan', 'Sonae Sierra EMS rep', 'WWF One Planet Living'] },
    { name: 'Data Science',             category: 'stem', consolidated: 35, total: 50, years: 4,
      evidence: ['Dataquest — Data Scientist in Python path (2022–2025)', 'Lisbon Data Science Academy — Batch #5', 'PhD NOVA IMS'] },
    { name: 'Scientific Writing',       category: 'stem', consolidated: 40, total: 50, years: 8,
      evidence: ['Co-authored Cosmi et al. 2014 (WIT Transactions)', 'Master\'s dissertation', 'PhD research papers in progress'] },

    // ===== BUILDER  (id: digital, bottom-left) — 13 =====
    { name: 'Innovation tooling (Notion/Asana/Miro)', category: 'digital', consolidated: 75, total: 90, years: 5,
      evidence: ['AdP VALOR innovation stack', 'CEiiA portfolio tools'] },
    { name: 'GenAI / LLM integration',  category: 'digital', consolidated: 30, total: 75, years: 2,
      evidence: ['AdP VALOR — embed AI into operations', 'Daily Claude/MCP work', 'Agentic workflows'] },
    { name: 'MCP / Agentic workflows',  category: 'digital', consolidated: 50, total: 60, years: 1,
      evidence: ['Current AdP work', 'CV explicit', 'Active experimentation'] },
    { name: 'HTML / CSS / JS',          category: 'digital', consolidated: 50, total: 60, years: 5,
      evidence: ['This portfolio site (active build)', 'Le Wagon Bootcamp'] },
    { name: 'UI/UX Design',             category: 'digital', consolidated: 30, total: 60, years: 8,
      evidence: ['Site design choices', 'SportSpots product UI', 'Innovation-driven design'] },
    { name: 'Python',                   category: 'digital', consolidated: 35, total: 55, years: 5,
      evidence: ['Dataquest — Python for Data Science (2022)', 'Le Wagon Full Stack Bootcamp', 'Lisbon Data Science Academy', 'AdP VALOR pipelines'] },
    { name: 'Machine Learning',         category: 'digital', consolidated: 25, total: 50, years: 4,
      evidence: ['Dataquest — Intro to ML, Linear Regression, Calculus for ML (2022)', 'Lisbon Data Science Academy'] },
    { name: 'Prompt engineering',       category: 'digital', consolidated: 30, total: 50, years: 2,
      evidence: ['Daily Claude / LLM work', 'Innovation workflow design'] },
    { name: 'Vector / SVG',             category: 'digital', consolidated: 45, total: 48, years: 3,
      evidence: ['This portfolio icon system', 'Design refinement'] },
    { name: 'SQL',                      category: 'digital', consolidated: 30, total: 40, years: 4,
      evidence: ['Dataquest — SQL for Data Analysis', 'Lisbon Data Science Academy'] },
    { name: 'Data Visualization',       category: 'digital', consolidated: 25, total: 40, years: 4,
      evidence: ['Dataquest — Data Analysis & Visualization with Python (2022)', 'Hand-built SVG skills radar on this site', 'Lisbon Data Science Academy'] },
    { name: 'Deep Learning',            category: 'digital', consolidated: 10, total: 40, years: 1,
      evidence: ['Dataquest — Zero to GPT path (neural networks, 2026)', 'GenAI / LLM work at AdP VALOR'] },
    { name: 'ERP integration (SAP)',    category: 'digital', consolidated: 0,  total: 30, years: 8,
      evidence: ['AdP VALOR ERP + collab stack', 'Sonae Sierra processes'] },

    // ===== CONNECTOR  (id: soft, top-left) — 8 =====
    { name: 'Teaching / Knowledge Transfer', category: 'soft', consolidated: 60, total: 90, years: 3,
      evidence: ['Invited Professor — International Innovation Management, ISCTE Executive Education'] },
    { name: 'Multilingual (PT native · EN C2 · IT C2 · FR A1)', category: 'soft', consolidated: 90, total: 90, years: 20,
      evidence: ['Portuguese (native)', 'English C2 — TOEFL 110/120', 'Italian C2', 'French A1'] },
    { name: 'Cross-cultural Fluency',   category: 'soft', consolidated: 80, total: 82, years: 18,
      evidence: ['PT working in IT for Indian co. HQ London (Lanco)', 'Multinational teams'] },
    { name: 'Lean Startup Mindset',     category: 'soft', consolidated: 70, total: 70, years: 7,
      evidence: ['Implemented Eric Ries methodology at SmartEnergyLab'] },
    { name: 'Team Building',            category: 'soft', consolidated: 65, total: 70, years: 8,
      evidence: ['Innovation teams from scratch at AdP'] },
    { name: 'Stakeholder Management',   category: 'soft', consolidated: 60, total: 60, years: 15,
      evidence: ['Municipalities, grid operators, financial counterparties (Martifer)', 'Multi-entity AdP Group'] },
    { name: 'Design Thinking',          category: 'soft', consolidated: 60, total: 60, years: 8,
      evidence: ['Innovation methodology toolkit'] },
    { name: 'Sector Adaptability',      category: 'soft', consolidated: 35, total: 45, years: 20,
      evidence: ['Energy, environment, automotive, water, sports tech', 'Research → consulting → corporate → startup'] }
  ]
};

/* --- Normalisation: derive legacy render fields from consolidated/total ---
   Keeps the radar/SVG/animation logic untouched while the two bands are
   driven by the explicit consolidated/total values. */
skillsData.skills.forEach(s => {
  s.total = Math.max(0, Math.min(100, s.total));
  s.consolidated = Math.max(0, Math.min(s.total, s.consolidated)); // clamp consolidated <= total
  s.level = s.total;                                               // outer band ceiling
  s.consolidatedLevel = s.consolidated;                            // inner band depth
  s.status = s.consolidated >= s.total ? 'consolidated' : 'learning';
});

window.skillsData = skillsData;
