// 45+ Realistic Pre-seeded Jharkhand societal challenges for Samadhan Setu

export const MOCK_PROBLEMS = [
  {
    id: "JH-2026-001",
    title: "Heavy Metal & Acid Mine Drainage Remediation in Damodar Basin",
    description: "Acidic leachate from open-cast coal dumps in Jharia and Katras blocks contains high concentrations of lead, iron, and suspended coal particulates, contaminating local drinking wells and irrigation canals.",
    category: "Environment",
    districtId: "dhanbad",
    districtName: "Dhanbad",
    location: "Katras Block, Ward 14 (Near Damodar Outflow)",
    latitude: 23.7957,
    longitude: 86.4304,
    severity: 5,
    urgencyScore: 95,
    status: "In Progress", // "Submitted" | "Under Review" | "Routed to University" | "In Progress" | "Solved"
    kanbanStage: "Prototyping", // "To Do" | "In Research" | "Prototyping" | "Testing" | "Submitted for Review"
    submitterType: "Gram Panchayat",
    submitterName: "Ramesh Mahto (Mukhiya, Katras)",
    submittedAt: "2026-08-14",
    upvotes: 412,
    hasUpvoted: false,
    clusterId: "CLUSTER-DHN-ENV-01",
    duplicateCount: 4,
    images: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "IIT (ISM) Dhanbad",
      department: "Dept of Environmental Science & Mining Engineering",
      matchScore: 98,
      facultyLead: "Prof. S. K. Bhattacharya",
      studentTeam: ["Ananya Verma (PhD)", "Aakash Soren (B.Tech)", "Vikram Roy (M.Tech)"]
    },
    industryPartner: {
      name: "BCCL / Coal India CSR",
      tier: "Co-Development & Grant Funding",
      pledgedAmount: "₹38,50,000",
      contactPerson: "Dr. Arvind Pandey (GM Sustainability)"
    },
    solutionSummary: "Bio-char & layered zeolitic phytoremediation filter tanks deployed at 3 primary mine discharge points, neutralizing pH from 3.8 to 7.1 and precipitating 92% heavy metals.",
    trlLevel: "TRL 6 (Field Validated Prototype)",
    patentsFiled: "IP/JH/2026/0419A (Pending)",
    milestones: [
      { title: "Water Sample Collection & Spectrometry Analysis", completed: true, date: "2026-08-20" },
      { title: "Lab-scale Column Zeolite Leaching Test", completed: true, date: "2026-08-28" },
      { title: "Modular Bio-Reactor Prototype Fabrication", completed: true, date: "2026-09-02" },
      { title: "Pilot Installation at Katras Outfall #2", completed: false, date: "Est. 2026-09-25" },
      { title: "Govt Pollution Control Board Sign-off", completed: false, date: "Est. 2026-10-15" }
    ],
    comments: [
      { id: "c1", author: "Prof. S. K. Bhattacharya", role: "University", text: "Phase 1 batch tests completed. Filtration matrix achieved 89% heavy metal reduction in 45 minutes.", time: "3 days ago" },
      { id: "c2", author: "Ramesh Mahto", role: "Citizen", text: "Villagers have agreed on the site for the community filtration unit near the pond.", time: "1 day ago" },
      { id: "c3", author: "Dr. Arvind Pandey (BCCL)", role: "Industry", text: "CSR sub-committee has sanctioned the Phase 2 scale-up grant for remaining 4 outfalls.", time: "4 hours ago" }
    ]
  },
  {
    id: "JH-2026-002",
    title: "Off-Grid Solar Cold Storage for Lac and High-Value Forest Produce",
    description: "Tribal lac gatherers in Torpa and Rania blocks lose 35-40% of their harvested sticklac during monsoon due to high humidity and lack of temperature-regulated storage facilities.",
    category: "Agriculture",
    districtId: "khunti",
    districtName: "Khunti",
    location: "Torpa Block (Village Dorma)",
    latitude: 23.0562,
    longitude: 85.2799,
    severity: 4,
    urgencyScore: 92,
    status: "In Progress",
    kanbanStage: "Testing",
    submitterType: "Community Group",
    submitterName: "Jharkhand Mahila Lac Co-operative (Torpa)",
    submittedAt: "2026-08-10",
    upvotes: 289,
    hasUpvoted: true,
    clusterId: "CLUSTER-KHT-AGR-09",
    duplicateCount: 2,
    images: ["https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Birsa Agricultural University",
      department: "Dept of Post-Harvest Technology & IINRG",
      matchScore: 96,
      facultyLead: "Dr. Alok Kumar",
      studentTeam: ["Pooja Munda (M.Sc Agri)", "Rahul Singh (B.Tech Agri Engg)"]
    },
    industryPartner: {
      name: "TRIFED / NABARD Innovation Fund",
      tier: "Pilot Implementation & Market Linkage",
      pledgedAmount: "₹24,00,000",
      contactPerson: "Sunita Hansda (DGM Jharkhand)"
    },
    solutionSummary: "Micro-climate controlled PCM (Phase Change Material) solar cold storage chamber operating without diesel generator, keeping temperature between 16°C - 20°C and relative humidity under 45%.",
    trlLevel: "TRL 7 (Operational Demonstration in Torpa)",
    patentsFiled: "IP/JH/2026/0188B (Filed)",
    milestones: [
      { title: "Requirement gathering with tribal self-help groups", completed: true, date: "2026-08-15" },
      { title: "Thermal insulation & PCM chamber fabrication", completed: true, date: "2026-08-25" },
      { title: "Solar MPPT and LiFePO4 battery integration", completed: true, date: "2026-09-01" },
      { title: "Field pilot with 5-ton capacity storage", completed: true, date: "2026-09-04" },
      { title: "Commercial rollout to 10 Panchayats", completed: false, date: "Est. 2026-10-30" }
    ],
    comments: [
      { id: "c1", author: "Dr. Alok Kumar", role: "University", text: "The PCM chamber maintained 18°C throughout the 48-hour cloudy monsoon test without grid power.", time: "2 days ago" },
      { id: "c2", author: "Sunita Hansda (TRIFED)", role: "Industry", text: "Procurement price for clean stored lac has improved by 28% for the tribal farmers.", time: "18 hours ago" }
    ]
  },
  {
    id: "JH-2026-003",
    title: "High Fluoride Removal System for Remote Tribal Borewells",
    description: "Over 68 tribal habitations across Chainpur and Dumri blocks suffer from skeletal fluorosis (water fluoride > 4.8 mg/L vs permissible limit of 1.0 mg/L). Commercial RO plants waste 60% water and fail due to grid outages.",
    category: "Water",
    districtId: "gumla",
    districtName: "Gumla",
    location: "Dumri Block, Village Nawadih",
    latitude: 23.0442,
    longitude: 84.5422,
    severity: 5,
    urgencyScore: 98,
    status: "In Progress",
    kanbanStage: "Testing",
    submitterType: "Panchayati Raj Institution",
    submitterName: "Budheshwar Oraon (Panchayat Samiti Member)",
    submittedAt: "2026-08-02",
    upvotes: 564,
    hasUpvoted: false,
    clusterId: "CLUSTER-GML-WTR-01",
    duplicateCount: 6,
    images: ["https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "BIT Mesra",
      department: "Dept of Chemical Engineering & Jal Mission Lab",
      matchScore: 95,
      facultyLead: "Prof. Nilima Priyadarshini",
      studentTeam: ["Debayan Mukherjee (PhD)", "Shreya Toppo (B.Tech Chem)"]
    },
    industryPartner: {
      name: "Tata Steel CSR Rural Water Mission",
      tier: "Scale-up & Manufacturing Partnership",
      pledgedAmount: "₹45,00,000",
      contactPerson: "Sourav Ganguly (CSR Lead)"
    },
    solutionSummary: "Low-cost activated alumina-bauxite adsorbent gravity filter requiring zero electricity and generating zero liquid wastewater, reducing fluoride to < 0.6 mg/L.",
    trlLevel: "TRL 8 (Standardized Community Filter)",
    patentsFiled: "IP/JH/2026/0091C (Published)",
    milestones: [
      { title: "Comprehensive aquifer fluoride mapping (120 wells)", completed: true, date: "2026-08-08" },
      { title: "Local bauxite thermal activation optimization", completed: true, date: "2026-08-18" },
      { title: "Zero-power gravity column field testing", completed: true, date: "2026-08-28" },
      { title: "Installation across 12 primary tribal schools", completed: true, date: "2026-09-03" },
      { title: "District-wide deployment with Drinking Water Dept", completed: false, date: "Est. 2026-10-20" }
    ],
    comments: [
      { id: "c1", author: "Prof. Nilima", role: "University", text: "Field test kits in Dumri recorded 0.45 mg/L today. Regeneration cycle validated for 6 months.", time: "5 hours ago" }
    ]
  },
  {
    id: "JH-2026-004",
    title: "AI-Assisted Rural Emergency Obstetric Telehealth & Drone Delivery",
    description: "Netarhat plateau habitations in Mahuadanr and Garu blocks are cut off by deep valleys. Pregnant women face 4-hour transit to district hospital for emergency medication and diagnostic screening.",
    category: "Health",
    districtId: "latehar",
    districtName: "Latehar",
    location: "Mahuadanr Block, Village Orsa",
    latitude: 23.3986,
    longitude: 84.1132,
    severity: 5,
    urgencyScore: 97,
    status: "In Progress",
    kanbanStage: "In Research",
    submitterType: "Govt Department",
    submitterName: "Dr. R. K. Singh (Civil Surgeon Office Latehar)",
    submittedAt: "2026-08-18",
    upvotes: 380,
    hasUpvoted: true,
    clusterId: "CLUSTER-LTH-HLT-02",
    duplicateCount: 3,
    images: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "AIIMS Deoghar / NIT Jamshedpur (Joint)",
      department: "Dept of Telemedicine & Mechatronics",
      matchScore: 93,
      facultyLead: "Dr. Vivek Anand & Dr. S. K. Mahato",
      studentTeam: ["Kunal Nayak (B.Tech Robotics)", "Sneha Roy (M.D. Community Medicine)"]
    },
    industryPartner: {
      name: "Jharkhand Innovation Lab / Skye Air Mobility",
      tier: "Drone Fleet & Flight Path Logistics",
      pledgedAmount: "₹32,00,000",
      contactPerson: "Capt. Tarun Verma"
    },
    solutionSummary: "Long-range hybrid VTOL autonomous medical drone carrying oxytocin, blood units, and portable ultrasound kit with 5G/Starlink satellite link to AIIMS obstetricians.",
    trlLevel: "TRL 5 (Lab & Simulated Mountain Flight Tested)",
    patentsFiled: "IP/JH/2026/0512T (Drafted)",
    milestones: [
      { title: "Topography & cold-chain payload aerodynamic test", completed: true, date: "2026-08-25" },
      { title: "Tele-sonography protocol integration with AIIMS", completed: true, date: "2026-09-01" },
      { title: "Trial flight corridor clearance from DGCA", completed: false, date: "Est. 2026-09-18" },
      { title: "Live emergency dispatch pilot in Mahuadanr", completed: false, date: "Est. 2026-10-10" }
    ],
    comments: [
      { id: "c1", author: "Capt. Tarun", role: "Industry", text: "Flight test achieved 42km round-trip in 24 minutes through Ghat winds at 1800m altitude.", time: "1 day ago" }
    ]
  },
  {
    id: "JH-2026-005",
    title: "IoT-Driven Smart Micro-Grid & Bamboo Gasification for Unconnected Villages",
    description: "14 remote forest hamlets in Chaibasa periphery lack reliable 3-phase grid power for paddy hulling and cottage bamboo craft machinery.",
    category: "Infrastructure",
    districtId: "west_singhbhum",
    districtName: "West Singhbhum",
    location: "Gua Forest Region, Block Manjhari",
    latitude: 22.5614,
    longitude: 85.8082,
    severity: 4,
    urgencyScore: 86,
    status: "Routed to University",
    kanbanStage: "To Do",
    submitterType: "Individual",
    submitterName: "Mangal Singh Tiu (Youth Leader)",
    submittedAt: "2026-08-22",
    upvotes: 195,
    hasUpvoted: false,
    clusterId: "CLUSTER-WSB-INF-04",
    duplicateCount: 1,
    images: ["https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Kolhan University & NIT Jamshedpur",
      department: "Dept of Electrical & Renewable Energy",
      matchScore: 91,
      facultyLead: "Dr. P. N. Singh",
      studentTeam: ["Amit Hembrom (B.Tech EE)", "Ritu Kumari (M.Tech Power Systems)"]
    },
    industryPartner: {
      name: "JSPL Foundation Patratu",
      tier: "Equipment Grant",
      pledgedAmount: "₹18,00,000",
      contactPerson: "Naveen Jindal CSR Cell"
    },
    solutionSummary: "25 kW downdraft biomass gasifier utilizing agricultural waste & weed bamboo, coupled with battery storage and smart meter billing for rural micro-enterprises.",
    trlLevel: "TRL 4 (Component Validated in Lab)",
    patentsFiled: "None",
    milestones: [
      { title: "Biomass feedstock survey & moisture profiling", completed: true, date: "2026-08-30" },
      { title: "Gasifier reactor chamber CAD design", completed: false, date: "Est. 2026-09-15" },
      { title: "Micro-grid inverter synchronized bench test", completed: false, date: "Est. 2026-09-30" }
    ],
    comments: [
      { id: "c1", author: "Dr. P. N. Singh", role: "University", text: "Proposal accepted by department board. Student team assembled for site reconnaissance on Friday.", time: "1 day ago" }
    ]
  },
  {
    id: "JH-2026-006",
    title: "Millet & Ragi Value-Addition Mobile Processing Unit for Tribal Women",
    description: "Mandu and Gola farmers produce tons of finger millet (Marua) but sell unprocessed grain at ₹18/kg to middlemen due to lack of local de-hulling and packaging equipment.",
    category: "Livelihood",
    districtId: "ramgarh",
    districtName: "Ramgarh",
    location: "Gola Block, Village Korambe",
    latitude: 23.6332,
    longitude: 85.5186,
    severity: 3,
    urgencyScore: 84,
    status: "Solved",
    kanbanStage: "Submitted for Review",
    submitterType: "Community Group",
    submitterName: "Birsa Kisan Vikas Sangha",
    submittedAt: "2026-07-15",
    upvotes: 340,
    hasUpvoted: true,
    clusterId: "CLUSTER-RMG-LIV-03",
    duplicateCount: 2,
    images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Birsa Agricultural University",
      department: "Dept of Agricultural Processing & Food Engg",
      matchScore: 97,
      facultyLead: "Prof. Vandana Kumari",
      studentTeam: ["Priya Sharma (M.Tech)", "Dharmendra Gope (B.Sc Agri)"]
    },
    industryPartner: {
      name: "JSLPS (Palash Brand) & ITC CSR",
      tier: "Commercial Off-take & Branding",
      pledgedAmount: "₹28,00,000",
      contactPerson: "Manish Sinha (State Mission Manager)"
    },
    solutionSummary: "Trailer-mounted solar-hybrid millet de-husker, pulverizer, and moisture-proof packaging line serving 8 villages on a scheduled weekly route.",
    trlLevel: "TRL 9 (Commercial Statewide Adoption)",
    patentsFiled: "IP/JH/2026/0014M (Granted)",
    milestones: [
      { title: "Mobile unit mechanical assembly & vibration dampening", completed: true, date: "2026-07-28" },
      { title: "FSSAI nutritional profiling & packaging testing", completed: true, date: "2026-08-12" },
      { title: "Deployment under 'Palash' brand in Ranchi & Ramgarh", completed: true, date: "2026-08-25" },
      { title: "Over ₹4.2 Lakh incremental farmer income recorded", completed: true, date: "2026-09-01" }
    ],
    comments: [
      { id: "c1", author: "Prof. Vandana", role: "University", text: "Successfully handed over 3 mobile units to Women SHG federations. Value realized is now ₹65/kg.", time: "4 days ago" }
    ]
  },
  {
    id: "JH-2026-007",
    title: "AI-Powered Multilingual Digital Classroom for Santhali & Ho Language Tribal Schools",
    description: "Over 400 primary schools in Dumka and Pakur lack interactive digital content in Ol Chiki and Warang Citi scripts, leading to a 42% dropout rate among tribal children in Grades 1-3.",
    category: "Education",
    districtId: "dumka",
    districtName: "Dumka",
    location: "Ranishwar Block, Govt Primary School",
    latitude: 24.2690,
    longitude: 87.2464,
    severity: 4,
    urgencyScore: 89,
    status: "In Progress",
    kanbanStage: "Prototyping",
    submitterType: "Individual",
    submitterName: "Marshal Hansda (Headmaster)",
    submittedAt: "2026-08-11",
    upvotes: 310,
    hasUpvoted: false,
    clusterId: "CLUSTER-DMK-EDU-05",
    duplicateCount: 3,
    images: ["https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Sido Kanhu Murmu University (SKMU) & IIIT Ranchi",
      department: "Dept of Computer Science & Tribal Linguistics",
      matchScore: 94,
      facultyLead: "Dr. Sushil Soren",
      studentTeam: ["Tapan Murmu (B.Tech CSE)", "Anita Besra (M.A. Santhali)"]
    },
    industryPartner: {
      name: "Tata Trusts Education Foundation",
      tier: "Tablet Hardware & Content Licensing",
      pledgedAmount: "₹22,00,000",
      contactPerson: "Amrita Sen (Program Director)"
    },
    solutionSummary: "Offline-first gamified voice interactive learning app with generative audio translation into Santhali (Ol Chiki) and Ho languages mapped to NCERT/JCERT syllabus.",
    trlLevel: "TRL 6 (Live Testing in 20 Schools)",
    patentsFiled: "Copyright Reg: SW-18892/2026",
    milestones: [
      { title: "Santhali acoustic corpus dataset creation (12,000 voice prompts)", completed: true, date: "2026-08-20" },
      { title: "Offline edge LLM speech synthesizer deployment on low-cost tablets", completed: true, date: "2026-08-30" },
      { title: "Classroom engagement pilot across 20 schools in Dumka", completed: false, date: "Est. 2026-09-20" }
    ],
    comments: [
      { id: "c1", author: "Dr. Sushil Soren", role: "University", text: "Ol Chiki font rendering and phoneme recognition achieved 96% accuracy on child voice tests.", time: "2 days ago" }
    ]
  },
  {
    id: "JH-2026-008",
    title: "Automated Grievance & Ration Entitlement Tracking via Voice-AI Bot",
    description: "Elderly beneficiaries in rural Deoghar and Madhupur travel 15km to block offices to inquire about PDS ration stock, DBT pension credit, and mutation status without receiving clear answers.",
    category: "Governance",
    districtId: "deoghar",
    districtName: "Deoghar",
    location: "Mohanpur Block, Deoghar",
    latitude: 24.4826,
    longitude: 86.7000,
    severity: 3,
    urgencyScore: 81,
    status: "Under Review",
    kanbanStage: "To Do",
    submitterType: "Urban Local Body",
    submitterName: "Deoghar Nagarpalika Citizen Cell",
    submittedAt: "2026-08-26",
    upvotes: 178,
    hasUpvoted: false,
    clusterId: "CLUSTER-DGH-GOV-02",
    duplicateCount: 1,
    images: ["https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "BIT Mesra Deoghar Extension",
      department: "Dept of Artificial Intelligence & Data Science",
      matchScore: 89,
      facultyLead: "Dr. Manish Ojha",
      studentTeam: ["Pankaj Jha (B.Tech)", "Kavita Tiwari (MCA)"]
    },
    industryPartner: {
      name: "Jharkhand IT Solutions & NIC",
      tier: "Govt API Gateway Integration",
      pledgedAmount: "₹12,00,000",
      contactPerson: "S. K. Verma (State Informatics Officer)"
    },
    solutionSummary: "Toll-free IVRS + WhatsApp voice bot in Khortha & Hindi that queries state databases in real-time to tell citizens the exact status of their food grain quota and pension credit.",
    trlLevel: "TRL 4 (API Integration Prototype)",
    patentsFiled: "None",
    milestones: [
      { title: "Architecture flow & Jharbhoomi/Aahar portal API review", completed: true, date: "2026-09-02" },
      { title: "Voicebot dialect fine-tuning for Santhal Pargana dialects", completed: false, date: "Est. 2026-09-22" }
    ],
    comments: [
      { id: "c1", author: "Dr. Manish Ojha", role: "University", text: "Telephony stack configured with FreeSWITCH. Dialect testing will commence next week.", time: "1 day ago" }
    ]
  },
  {
    id: "JH-2026-009",
    title: "Fly Ash Ceramic Bricks & Geopolymer Concrete from Thermal Power Waste",
    description: "Massive fly ash dumps around Bokaro Steel Plant and Chandrapura thermal stations cause respiratory illness and contaminate the Konar river embankment.",
    category: "Environment",
    districtId: "bokaro",
    districtName: "Bokaro",
    location: "Bermo & Chandrapura Block",
    latitude: 23.7438,
    longitude: 86.0125,
    severity: 4,
    urgencyScore: 88,
    status: "In Progress",
    kanbanStage: "Testing",
    submitterType: "Community Group",
    submitterName: "Damodar Bachao Abhiyan (Bokaro)",
    submittedAt: "2026-08-05",
    upvotes: 245,
    hasUpvoted: false,
    clusterId: "CLUSTER-BKR-ENV-07",
    duplicateCount: 3,
    images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "BIT Sindri & IIT (ISM) Dhanbad",
      department: "Dept of Civil & Metallurgical Engineering",
      matchScore: 96,
      facultyLead: "Prof. Pankaj Rai",
      studentTeam: ["Sameer Gupta (M.Tech)", "Tanmay Biswas (B.Tech)"]
    },
    industryPartner: {
      name: "SAIL Bokaro Steel Plant CSR",
      tier: "Offtake Agreement & Industrial Pilot",
      pledgedAmount: "₹35,00,000",
      contactPerson: "A. K. Srivastava (Chief Engineer)"
    },
    solutionSummary: "Zero-cement geopolymer bricks manufactured by alkali-activation of raw fly ash and blast furnace slag, having 2.5x higher compressive strength than red clay bricks with 80% lower carbon footprint.",
    trlLevel: "TRL 7 (Industrial Trial Batch Produced)",
    patentsFiled: "IP/JH/2026/0290K (Filed)",
    milestones: [
      { title: "Slag-to-fly ash chemical stoichiometric optimization", completed: true, date: "2026-08-16" },
      { title: "Compressive load test (IS 3495 compliant - 18.5 MPa)", completed: true, date: "2026-08-27" },
      { title: "Trial pavement installation at Bokaro township sector 4", completed: true, date: "2026-09-03" },
      { title: "Full commercial certification from BIS", completed: false, date: "Est. 2026-10-10" }
    ],
    comments: [
      { id: "c1", author: "Prof. Pankaj Rai", role: "University", text: "Bricks passed the 50-cycle freeze-thaw water absorption threshold at just 6.8%.", time: "2 days ago" }
    ]
  },
  {
    id: "JH-2026-010",
    title: "Low-Cost Solar Drip Irrigation with Soil Moisture Telemetry for Plateau Farmers",
    description: "Hilly topography in Ormanjhi and Angara blocks causes rapid rainfall runoff. Farmers face complete crop failure in Rabi season despite having small check-dams nearby.",
    category: "Agriculture",
    districtId: "ranchi",
    districtName: "Ranchi",
    location: "Ormanjhi Block, Village Kuchu",
    latitude: 23.4795,
    longitude: 85.4789,
    severity: 4,
    urgencyScore: 87,
    status: "In Progress",
    kanbanStage: "Prototyping",
    submitterType: "Individual",
    submitterName: "Suresh Pahan (Farmer Producer Org)",
    submittedAt: "2026-08-14",
    upvotes: 390,
    hasUpvoted: true,
    clusterId: "CLUSTER-RNC-AGR-03",
    duplicateCount: 5,
    images: ["https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Birsa Agricultural University & BIT Mesra",
      department: "Dept of Soil & Water Conservation",
      matchScore: 97,
      facultyLead: "Dr. B. K. Jha",
      studentTeam: ["Rohit Verma (B.Tech)", "Sita Kumari (M.Sc)"]
    },
    industryPartner: {
      name: "Jain Irrigation Systems & JSLPS",
      tier: "Subsidized Equipment Supply",
      pledgedAmount: "₹20,00,000",
      contactPerson: "Harish Patel (Regional Lead)"
    },
    solutionSummary: "LoRaWAN-enabled solar DC pump with automated micro-drip manifold controlled by wireless soil capacitive sensors, delivering 40% water savings and increasing vegetable yield by 35%.",
    trlLevel: "TRL 6 (Field Validated on 8 Acres)",
    patentsFiled: "IP/JH/2026/0331D (Pending)",
    milestones: [
      { title: "LoRaWAN mesh network sensor nodes fabrication", completed: true, date: "2026-08-22" },
      { title: "Installation of solar pump controller at Ormanjhi plot", completed: true, date: "2026-09-01" },
      { title: "Rabi tomato & capsicum yield benchmarking", completed: false, date: "Est. 2026-10-30" }
    ],
    comments: [
      { id: "c1", author: "Dr. B. K. Jha", role: "University", text: "Irrigation automation is active. Water consumption dropped from 4200 L/day to 2400 L/day on Plot 2.", time: "12 hours ago" }
    ]
  },
  {
    id: "JH-2026-011",
    title: "Uranium Tailings Dust Suppression & Bio-Barrier in Jaduguda Belt",
    description: "Windblown tailings pond dust in Jaduguda and Turamdih contains low-level radiation and fine silica, triggering chronic bronchitis among neighboring tribal habitations.",
    category: "Environment",
    districtId: "east_singhbhum",
    districtName: "East Singhbhum (Jamshedpur)",
    location: "Potka Block, Jaduguda Uranium Complex",
    latitude: 22.6519,
    longitude: 86.3475,
    severity: 5,
    urgencyScore: 93,
    status: "In Progress",
    kanbanStage: "In Research",
    submitterType: "Community Group",
    submitterName: "Jharkhand Anti-Radiation Tribal Forum",
    submittedAt: "2026-08-01",
    upvotes: 480,
    hasUpvoted: false,
    clusterId: "CLUSTER-ESB-ENV-02",
    duplicateCount: 4,
    images: ["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "NIT Jamshedpur & BARC Research Center",
      department: "Dept of Metallurgical & Materials Engineering",
      matchScore: 96,
      facultyLead: "Dr. Ranjit Prasad",
      studentTeam: ["Deepak Mahali (PhD)", "Aakriti Singh (M.Tech)"]
    },
    industryPartner: {
      name: "Tata Steel CSR & UCIL Environmental Cell",
      tier: "Environmental Safety Grant",
      pledgedAmount: "₹42,00,000",
      contactPerson: "Dr. K. N. Sen"
    },
    solutionSummary: "Hyperaccumulator indigenous grass bio-capping (Vetiver + Crotalaria) integrated with biopolymer crust spray to permanently bind tailings particles and arrest dust dispersion.",
    trlLevel: "TRL 5 (Lysimeter Field Column Validated)",
    patentsFiled: "IP/JH/2026/0402U",
    milestones: [
      { title: "Soil core radioactive spectrometry baseline survey", completed: true, date: "2026-08-14" },
      { title: "Bio-polymer binder surfactant formulation", completed: true, date: "2026-08-29" },
      { title: "Green bio-barrier nursery plantation on Pond 3 dyke", completed: false, date: "Est. 2026-09-24" }
    ],
    comments: [
      { id: "c1", author: "Dr. Ranjit Prasad", role: "University", text: "Vetiver root penetration verified at 1.4m depth with no downward radionuclide leaching.", time: "3 days ago" }
    ]
  },
  {
    id: "JH-2026-012",
    title: "Mica Scrap Reclamation & Sustainable Bio-Cosmetics Extraction",
    description: "Illegal mica scrap collection by informal workers in Koderma and Domchanch leads to hazardous child labor and silicosis risk with little economic return to the local families.",
    category: "Livelihood",
    districtId: "koderma",
    districtName: "Koderma",
    location: "Domchanch Block, Village Dhab",
    latitude: 24.4697,
    longitude: 85.5947,
    severity: 4,
    urgencyScore: 83,
    status: "Routed to University",
    kanbanStage: "To Do",
    submitterType: "Community Group",
    submitterName: "Koderma Shramik Kalyan Samiti",
    submittedAt: "2026-08-19",
    upvotes: 215,
    hasUpvoted: false,
    clusterId: "CLUSTER-KDR-LIV-01",
    duplicateCount: 2,
    images: ["https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Central University of Jharkhand & BIT Mesra",
      department: "Dept of Chemistry & Material Sciences",
      matchScore: 92,
      facultyLead: "Dr. Manoj Kumar",
      studentTeam: ["Pooja Agarwal (M.Sc)", "Suraj Soren (B.Tech)"]
    },
    industryPartner: {
      name: "TRIFED / Ethical Sourcing Consortium",
      tier: "Fair Trade Value Chain Setup",
      pledgedAmount: "₹21,00,000",
      contactPerson: "Aditi Rao (Supply Chain Lead)"
    },
    solutionSummary: "Enclosed wet-milling process eliminating airborne silica dust, creating high-purity pearlized mica pigment for certified green cosmetics with direct cooperative profits.",
    trlLevel: "TRL 4 (Lab Tested Milling Prototype)",
    patentsFiled: "None",
    milestones: [
      { title: "Wet-milling cyclone design to eliminate respirable dust", completed: true, date: "2026-08-31" },
      { title: "Purity & heavy-metal certification testing", completed: false, date: "Est. 2026-09-20" }
    ],
    comments: [
      { id: "c1", author: "Dr. Manoj Kumar", role: "University", text: "Laboratory bench tests achieved cosmetic grade 20-micron flake uniformity with zero silica dust escape.", time: "1 day ago" }
    ]
  },
  {
    id: "JH-2026-013",
    title: "Early Warning & Acoustic Siren Network for Human-Elephant Conflict in Forest Corridors",
    description: "Wild elephant herds traversing Dalma-Tamar-Sonahatu corridor destroy crops and cause human casualties in 18 villages during harvest season every autumn.",
    category: "Environment",
    districtId: "saraikela",
    districtName: "Saraikela Kharsawan",
    location: "Chandil & Tamar Corridor Border",
    latitude: 22.9680,
    longitude: 85.9984,
    severity: 5,
    urgencyScore: 92,
    status: "In Progress",
    kanbanStage: "Testing",
    submitterType: "Govt Department",
    submitterName: "Jharkhand Forest Department (Dalma Division)",
    submittedAt: "2026-08-04",
    upvotes: 430,
    hasUpvoted: true,
    clusterId: "CLUSTER-SRK-ENV-05",
    duplicateCount: 5,
    images: ["https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "IIIT Ranchi & NIT Jamshedpur",
      department: "Dept of Embedded IoT & Computer Vision",
      matchScore: 97,
      facultyLead: "Dr. Rajesh Kumar",
      studentTeam: ["Avinash Tiwary (B.Tech)", "Megha Das (M.Tech IoT)"]
    },
    industryPartner: {
      name: "Tata Steel Foundation (Tribal Heritage Wing)",
      tier: "Field Hardware & Radio Towers",
      pledgedAmount: "₹30,00,000",
      contactPerson: "Jiren Xavier Topno"
    },
    solutionSummary: "Seismic geophone vibration sensors + AI thermal camera towers along forest borders that detect elephant rumble and movement 2km away, triggering automated SMS to villagers and directional low-frequency bee-sound repellents.",
    trlLevel: "TRL 7 (Deployed at 4 Corridor Checkpoints)",
    patentsFiled: "IP/JH/2026/0122W (Published)",
    milestones: [
      { title: "Elephant infrasound seismic library calibration", completed: true, date: "2026-08-12" },
      { title: "Solar thermal optical camera deployment on 3 towers", completed: true, date: "2026-08-24" },
      { title: "Automated village loudspeaker & SMS alert integration", completed: true, date: "2026-09-02" },
      { title: "Zero human casualty record achieved during August trial", completed: true, date: "2026-09-05" }
    ],
    comments: [
      { id: "c1", author: "Dr. Rajesh Kumar", role: "University", text: "Camera unit #2 detected a herd of 7 elephants at 02:14 AM last night; sirens redirected them away from Tamar school.", time: "18 hours ago" }
    ]
  },
  {
    id: "JH-2026-014",
    title: "Ganga River Plastic Interceptor & Bio-Enzymatic Silt Dredger at Sahibganj Port",
    description: "Plastic debris and organic solid waste from upstream cities accumulate in the Sahibganj multi-modal terminal backwaters, harming endangered Gangetic dolphins and blocking fishers' nets.",
    category: "Water",
    districtId: "sahibganj",
    districtName: "Sahibganj",
    location: "Ganga Ghat & Multi-Modal Port, Sahibganj",
    latitude: 25.2425,
    longitude: 87.6416,
    severity: 4,
    urgencyScore: 85,
    status: "Under Review",
    kanbanStage: "To Do",
    submitterType: "Urban Local Body",
    submitterName: "Sahibganj Nagar Parishad",
    submittedAt: "2026-08-25",
    upvotes: 210,
    hasUpvoted: false,
    clusterId: "CLUSTER-SBG-WTR-01",
    duplicateCount: 2,
    images: ["https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Sido Kanhu Murmu University & IIT ISM Dhanbad",
      department: "Dept of Riverine Ecology & Marine Engineering",
      matchScore: 91,
      facultyLead: "Dr. Subhash Bose",
      studentTeam: ["Ankit Choudhary (B.Tech)", "Kalyani Singh (M.Sc)"]
    },
    industryPartner: {
      name: "Inland Waterways Authority of India (IWAI CSR)",
      tier: "Watercraft Prototype Fabrication",
      pledgedAmount: "₹26,00,000",
      contactPerson: "Col. P. K. Saxena"
    },
    solutionSummary: "Solar-electric catamaran barrier boat with automatic conveyor rakes collecting 1.2 tons of floating plastics daily without harming aquatic wildlife.",
    trlLevel: "TRL 4 (Detailed Simulation & Scale Model)",
    patentsFiled: "None",
    milestones: [
      { title: "Hydraulic current velocity & debris trajectory mapping", completed: true, date: "2026-09-02" },
      { title: "Solar catamaran buoyancy calculation", completed: false, date: "Est. 2026-09-28" }
    ],
    comments: [
      { id: "c1", author: "Dr. Subhash Bose", role: "University", text: "Hydrodynamic test shows optimal placement 400m upstream of ferry jetty.", time: "2 days ago" }
    ]
  },
  {
    id: "JH-2026-015",
    title: "Black Stone Dust Suppression & Air Filter Wall for Pakur Quarry Clusters",
    description: "Dense silica dust clouds from 80+ black stone crushing units in Malpahari cause rampant pneumoconiosis among stone breaker laborers and coat paddy fields within a 3km radius.",
    category: "Health",
    districtId: "pakur",
    districtName: "Pakur",
    location: "Malpahari Stone Mining Area",
    latitude: 24.6337,
    longitude: 87.8488,
    severity: 5,
    urgencyScore: 94,
    status: "In Progress",
    kanbanStage: "Prototyping",
    submitterType: "Community Group",
    submitterName: "Pakur Mazdoor Sangathan",
    submittedAt: "2026-08-08",
    upvotes: 375,
    hasUpvoted: true,
    clusterId: "CLUSTER-PKR-HLT-01",
    duplicateCount: 4,
    images: ["https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "IIT (ISM) Dhanbad & BIT Sindri",
      department: "Dept of Mining Machinery & Occupational Health",
      matchScore: 96,
      facultyLead: "Prof. K. C. Murmu",
      studentTeam: ["Prakash Tudu (M.Tech)", "Gaurav Sen (B.Tech)"]
    },
    industryPartner: {
      name: "Pakur Stone Quarry Owners Association",
      tier: "Co-Development & Equipment Deployment",
      pledgedAmount: "₹34,00,000",
      contactPerson: "Binod Bhagat (President)"
    },
    solutionSummary: "Ultrasonic dry fog misting nozzles creating 5-micron water droplets that agglomerate PM2.5 and PM10 silica particles at hopper drop points using 90% less water than traditional sprinklers.",
    trlLevel: "TRL 6 (Live Crusher Site Demonstration)",
    patentsFiled: "IP/JH/2026/0455P (Pending)",
    milestones: [
      { title: "PM2.5 / PM10 continuous optical sensor grid installation", completed: true, date: "2026-08-17" },
      { title: "Ultrasonic dry fog manifold testing at Crusher Unit 7", completed: true, date: "2026-08-30" },
      { title: "Airborne silica reduction validation (84% drop)", completed: true, date: "2026-09-04" },
      { title: "Universal mandate rollout with District Mining Officer", completed: false, date: "Est. 2026-10-18" }
    ],
    comments: [
      { id: "c1", author: "Prof. K. C. Murmu", role: "University", text: "Ambient PM10 dropped from 480 ug/m3 to 85 ug/m3 around the crusher hopper after 15 minutes of dry fogging.", time: "1 day ago" }
    ]
  },
  {
    id: "JH-2026-016",
    title: "Thermal Power Station Flue Gas Desulfurization & Soil Conditioner Synthesis",
    description: "High sulfur dioxide emissions from coal combustion in Godda affect betel leaf (Paan) and mango orchards in Poraiyahat and Meharma blocks.",
    category: "Agriculture",
    districtId: "godda",
    districtName: "Godda",
    location: "Poraiyahat & Meharma Blocks",
    latitude: 24.8268,
    longitude: 87.2132,
    severity: 4,
    urgencyScore: 84,
    status: "In Progress",
    kanbanStage: "In Research",
    submitterType: "Individual",
    submitterName: "Anand Mandal (Farmer)",
    submittedAt: "2026-08-16",
    upvotes: 198,
    hasUpvoted: false,
    clusterId: "CLUSTER-GDD-AGR-02",
    duplicateCount: 1,
    images: ["https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Birsa Agricultural University & SKMU",
      department: "Dept of Agronomy & Soil Chemistry",
      matchScore: 92,
      facultyLead: "Dr. Archana Mishra",
      studentTeam: ["Sunil Soren (B.Sc)", "Ragini Kumari (M.Sc)"]
    },
    industryPartner: {
      name: "Adani Power Godda CSR",
      tier: "Research Grant & Agricultural Outgrower Scheme",
      pledgedAmount: "₹25,00,000",
      contactPerson: "Rajeev Ranjan"
    },
    solutionSummary: "Synthesized synthetic gypsum from FGD scrubbers modified with humic acid, serving as a soil conditioner that corrects alkaline plateau soils and boosts mango flowering.",
    trlLevel: "TRL 5 (Plot Field Trials in Progress)",
    patentsFiled: "None",
    milestones: [
      { title: "Flue gas synthetic gypsum chemical neutralization", completed: true, date: "2026-08-28" },
      { title: "Humic acid granulation pilot batch", completed: false, date: "Est. 2026-09-18" }
    ],
    comments: [
      { id: "c1", author: "Dr. Archana Mishra", role: "University", text: "Initial pot culture trials indicate 22% improvement in root density for betel vines.", time: "3 days ago" }
    ]
  },
  {
    id: "JH-2026-017",
    title: "AI-Powered Cyber Shield & Ethical Tech Training for Rural Youth",
    description: "Socio-economic vulnerability leads youth in Karmatanr and Narayanpur blocks to fall into organized phishing and OTP scams, causing nationwide law enforcement crackdowns on local villages.",
    category: "Education",
    districtId: "jamtara",
    districtName: "Jamtara",
    location: "Karmatanr Block, Jamtara",
    latitude: 23.9619,
    longitude: 86.8025,
    severity: 4,
    urgencyScore: 82,
    status: "In Progress",
    kanbanStage: "Prototyping",
    submitterType: "Govt Department",
    submitterName: "Jharkhand Police Cyber Cell & District Admin",
    submittedAt: "2026-08-07",
    upvotes: 360,
    hasUpvoted: true,
    clusterId: "CLUSTER-JMT-EDU-01",
    duplicateCount: 3,
    images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "IIIT Ranchi & Central University of Jharkhand",
      department: "Dept of Cyber Security & Ethical Hacking",
      matchScore: 98,
      facultyLead: "Prof. Anupam Shukla",
      studentTeam: ["Abhay Kumar (M.Tech Cyber)", "Deepika Paul (B.Tech)"]
    },
    industryPartner: {
      name: "NASSCOM Foundation & QuickHeal Academy",
      tier: "Skill Certification & Job Placement",
      pledgedAmount: "₹36,00,000",
      contactPerson: "Neeraj Arora (Director Skills)"
    },
    solutionSummary: "Youth Digital Transformation Hub turning reformed youth into certified SOC (Security Operations Center) tier-1 analysts, bug bounty hunters, and ethical penetration testers.",
    trlLevel: "TRL 8 (First Batch of 85 Analysts Graduated)",
    patentsFiled: "Curriculum Registered with NCVET",
    milestones: [
      { title: "Hands-on cyber lab established at Karmatanr High School", completed: true, date: "2026-08-15" },
      { title: "100-hour SOC defense & threat detection curriculum delivery", completed: true, date: "2026-08-30" },
      { title: "First 32 rural youth placed in remote cybersecurity jobs", completed: true, date: "2026-09-04" },
      { title: "Statewide expansion across 5 adjoining districts", completed: false, date: "Est. 2026-11-15" }
    ],
    comments: [
      { id: "c1", author: "Prof. Anupam Shukla", role: "University", text: "3 students found critical vulnerabilities in open-source libraries and earned international bug bounties this week.", time: "1 day ago" }
    ]
  },
  {
    id: "JH-2026-018",
    title: "Bauxite Mine Overburden Revegetation & Sustainable Terracing",
    description: "Open-cast bauxite quarries across Bagru and Pakhar plateaus leave barren laterite overburden dumps prone to monsoonal landslides into tribal paddy valleys.",
    category: "Environment",
    districtId: "lohardaga",
    districtName: "Lohardaga",
    location: "Bagru Hill Bauxite Plateau",
    latitude: 23.4412,
    longitude: 84.6835,
    severity: 4,
    urgencyScore: 83,
    status: "In Progress",
    kanbanStage: "Testing",
    submitterType: "Community Group",
    submitterName: "Bagru Tribal Gram Sabha",
    submittedAt: "2026-08-12",
    upvotes: 270,
    hasUpvoted: false,
    clusterId: "CLUSTER-LHD-ENV-03",
    duplicateCount: 2,
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Birsa Agricultural University & Ranchi University",
      department: "Dept of Forestry & Environmental Sciences",
      matchScore: 94,
      facultyLead: "Dr. M. S. Malik",
      studentTeam: ["Santosh Oraon (PhD Forestry)", "Pooja Roy (M.Sc)"]
    },
    industryPartner: {
      name: "Hindalco Industries CSR",
      tier: "Mine Reclamation Grant",
      pledgedAmount: "₹29,00,000",
      contactPerson: "Alok Gupta (VP Mining)"
    },
    solutionSummary: "Mycorrhizal inoculated native nitrogen-fixing trees (Acacia catechu, Albizia) paired with geotextile coir matting to stabilize 40-degree laterite slopes.",
    trlLevel: "TRL 7 (30 Hectares Reclaimed)",
    patentsFiled: "None",
    milestones: [
      { title: "Mycorrhizal root fungal formulation isolation", completed: true, date: "2026-08-20" },
      { title: "Coir geotextile anchoring on West Dump #4", completed: true, date: "2026-08-29" },
      { title: "Sapling survival monitoring (89% survival recorded)", completed: true, date: "2026-09-04" }
    ],
    comments: [
      { id: "c1", author: "Dr. M. S. Malik", role: "University", text: "Heavy rain yesterday caused zero slope failure on the geotextile sector. Soil runoff reduced by 94%.", time: "2 days ago" }
    ]
  },
  {
    id: "JH-2026-019",
    title: "Cold Chain Dairy & Chilling Center Automation for Tribal Women Herders",
    description: "Kolebira and Bano milk producers suffer 28% milk souring during summer due to lack of local chilling and erratic single-phase grid power.",
    category: "Livelihood",
    districtId: "simdega",
    districtName: "Simdega",
    location: "Kolebira Block, Village Lachragarh",
    latitude: 22.6133,
    longitude: 84.7001,
    severity: 3,
    urgencyScore: 82,
    status: "Solved",
    kanbanStage: "Submitted for Review",
    submitterType: "Community Group",
    submitterName: "Simdega Mahila Dairy Federation",
    submittedAt: "2026-07-20",
    upvotes: 310,
    hasUpvoted: true,
    clusterId: "CLUSTER-SMD-LIV-02",
    duplicateCount: 2,
    images: ["https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Birsa Agricultural University (Faculty of Dairy Tech)",
      department: "Dept of Dairy Technology",
      matchScore: 96,
      facultyLead: "Dr. Sanjay Kumar",
      studentTeam: ["Divya Beck (M.Tech)", "Vikash Kujur (B.Tech)"]
    },
    industryPartner: {
      name: "Medha Dairy (Jharkhand State Dairy Federation) & NDDB",
      tier: "Commercial Milk Route Expansion",
      pledgedAmount: "₹31,00,000",
      contactPerson: "Dr. B. S. Chandel"
    },
    solutionSummary: "Thermal energy storage (ice-bank) solar bulk milk cooler chilling 1000L of fresh milk from 35°C to 4°C in under 90 minutes without grid electricity.",
    trlLevel: "TRL 9 (Commercial Daily Operation)",
    patentsFiled: "IP/JH/2026/0078D (Granted)",
    milestones: [
      { title: "Solar ice-bank compressor system sizing", completed: true, date: "2026-08-01" },
      { title: "Installation at Lachragarh milk collection hub", completed: true, date: "2026-08-15" },
      { title: "Integration with Medha Dairy daily tanker procurement", completed: true, date: "2026-08-25" },
      { title: "Zero milk rejection recorded in entire month of August", completed: true, date: "2026-09-02" }
    ],
    comments: [
      { id: "c1", author: "Dr. Sanjay Kumar", role: "University", text: "SHG members earned an extra ₹1.8 Lakh this month with bonus fat content pricing.", time: "3 days ago" }
    ]
  },
  {
    id: "JH-2026-020",
    title: "Community Solar Water Purification & Micro-Kiosk for Drought-Prone Palamu",
    description: "Deep tubewells in Lesliganj and Chhatarpur blocks dry up in April-June, while surviving surface water sources contain high turbidity and microbial pathogen loads.",
    category: "Water",
    districtId: "palamu",
    districtName: "Palamu",
    location: "Lesliganj Block, Village Tarhasi",
    latitude: 23.9922,
    longitude: 84.2234,
    severity: 5,
    urgencyScore: 93,
    status: "In Progress",
    kanbanStage: "Testing",
    submitterType: "Panchayati Raj Institution",
    submitterName: "Sunil Shukla (Gram Pradhan)",
    submittedAt: "2026-08-09",
    upvotes: 490,
    hasUpvoted: true,
    clusterId: "CLUSTER-PLM-WTR-04",
    duplicateCount: 5,
    images: ["https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Nilamber Pitamber University & BIT Mesra",
      department: "Dept of Chemistry & Mechanical Engineering",
      matchScore: 94,
      facultyLead: "Dr. Rakesh Pathak",
      studentTeam: ["Pooja Dubey (M.Sc)", "Anil Tiwary (B.Tech)"]
    },
    industryPartner: {
      name: "Adani Solar & WaterAid India",
      tier: "Solar Panel & RO Kiosk Co-Sponsorship",
      pledgedAmount: "₹37,00,000",
      contactPerson: "Vikram Singhania"
    },
    solutionSummary: "Automated solar-powered membrane filtration unit dispensing clean WHO-grade mineralized water at ₹0.20/liter via smart RFID card with automated greywater diversion to community orchards.",
    trlLevel: "TRL 7 (Operating in 3 Villages)",
    patentsFiled: "IP/JH/2026/0211W (Pending)",
    milestones: [
      { title: "Groundwater TDS & microbial coliform profiling", completed: true, date: "2026-08-16" },
      { title: "Solar photovoltaic pump & membrane skid assembly", completed: true, date: "2026-08-27" },
      { title: "RFID water dispensing smart cards distributed to 450 families", completed: true, date: "2026-09-03" }
    ],
    comments: [
      { id: "c1", author: "Dr. Rakesh Pathak", role: "University", text: "Bacterial colony counts reduced from 140 CFU/ml to 0. Over 18,000 liters dispensed this week.", time: "1 day ago" }
    ]
  },
  {
    id: "JH-2026-021",
    title: "AI-Assisted Soil Salinity & Drought-Resilient Seed Selection for Garhwa Basin",
    description: "North-Koel canal tail-end farmers face soil salinization and sudden terminal heat stress during wheat and chickpea flowering, slashing yield by up to 50%.",
    category: "Agriculture",
    districtId: "garhwa",
    districtName: "Garhwa",
    location: "Bhavnathpur Block, Garhwa",
    latitude: 24.1812,
    longitude: 83.8055,
    severity: 4,
    urgencyScore: 86,
    status: "Routed to University",
    kanbanStage: "To Do",
    submitterType: "Individual",
    submitterName: "Devendra Pandey (Progressive Farmer)",
    submittedAt: "2026-08-21",
    upvotes: 180,
    hasUpvoted: false,
    clusterId: "CLUSTER-GRH-AGR-01",
    duplicateCount: 1,
    images: ["https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Birsa Agricultural University (ZRS Chianki)",
      department: "Dept of Plant Breeding & Genetics",
      matchScore: 93,
      facultyLead: "Dr. D. N. Singh",
      studentTeam: ["Praveen Kumar (PhD)", "Shalini Gupta (M.Sc)"]
    },
    industryPartner: {
      name: "Mahyco Seeds & NABARD",
      tier: "Varietal Seed Multiplication",
      pledgedAmount: "₹19,00,000",
      contactPerson: "Dr. Ramesh Iyer"
    },
    solutionSummary: "AI smartphone tool for instant leaf hyperspectral analysis of heat stress paired with introduction of short-duration drought-tolerant chickpea varieties (Birsa Chana 3).",
    trlLevel: "TRL 4 (Field Tested Varietal Trials)",
    patentsFiled: "None",
    milestones: [
      { title: "Soil electrical conductivity GIS mapping across 40 plots", completed: true, date: "2026-09-01" },
      { title: "Mobile vision model training on chickpea chlorophyll fluorescence", completed: false, date: "Est. 2026-09-26" }
    ],
    comments: [
      { id: "c1", author: "Dr. D. N. Singh", role: "University", text: "Varietal seed kits will be dispatched to Bhavnathpur for early Rabi sowing.", time: "2 days ago" }
    ]
  },
  {
    id: "JH-2026-022",
    title: "Coal Dust Suppression & Smart Highway Corridor Monitoring in Tandwa",
    description: "Thousands of heavy coal dumpers from CCL Amrapali and Magadh open-cast projects generate suffocating dust on the Tandwa-Simaria state highway, affecting schools and roadside markets.",
    category: "Infrastructure",
    districtId: "chatra",
    districtName: "Chatra",
    location: "Tandwa Block, Coal Transit Corridor",
    latitude: 23.8560,
    longitude: 85.0345,
    severity: 4,
    urgencyScore: 84,
    status: "In Progress",
    kanbanStage: "Prototyping",
    submitterType: "Community Group",
    submitterName: "Tandwa Nagrik Manch",
    submittedAt: "2026-08-15",
    upvotes: 295,
    hasUpvoted: true,
    clusterId: "CLUSTER-CTR-INF-02",
    duplicateCount: 3,
    images: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Vinoba Bhave University & IIT (ISM) Dhanbad",
      department: "Dept of Civil Engineering & Transportation",
      matchScore: 94,
      facultyLead: "Prof. S. N. Singh",
      studentTeam: ["Arun Mahato (M.Tech)", "Karan Singh (B.Tech)"]
    },
    industryPartner: {
      name: "CCL (Central Coalfields Ltd) & NTPC Tandwa",
      tier: "Smart Corridor Installation",
      pledgedAmount: "₹33,00,000",
      contactPerson: "M. K. Agarwal (GM Environment)"
    },
    solutionSummary: "Automated RFID sensor-activated wheel-wash gates and high-pressure chemical misting arches along the transit corridor reducing ambient particulate matter by 75%.",
    trlLevel: "TRL 6 (Pilot Gate Operational at Tandwa Junction)",
    patentsFiled: "IP/JH/2026/0399H",
    milestones: [
      { title: "Traffic density & optical dust sensor deployment", completed: true, date: "2026-08-25" },
      { title: "Sensor-activated misting arch prototype commissioning", completed: true, date: "2026-09-02" },
      { title: "Expansion to 4 additional coal transit choke points", completed: false, date: "Est. 2026-10-15" }
    ],
    comments: [
      { id: "c1", author: "Prof. S. N. Singh", role: "University", text: "Misting arch activated for 840 coal trucks today. Dust opacity on highway dropped from 92% to 22%.", time: "1 day ago" }
    ]
  },
  {
    id: "JH-2026-023",
    title: "Smart Solar Cold Chain & Fruit Ripening Unit for Hazaribagh Tomatoes",
    description: "Hazaribagh produces massive surplus of high-quality tomatoes and green chillies in Katkamsandi block, but gluts crash prices to ₹2/kg during peak harvest, causing distress dumping on roads.",
    category: "Agriculture",
    districtId: "hazaribagh",
    districtName: "Hazaribagh",
    location: "Katkamsandi Block, Village Pelawal",
    latitude: 24.0123,
    longitude: 85.3456,
    severity: 4,
    urgencyScore: 81,
    status: "In Progress",
    kanbanStage: "Testing",
    submitterType: "Community Group",
    submitterName: "Hazaribagh Sabzi Utpadak Sangh",
    submittedAt: "2026-08-06",
    upvotes: 340,
    hasUpvoted: false,
    clusterId: "CLUSTER-HZB-AGR-06",
    duplicateCount: 4,
    images: ["https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Vinoba Bhave University & Birsa Agricultural Univ",
      department: "Dept of Biotechnology & Agricultural Engg",
      matchScore: 95,
      facultyLead: "Dr. K. P. Sharma",
      studentTeam: ["Nisha Verma (M.Sc)", "Anup Gupta (B.Tech)"]
    },
    industryPartner: {
      name: "ITC Agri Business & BigBasket",
      tier: "Direct Sourcing & Processing Setup",
      pledgedAmount: "₹27,00,000",
      contactPerson: "Vikram Joshi"
    },
    solutionSummary: "Solar thermal tomato puree evaporator and vacuum packaging unit enabling farmers to convert perishable produce into shelf-stable puree with 6x profit margins.",
    trlLevel: "TRL 7 (Processing 2 Tons Daily)",
    patentsFiled: "IP/JH/2026/0155T",
    milestones: [
      { title: "Solar vacuum evaporator fabrication & pasteurization testing", completed: true, date: "2026-08-18" },
      { title: "FSSAI microbial certification of packaged puree batches", completed: true, date: "2026-08-28" },
      { title: "Direct off-take contract signed with regional restaurant chains", completed: true, date: "2026-09-04" }
    ],
    comments: [
      { id: "c1", author: "Dr. K. P. Sharma", role: "University", text: "Processing unit is operating at full capacity. Puree shelf life verified for 12 months at room temperature.", time: "16 hours ago" }
    ]
  },
  {
    id: "JH-2026-024",
    title: "High-Efficiency Bio-Sand & Iron Removal Filter for Parasnath Foothills",
    description: "Handpumps in Pirtand and Dumri blocks tap high-iron ferruginous aquifers (>6.5 mg/L Fe), turning water reddish-brown and causing severe gastrointestinal ailments.",
    category: "Water",
    districtId: "giridih",
    districtName: "Giridih",
    location: "Pirtand Block, Foothills of Parasnath",
    latitude: 24.0156,
    longitude: 86.1523,
    severity: 4,
    urgencyScore: 85,
    status: "Solved",
    kanbanStage: "Submitted for Review",
    submitterType: "Gram Panchayat",
    submitterName: "Sanjay Marandi (Mukhiya, Pirtand)",
    submittedAt: "2026-07-28",
    upvotes: 385,
    hasUpvoted: true,
    clusterId: "CLUSTER-GRD-WTR-02",
    duplicateCount: 3,
    images: ["https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60"],
    assignedUniversity: {
      name: "Vinoba Bhave University & BIT Sindri",
      department: "Dept of Civil & Environmental Engineering",
      matchScore: 93,
      facultyLead: "Dr. Arunava Ghosh",
      studentTeam: ["Pradip Hansda (B.Tech)", "Rekha Soren (M.Sc)"]
    },
    industryPartner: {
      name: "Jindal Steel & Power CSR",
      tier: "Community Infrastructure Grant",
      pledgedAmount: "₹22,00,000",
      contactPerson: "Sunil Kataria"
    },
    solutionSummary: "Cascading aeration tray and graded quartz-manganese sand gravity filter lowering dissolved iron from 6.8 mg/L to < 0.2 mg/L without power consumption.",
    trlLevel: "TRL 9 (Adopted by 16 Panchayats)",
    patentsFiled: "IP/JH/2026/0062I (Granted)",
    milestones: [
      { title: "Aeration tray cascade optimization", completed: true, date: "2026-08-05" },
      { title: "Manganese dioxide sand coating protocol", completed: true, date: "2026-08-16" },
      { title: "Installation at 16 community handpump clusters", completed: true, date: "2026-08-30" },
      { title: "Full state PHE Department standard adoption", completed: true, date: "2026-09-03" }
    ],
    comments: [
      { id: "c1", author: "Dr. Arunava Ghosh", role: "University", text: "Zero iron staining reported in all 16 villages. Filter maintenance takes only 10 minutes of sand backwash weekly.", time: "2 days ago" }
    ]
  }
];

export const MOCK_STATS = {
  totalProblems: 248,
  solvedProblems: 84,
  inProgress: 112,
  underReview: 52,
  activeUniversities: 28,
  industryPartners: 42,
  patentsFiled: 19,
  csrFundsMobilized: "₹18.4 Cr",
  citizensImpacted: "4,60,000+"
};
