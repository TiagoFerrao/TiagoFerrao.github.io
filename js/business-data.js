/* ============================================
   BUSINESS / CAREER TIMELINE DATA
   Source for business.html (vertical timeline + worked-cities map).
   Ordered OLDEST → NEWEST. The renderer shows a vertical timeline at all
   sizes; on desktop it also draws a map (js/worldmap-data.js) where each
   role's city/cities are marked — circle size scales with how many roles
   touched that city — and the story pops up above the city marker.

   Fields per entry:
   - company:   display name (shown on the dot)
   - role:      job title (shown in the reveal)
   - year:      start year (short label on the dot)
   - dates:     full date range (shown in the reveal)
   - location:  location(s) (shown in the reveal)
   - cities:    map keys (worldMapData.cities) this role touched; first = popup anchor
   - blurb:     narrative paragraph (shown in the reveal)
   ============================================ */

const businessData = [
  {
    company: 'INETI',
    role: 'Junior Researcher',
    year: '2002',
    dates: 'Mar 2002 – Mar 2004',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'My first "real" job after college. I joined the Portuguese research team in the European project "Co-combustion of Coal and Meat and Bone Meal" looking for solutions for hazardous residues originated by the BSE crisis in Europe.'
  },
  {
    company: 'Enerdinâmica',
    role: 'Junior Consultant',
    year: '2004',
    dates: 'Jan 2004 – Aug 2005',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'A fellow researcher from my previous job founded ENERDINAMICA to provide consultancy services for intensive energy users. I took care of the Energy and Sustainability department, conducting energy audits and sustainability assessments.'
  },
  {
    company: 'Sonae Sierra',
    role: 'Environmental Technician',
    year: '2005',
    dates: 'Sep 2005 – Jan 2008',
    location: 'Lisbon | Milan',
    cities: ['lisboa', 'milao'],
    blurb: 'My collaboration with Sonae Sierra started as an intern of the "NetworkContacto Program", placed in Milan, Italy, where I implemented environmental standards and procedures across the Italian shopping centre portfolio. I then returned to the Portuguese headquarters as Environmental Technician, delivering environmental compliance and EMS services to Sonae Sierra shopping centres worldwide — my final year inside a mature global shared services operating model.'
  },
  {
    company: 'Martifer',
    role: 'Deputy Country Manager',
    year: '2008',
    dates: 'Jan 2008 – Jan 2011',
    location: 'Lisbon | Rome',
    cities: ['lisboa', 'roma'],
    blurb: 'I started at Martifer Renewables in Lisbon as International Business Manager — analysing renewable project pipelines across the Mediterranean during the peak of the European renewables boom. I was then deployed to Rome as Deputy Country Manager, running the Italian subsidiary as a lean two-person operation, conducting M&A due diligence on PV and wind plant acquisitions and closing high-value deal packages.'
  },
  {
    company: 'Lanco Solar',
    role: 'Business Development',
    year: '2011',
    dates: 'Jan 2011 – 2012',
    location: 'Milan | London',
    cities: ['milao', 'londres'],
    blurb: 'LANCO SOLAR was part of the Lanco group, an Indian company leader in Engineering, Procurement and Construction (EPC), Power, Solar, Natural Resources and Infrastructure. My experience here covered solar project development across European markets.'
  },
  {
    company: 'INTELI',
    role: 'Energy Program Manager',
    year: '2012',
    dates: 'Mar 2012 – 2016',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'INTELI was a Portuguese think-tank that provides technical consultancy in nation-wide strategic areas. The company operated with 4 main areas of expertise including Energy, Smart-cities, Aeronautics and Automotive. I managed the energy programme, leading projects like BioAtlas, and was part of the team behind the energy and sustainability indicator frameworks INTELI developed for Portuguese cities.'
  },
  {
    company: 'CEIIA',
    role: 'Innovation Policy Manager',
    year: '2016',
    dates: '2016 – 2018',
    location: 'Porto',
    cities: ['matosinhos'],
    blurb: 'CEIIA is a Centre of Engineering and Product Development that designs, implements and operates innovative products and systems. The dimension and heterogeneity of this organisation\'s portfolio offered a great opportunity to study and apply innovation management methods across very different contexts.'
  },
  {
    company: 'IPAC',
    role: 'Innovation Expert',
    year: '2017',
    dates: '2017 – 2021',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'IPAC is the official Portuguese entity responsible for the accreditation of national certification bodies. Certifications such as ISO9001 or NP4457 can only be emitted by accredited certification bodies. My role involves evaluating innovation management systems across organisations.'
  },
  {
    company: 'SportSpots',
    role: 'Co-Founder',
    year: '2018',
    dates: '2018 – 2020',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'SportSpots was a digital platform to manage sport activities — and my entrepreneurial deep-dive. Its business plan was my ISCTE Master\'s dissertation, applying lean startup, Quality Function Deployment and the platform canvas. I co-founded and ran it for two years: it was selected by the KickUP Sports Accelerator — the first European sports accelerator launched within a major sports club, in partnership with SL Benfica — and won recognition across several startup competitions, before I sold my stake to my business partner.'
  },
  {
    company: 'Ready2innov',
    role: 'Co-Founder',
    year: '2020',
    dates: '2020 – 2021',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'Ready2innov was my innovation-management consultancy, co-founded to help organisations build their own innovation competences and culture — not just to deliver projects for them. I registered the brand with INPI in 2020 and delivered innovation-management training for APQ, the Portuguese Association for Quality, with a proposal pipeline spanning consultancies, industrial groups and research institutes.'
  },
  {
    company: 'SmartEnergyLab',
    role: 'Innovation Manager',
    year: '2021',
    dates: '2021 – 2022',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'SmartEnergyLab is EDP\'s National Collaborative Laboratory for Energy Transition. As Innovation Manager I implemented Eric Ries\' Lean Startup methodology across the lab\'s energy transition project portfolio and built innovation governance, a technology validation pipeline, and a strategic intelligence framework for a major national utility.'
  },
  {
    company: 'AdP VALOR',
    role: 'Innovation Director',
    year: '2022',
    dates: '2022 – present',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'AdP VALOR is the innovation and shared services arm of Águas de Portugal Group, serving all group operating companies. As Innovation Director I lead a small team orchestrating innovation across four areas — strategy, open innovation and EU R&D, innovation shared services, and new product and service development — including a ~€1M/year program of new innovation projects executed by teams across the group.'
  },
  {
    company: 'ISCTE Business School',
    role: 'Invited Professor',
    year: '2023',
    dates: '2023 – present',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'ISCTE Business School is one of Portugal\'s leading business schools. As Invited Professor in the International Management Master\'s programme, I teach innovation management in international corporate environments — covering methodology, governance, data-driven decision-making, and innovation\'s impact on corporate competitiveness.'
  }
];

window.businessData = businessData;
