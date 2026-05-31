/* ============================================
   CV DATA
   Structured data source for cv.html.
   Edit this file to add/remove/update CV entries.

   Structure:
   - identity:       header card (name, role, contact channels)
   - summary:        executive summary paragraph
   - competencies:   array of strings (renders as pill grid)
   - experience:     array of role objects (renders as content cards)
                     fields: role, company, start, end, location,
                     context (optional sub-line), bullets (array)
   - education:      array of {domain, items[]} (one card per domain)
   - recognition:    array of strings (renders as compact list)
   - publications:   array of {authors, year, title, venue, doi?}
   - languages:      array of {name, level}
   - additionalTraining: array of {course, institution}
   - pdfPath:        path to downloadable PDF version
   ============================================ */

const cvData = {

  identity: {
    name: "Tiago da Cunha Ferrão",
    role: "Innovation Director",
    domains: "Engineering · Data Science · AI · Strategy",
    location: "Lisbon, Portugal",
    email: "tiago.cunha.ferrao@me.com",
    phone: "+351 917 101 075",
    linkedin: "https://linkedin.com/in/tferrao",
    github: "https://github.com/TiagoFerrao"
  },

  summary: "Hybrid manager with a STEM foundation and 20+ years of innovation leadership across R&D, EU-funded programmes, and digital transformation — combining environmental engineering, business management, innovation management, and data science. Currently Innovation Director at AdP VALOR, the innovation and shared services arm of Águas de Portugal Group, growing the innovation portfolio by ~€1M of new projects each year since 2022. Experienced in implementing innovation culture, aligning it with corporate strategy, and scaling AI and automation across organizations. National representative for innovation management methodology — ISO TC 279 WG3 (Tools and Methods), Portuguese Technical Commission 169 (R&D&I), IPAC accreditation expert for Innovation Management Systems, and European Innovation Council Expert Evaluator. Invited Professor for International Innovation Management at ISCTE Executive Education. Executive Master's in Innovation Management, with specialist training in data science at Lisbon Data Science Academy.",

  competencies: [
    "Innovation Strategy, Portfolio Management & Multi-Year Roadmap",
    "Innovation Operating Models, Processes, Policies & Governance for Multi-Entity Groups",
    "Lean Innovation Processes & Data-Driven Process Design",
    "AI, GenAI & Intelligent Automation Deployment (Python, MCP, agentic workflows)",
    "Modern Stack Integration: ERP, Collaboration & Innovation Tools",
    "Business Case Construction & Financial Modelling — Multi-Scale (M&A to Pilot) with Assumption Validation",
    "M&A Due Diligence — Legal, Financial & Technical (high-value transactions)",
    "Public & Private Procurement (PT, EU & B2B Contracting)",
    "Team Building & Talent Strategy",
    "Innovation Methodology: Lean Startup (Ries), Agile, Design Thinking, ISO 56000 series",
    "Cross-Border Operations (Portugal, Italy, UK, EU)"
  ],

  experience: [
    {
      role: "Innovation Director",
      company: "AdP VALOR — Grupo Águas de Portugal",
      start: "2022",
      end: "Present",
      location: "Lisbon, PT",
      context: "Innovation and shared services arm of Águas de Portugal Group; serves all group operating companies.",
      bullets: [
        "Designed and operate the innovation teams from the ground up — covering five activity areas (Strategic, Operational, Open, Product Development, and R&D), including governance, methodology, KPIs, and multi-horizon roadmaps (short-, medium-, and long-term).",
        "Partner with process owners across AdP Group operating companies to assess end-to-end processes, prioritize interventions across simplification, standardization, automation, and AI, and lead implementation through to adoption and measurable cycle-time and cost outcomes.",
        "Designed and run an internal innovation competition that adds ~€1M of R&D and innovation projects to the AdP Group portfolio each year since 2022, with supporting business cases and financial models.",
        "Embed AI and automation directly into operations — Python pipelines, Notion-connected agents, MCP integrations — driving performance gains across innovation portfolio management, operations, and processes.",
        "Built and lead the innovation teams' talent strategy — designed the competency framework, selection methodology, and onboarding for senior and specialist hires; track record of strong placements that have shaped the team's culture."
      ]
    },
    {
      role: "Invited Professor — International Innovation Management",
      company: "ISCTE Executive Education",
      start: "2023",
      end: "Present",
      location: "Lisbon, PT",
      bullets: [
        "Teach innovation management in international corporate environments within the International Management Master's programme — covering methodology, governance, data-driven decision-making, and innovation's impact on corporate competitiveness and performance."
      ]
    },
    {
      role: "Innovation Manager",
      company: "SmartEnergyLab (EDP's CoLAB)",
      start: "2021",
      end: "2022",
      location: "Lisbon, PT",
      context: "National Collaborative Laboratory for Energy Transition.",
      bullets: [
        "Implemented Eric Ries' Lean Startup methodology across the lab's energy transition project portfolio, by explicit mandate.",
        "Built innovation governance, technology validation pipeline, and methodology framework for the lab's R&D-to-market translation work.",
        "Designed and implemented a strategic intelligence methodology — monitoring technology, competitors, market trends, and signals — to inform the commercial strategy of a major national utility."
      ]
    },
    {
      role: "Co-Founder",
      company: "SPORTSPOTS & Ready2innov",
      start: "2018",
      end: "2021",
      location: "Lisbon, PT",
      bullets: [
        "Co-founded two ventures over three years: SPORTSPOTS (digital sports platform startup; subject of ISCTE Master's dissertation) and Ready2innov (innovation consultancy serving Portuguese and international clients).",
        "Built MVPs, business plans, investor pitches, product validation, go-to-market strategies, and methodology frameworks — spanning consumer-tech entrepreneurship and B2B innovation advisory.",
        "SPORTSPOTS was selected by the KickUP Sports Accelerator — the first European sports accelerator launched within a major sports club, in partnership with SL Benfica — and won recognition across multiple startup competitions."
      ]
    },
    {
      role: "Innovation Expert",
      company: "IPAC — Portuguese Accreditation Institute",
      start: "2017",
      end: "2021",
      location: "Lisbon, PT",
      bullets: [
        "National Accreditation Expert for Innovation Management Systems (ISO 56002 / NP 4457).",
        "Audited and evaluated Portuguese auditors in innovation management certification; contributed to national accreditation methodology and represented Portugal in ISO working groups for the 56000 family of standards."
      ]
    },
    {
      role: "Innovation Policy Manager",
      company: "CEiiA",
      start: "2016",
      end: "2018",
      location: "Matosinhos / Lisbon, PT",
      bullets: [
        "Led inter-institutional innovation policy initiatives and EU-funded mobility R&D programs at one of Portugal's leading mobility and aerospace innovation centres."
      ]
    },
    {
      role: "Energy Program Manager",
      company: "INTELI — Inteligência em Inovação",
      start: "2012",
      end: "2016",
      location: "Lisbon, PT",
      bullets: [
        "Developed a nationwide digital platform for biomass resources mapping and management, with significant technical sophistication.",
        "Led a multinational research project on local energy strategies (published in WIT Transactions on Ecology and the Environment, 2014)."
      ]
    },
    {
      role: "Business Development",
      company: "Lanco Solar International",
      start: "2011",
      end: "2012",
      location: "Milan / London",
      bullets: [
        "Led business development in Italy for UK-headquartered Lanco Solar International — running due diligence, deal assessment, and complex commercial negotiations on utility-scale solar PV transactions."
      ]
    },
    {
      role: "Deputy Country Manager",
      company: "Martifer Renewables",
      start: "2009",
      end: "2011",
      location: "Rome, IT",
      bullets: [
        "Conducted M&A due diligence on PV and wind plant acquisitions and land deals — across legal, financial, and technical dimensions, on complex transactions during peak Italian renewables sector activity.",
        "Ran the Italian subsidiary as a lean two-person operation, closing high-value deal packages and managing stakeholder relationships across municipalities, grid operators, and financial counterparties."
      ]
    },
    {
      role: "International Business Manager",
      company: "Martifer Renewables",
      start: "2008",
      end: "2009",
      location: "Lisbon, PT",
      bullets: [
        "Drove international business development from headquarters — analysing renewable project pipelines across the Mediterranean, supporting the build-up of Martifer's Italian and Greek operations.",
        "Built market intelligence and deal-screening processes that fed the country teams during the peak of the European renewables boom."
      ]
    },
    {
      role: "Environmental Technician",
      company: "Sonae Sierra",
      start: "2006",
      end: "2008",
      location: "Lisbon, PT",
      context: "Global shared services delivery to Sonae Sierra's international shopping centre portfolio.",
      bullets: [
        "Delivered environmental compliance and EMS services from Portugal to Sonae Sierra shopping centres worldwide — early-career exposure to a mature global shared services operating model."
      ]
    },
    {
      role: "Environmental Manager Representative",
      company: "Sonae Sierra",
      start: "2005",
      end: "2006",
      location: "Milan, IT",
      bullets: [
        "Deployed to the Italian branch as Environmental Manager Representative to conduct on-the-ground audits and assure Group process compliance across European subsidiaries."
      ]
    },
    {
      role: "Coordinator for Energy and Sustainability",
      company: "Enerdinâmica",
      start: "2004",
      end: "2005",
      location: "Lisbon, PT"
    },
    {
      role: "Junior Researcher",
      company: "DEECA — INETI",
      start: "2002",
      end: "2004",
      location: "Lisbon, PT",
      bullets: [
        "Energy and environment applied research at Portugal's national engineering and industrial technology institute."
      ]
    }
  ],

  education: [
    {
      domain: "Engineering & Natural Sciences",
      items: [
        "Graduate Degree in Environmental Engineering — University of Aveiro"
      ]
    },
    {
      domain: "Economics & Policy",
      items: [
        "Postgraduate in Energy and Environment Politics and Economics — ISEG"
      ]
    },
    {
      domain: "Business & Innovation Management",
      items: [
        "Master's in Business Management and Administration — ISCTE",
        "Executive Master's in Management with Specialization in Innovation — INDEG (ISCTE Executive Education)"
      ]
    },
    {
      domain: "Data Science & Information Technology",
      items: [
        "PhD Candidate in Information Technology — NOVA IMS. Subject: Data-Driven Innovation",
        "Lisbon Data Science Academy — Batch #5"
      ]
    }
  ],

  recognition: [
    "Member, ISO TC 279 — Innovation Management, Working Group 3 (Tools and Methods)",
    "Member, Technical Commission 169 (CT 169) at IPQ — Portuguese Standardization Body, for Research, Development and Innovation Activities",
    "National Accreditation Expert for Innovation Management Systems — IPAC",
    "Expert Evaluator — European Innovation Council (EIC) Programme"
  ],

  publications: [
    {
      authors: "Cosmi, C., Dvarioniene, J., Marques, I., Ferrão, T., Bloomfield, I., Brix, K., & Trummer, D. R.",
      year: 2014,
      title: "Local strategies for competitive, effective and secure energy uses: The RENERGY transfer tools and methods",
      venue: "WIT Transactions on Ecology and the Environment, 191, 295–304",
      doi: "10.2495/SC140251"
    },
    {
      authors: "Ferrão, T. da Cunha",
      year: 2018,
      title: "SportSpots: Business Plan — a business plan adapted for a digital startup",
      venue: "Master's Dissertation, ISCTE, Lisbon"
    }
  ],

  languages: [
    { name: "Portuguese", level: "Native" },
    { name: "English", level: "C2 — TOEFL 110/120" },
    { name: "Italian", level: "C2" },
    { name: "French", level: "A1" }
  ],

  additionalTraining: [
    { course: "Full Stack Development Bootcamp", institution: "Le Wagon" },
    { course: "Energy and Environment Economics", institution: "York University" },
    { course: "Environmental Auditing and Environmental Management Systems", institution: "Jacques Whitford Institute" },
    { course: "Short Postgraduate in Soil and Plant Data Analysis", institution: "Wageningen University (WUR)" }
  ],

  other: [
    "Federated competitive swimmer — Portuguese Swimming Federation (FPN); marathon runner."
  ],

  pdfPath: "docs/CV_TiagoFerrao_2026.pdf"
};

// Expose for cv-render.js (no module bundler in this project)
window.cvData = cvData;
