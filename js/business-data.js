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
    dates: 'Jan 2011 – Dec 2011',
    location: 'Milan | London',
    cities: ['milao', 'londres'],
    blurb: 'LANCO SOLAR was part of the Lanco group, an Indian company leader in Engineering, Procurement and Construction (EPC), Power, Solar, Natural Resources and Infrastructure. My experience here covered solar project development across European markets.'
  },
  {
    company: 'INTELI',
    role: 'Energy Program Manager',
    year: '2012',
    dates: 'Mar 2012 – May 2015',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'INTELI was a Portuguese think-tank that provides technical consultancy in nation-wide strategic areas. The company operated with 4 main areas of expertise including Energy, Smart-cities, Aeronautics and Automotive. I managed the energy programme, leading projects like BioAtlas.'
  },
  {
    company: 'CEIIA',
    role: 'Innovation Policy Manager',
    year: '2015',
    dates: 'May 2015 – Jan 2018',
    location: 'Porto',
    cities: ['matosinhos'],
    blurb: 'CEIIA is a Centre of Engineering and Product Development that designs, implements and operates innovative products and systems. The dimension and heterogeneity of this organisation\'s portfolio offered a great opportunity to study and apply innovation management methods across very different contexts.'
  },
  {
    company: 'IPAC',
    role: 'Innovation Expert',
    year: '2018',
    dates: '2018 – present',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'IPAC is the official Portuguese entity responsible for the accreditation of national certification bodies. Certifications such as ISO9001 or NP4457 can only be emitted by accredited certification bodies. My role involves evaluating innovation management systems across organisations.'
  },
  {
    company: 'Ready2innov',
    role: 'Partner | Digital Disruption',
    year: '2019',
    dates: 'Sep 2019 – present',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'Ready2innov is my consultancy project on the innovation management subject. Our mission is to support the development of innovative products, services and processes but most of all to capacitate all kinds of organisations to develop their own innovation competences and culture.'
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
    company: 'ISCTE Executive Education',
    role: 'Invited Professor',
    year: '2023',
    dates: '2023 – present',
    location: 'Lisbon',
    cities: ['lisboa'],
    blurb: 'ISCTE Executive Education is one of Portugal\'s leading executive education institutions. As Invited Professor in the International Management Master\'s programme, I teach innovation management in international corporate environments — covering methodology, governance, data-driven decision-making, and innovation\'s impact on corporate competitiveness.'
  }
];

window.businessData = businessData;
