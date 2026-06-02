/* ============================================
   SKILLS DATA
   Structured source for skills.html (radar visualisation).

   Fields per skill:
   - name:             display name
   - category:         management | stem | digital | soft
   - level:            0-100  (outer radius on the radar)
   - consolidatedLevel: optional 0-100 (inner solid radius)
                        Default behaviour if absent → derived from status:
                          consolidated → level     (single band)
                          learning     → level * 0.4
                        Override per-skill to fine-tune the story.
   - years:            optional
   - status:           'consolidated' | 'learning'
   - evidence:         array of strings (shown in hover tooltip)
   ============================================ */

const skillsData = {

  hero: {
    stats: [
      { number: 20, suffix: '+', label: 'Years of experience' },
      { number: 14, suffix: '',  label: 'Professional roles' },
      { number: 4,  suffix: '',  label: 'Disciplines' }
    ]
  },

  // Quadrant order = clockwise starting at TOP-RIGHT
  categories: [
    { id: 'management', label: 'Management', tagline: 'Strategy, governance, finance' },
    { id: 'stem',       label: 'STEM',       tagline: 'Science, engineering, research' },
    { id: 'digital',    label: 'Digital',    tagline: 'Code, AI, tools' },
    { id: 'soft',       label: 'Soft',       tagline: 'Connect & inspire' }
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

    // ===== MANAGEMENT (17) =====
    { name: 'ISO 56000 series',         category: 'management', level: 95, years: 8,  status: 'consolidated',
      evidence: ['National rep ISO TC 279 WG3', 'IPAC accreditation expert', 'CT 169 IPQ member'] },
    { name: 'Innovation Strategy',      category: 'management', level: 90, years: 12, status: 'consolidated',
      evidence: ['Innovation Director AdP VALOR', 'CEiiA Policy Manager', 'INTELI'] },
    { name: 'Portfolio Management',     category: 'management', level: 85, years: 8,  status: 'consolidated',
      evidence: ['~€1M/yr R&D portfolio AdP', 'CEiiA portfolios'] },
    { name: 'Multi-year Roadmaps',      category: 'management', level: 80, years: 6,  status: 'consolidated',
      evidence: ['AdP multi-horizon roadmaps (short/medium/long)'] },
    { name: 'Operating Models',         category: 'management', level: 80, years: 8,  status: 'consolidated',
      evidence: ['Built AdP innovation from scratch', 'SmartEnergyLab governance'] },
    { name: 'Business Case Construction', category: 'management', level: 80, years: 12, status: 'consolidated',
      evidence: ['AdP innovation cases', 'M&A Lanco / Martifer'] },
    { name: 'Cross-border Operations',  category: 'management', level: 80, years: 10, status: 'consolidated',
      evidence: ['PT, IT, UK teams across Lanco, Martifer, Sonae'] },
    { name: 'Strategic Intelligence',   category: 'management', level: 80, years: 4,  status: 'consolidated',
      evidence: ['SmartEnergyLab methodology for major utility'] },
    { name: 'Financial Modelling',      category: 'management', level: 70, years: 12, status: 'consolidated',
      evidence: ['Multi-scale (M&A → pilot)', 'Lanco/Martifer DD'] },
    { name: 'Team Building',            category: 'management', level: 70, years: 8,  status: 'consolidated',
      evidence: ['Innovation teams from scratch at AdP'] },
    { name: 'Compliance Frameworks',    category: 'management', level: 65, years: 8,  status: 'consolidated',
      evidence: ['IPAC ISO 56002 / NP 4457'] },
    { name: 'Contract Negotiation',     category: 'management', level: 65, years: 12, status: 'consolidated',
      evidence: ['Lanco complex deals', 'Martifer EPC + O&M'] },
    { name: 'Senior Hiring',            category: 'management', level: 60, years: 5,  status: 'learning',
      evidence: ['AdP VALOR competency framework', 'Track record of strong placements'] },
    { name: 'Procurement (PT/EU/B2B)',  category: 'management', level: 60, years: 10, status: 'consolidated',
      evidence: ['Portuguese CCP', 'EU contracting', 'B2B deals'] },
    { name: 'KPI Design',               category: 'management', level: 60, years: 8,  status: 'learning',
      evidence: ['AdP innovation governance', 'CEiiA indicators'] },
    { name: 'M&A Due Diligence',        category: 'management', level: 55, years: 6,  status: 'consolidated',
      evidence: ['Lanco Solar (1 M&A)', 'Martifer PV + wind acquisitions'] },
    { name: 'Process Optimization',     category: 'management', level: 55, years: 8,  status: 'consolidated',
      evidence: ['AdP Group process owners', 'Simplification + automation'] },

    // ===== STEM (9) =====
    { name: 'Energy Systems',           category: 'stem', level: 75, years: 18, status: 'consolidated',
      evidence: ['INTELI Energy Programme', 'Martifer renewables', 'Lanco Solar utility-scale PV', 'SmartEnergyLab CoLAB'] },
    { name: 'Environmental Engineering', category: 'stem', level: 70, years: 20, status: 'consolidated',
      evidence: ['Graduate degree — University of Aveiro (1995-2002)', 'Air pollution specialisation', 'Sonae Sierra EMS work'] },
    { name: 'Sustainability (GHG/LCA/EMS)', category: 'stem', level: 70, years: 15, status: 'consolidated',
      evidence: ['Enerdinâmica GHG mitigation plan', 'Sonae Sierra EMS rep', 'WWF One Planet Living'] },
    { name: 'Research Methodology',     category: 'stem', level: 70, years: 6, status: 'learning',
      evidence: ['PhD candidate NOVA IMS (Data-Driven Innovation)', 'WIT Transactions paper (2014)'] },
    { name: 'Technical Due Diligence (energy)', category: 'stem', level: 65, years: 6, status: 'consolidated',
      evidence: ['Lanco Solar 600MW DD', 'Martifer PV/wind technical DD', 'Power curve + park layout optimisation'] },
    { name: 'Data Science',             category: 'stem', level: 60, years: 4, status: 'learning',
      evidence: ['Lisbon Data Science Academy — Batch #5', 'PhD NOVA IMS'] },
    { name: 'Scientific Writing',       category: 'stem', level: 55, years: 8, status: 'consolidated',
      evidence: ['Co-authored Cosmi et al. 2014 (WIT Transactions)', 'Master\'s dissertation', 'PhD research papers in progress'] },
    { name: 'Combustion / Biomass science', category: 'stem', level: 45, years: 8, status: 'consolidated',
      evidence: ['INETI co-combustion research (EU project)', 'BioAtlas biomass GIS at INTELI', 'Effluent treatment chapter (U. Colombia)'] },
    { name: 'Statistical thinking',     category: 'stem', level: 40, years: 4, status: 'learning',
      evidence: ['Lisbon Data Science Academy', 'PhD research methods'] },

    // ===== DIGITAL (12) =====
    { name: 'Innovation tooling (Notion/Asana/Miro)', category: 'digital', level: 85, years: 5, status: 'consolidated',
      evidence: ['AdP VALOR innovation stack', 'CEiiA portfolio tools'] },
    { name: 'GenAI / LLM integration',  category: 'digital', level: 75, years: 2, status: 'learning',
      evidence: ['AdP VALOR — embed AI into operations', 'Daily Claude/MCP work', 'Agentic workflows'] },
    { name: 'MCP / Agentic workflows',  category: 'digital', level: 70, years: 1, status: 'learning',
      evidence: ['Current AdP work', 'CV explicit', 'Active experimentation'] },
    { name: 'Prompt engineering',       category: 'digital', level: 70, years: 2, status: 'learning',
      evidence: ['Daily Claude / LLM work', 'Innovation workflow design'] },
    { name: 'Python',                   category: 'digital', level: 60, years: 5, status: 'learning',
      evidence: ['Le Wagon Full Stack Bootcamp', 'Lisbon Data Science Academy', 'AdP VALOR pipelines'] },
    { name: 'HTML / CSS / JS',          category: 'digital', level: 60, years: 5, status: 'consolidated',
      evidence: ['This portfolio site (active build)', 'Le Wagon Bootcamp'] },
    { name: 'ERP integration (SAP)',    category: 'digital', level: 55, years: 8, status: 'consolidated',
      evidence: ['AdP VALOR ERP + collab stack', 'Sonae Sierra processes'] },
    { name: 'Vector / SVG',             category: 'digital', level: 50, years: 3, status: 'consolidated',
      evidence: ['This portfolio icon system', 'Design refinement'] },
    { name: 'SQL',                      category: 'digital', level: 50, years: 4, status: 'consolidated',
      evidence: ['Lisbon Data Science Academy'] },
    { name: 'Data Visualization',       category: 'digital', level: 45, status: 'learning',
      evidence: ['Hand-built SVG skills radar on this site', 'Lisbon Data Science Academy'] },
    { name: 'UI/UX Design',             category: 'digital', level: 45, years: 8, status: 'learning',
      evidence: ['Site design choices', 'SportSpots product UI', 'Innovation-driven design'] },
    { name: 'Git / version control',    category: 'digital', level: 40, years: 5, status: 'consolidated',
      evidence: ['Active site workflow', 'Le Wagon'] },

    // ===== SOFT (11) =====
    { name: 'Cross-cultural Fluency',   category: 'soft', level: 90, years: 18, status: 'consolidated',
      evidence: ['PT working in IT for Indian co. HQ London (Lanco)', 'Multinational teams'] },
    { name: 'Teaching / Knowledge Transfer', category: 'soft', level: 85, years: 3, status: 'consolidated',
      evidence: ['Invited Professor — International Innovation Management, ISCTE Executive Education'] },
    { name: 'Multilingual (PT native · EN C2 · IT C2 · FR A1)', category: 'soft', level: 85, years: 20, status: 'consolidated',
      evidence: ['Portuguese (native)', 'English C2 — TOEFL 110/120', 'Italian C2', 'French A1'] },
    { name: 'Stakeholder Management',   category: 'soft', level: 80, years: 15, status: 'consolidated',
      evidence: ['Municipalities, grid operators, financial counterparties (Martifer)', 'Multi-entity AdP Group'] },
    { name: 'Sector Adaptability',      category: 'soft', level: 80, years: 20, status: 'consolidated',
      evidence: ['Energy, environment, automotive, water, sports tech', 'Research → consulting → corporate → startup'] },
    { name: 'Lean Startup Mindset',     category: 'soft', level: 75, years: 7, status: 'consolidated',
      evidence: ['Implemented Eric Ries methodology at SmartEnergyLab'] },
    { name: 'Mental Resilience',        category: 'soft', level: 75, years: 20, status: 'consolidated',
      evidence: ['Federated competitive swimmer — FPN', 'Marathon runner'] },
    { name: 'Design Thinking',          category: 'soft', level: 65, years: 8, status: 'consolidated',
      evidence: ['Innovation methodology toolkit'] },
    { name: 'Agile Thinking',           category: 'soft', level: 65, years: 8, status: 'consolidated',
      evidence: ['Innovation methodology toolkit'] },
    { name: 'Risk Tolerance',           category: 'soft', level: 65, years: 6, status: 'consolidated',
      evidence: ['Co-founded SPORTSPOTS', 'Co-founded Ready2innov'] },
    { name: 'Mentorship',               category: 'soft', level: 55, years: 5, status: 'learning',
      evidence: ['Onboarded senior + specialist hires at AdP VALOR'] }
  ]
};

window.skillsData = skillsData;
