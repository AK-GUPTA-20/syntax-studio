export const initialProjects = [
  {
    id: "proj_greencart",
    slug: "greencart",
    title: "GreenCart — Direct Vendor E-Commerce Platform",
    shortDescription: "Full-stack e-commerce marketplace enabling local produce and dairy vendors to sell directly online with custom storefronts and vendor dashboards.",
    category: "E-commerce",
    featured: true,
    priority: 1,
    year: "2025",
    author: "Akshat Gupta",
    authorSlug: "akshat-gupta",
    coverImage: "https://images.unsplash.com/photo-1556742049-0a67e5572293?w=1000&auto=format&fit=crop&q=80",
    accentColor: "#6FCF97",
    technologies: ["React", "Node.js", "Express.js", "Firebase", "JWT", "RBAC", "Tailwind CSS"],
    overview: "GreenCart is an end-to-end digital marketplace tailored for local agricultural and dairy suppliers. It bridges the gap between rural vendors and urban consumers through optimized routing, isolated vendor inventory controls, and instant order settlements.",
    problem: "Small agricultural vendors struggled with high intermediary margins (up to 35%) and lacked technical tools to manage dynamic inventory, bulk order processing, and rapid expiration dates on fresh produce.",
    solution: "Built a high-performance MERN architecture with dedicated multi-tenant vendor panels, real-time catalog syncing, role-based access control (RBAC), and customer-facing responsive storefronts.",
    approach: "Designed a modular schema architecture with indexing across inventory queries. Integrated JWT authentication paired with OTP email verification for vendor onboarding and transactional security.",
    keyFeatures: [
      "Multi-tenant vendor dashboard for dynamic stock and price updates",
      "Consumer mobile-first shopping portal with fast cart checkout",
      "Secure JWT-based authentication with role-based permissions (Consumer, Vendor, Admin)",
      "Automated transactional notification engine for status updates",
      "Optimized database indexing cutting query response times by over 40%"
    ],
    challenges: "Handling concurrent stock deductions during peak morning demand windows without race conditions. Solved using atomic document updates and transaction-level locks.",
    results: "Empowered 20+ beta vendors with 99.8% order accuracy and sub-120ms average API response latency under load.",
    liveUrl: "https://greencart-demo.vercel.app",
    githubUrl: "https://github.com/AK-GUPTA-20/GreenCart.git"
  },
  {
    id: "proj_groweasy",
    slug: "groweasy-ai",
    title: "GrowEasy — AI CSV Data Pipeline & Importer",
    shortDescription: "Enterprise AI tool that intelligently maps messy, heterogeneous lead exports into structured CRM schemas using the Gemini LLM API.",
    category: "Web Application",
    featured: true,
    priority: 2,
    year: "2025",
    author: "Vasu Singhal",
    authorSlug: "vasu-singhal",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80",
    accentColor: "#E8A33D",
    technologies: ["Next.js", "React", "Node.js", "Express.js", "Gemini API", "Tailwind CSS", "Framer Motion"],
    overview: "GrowEasy automates the historically painful workflow of manual lead cleaning. Users drag and drop any chaotic CSV or spreadsheet file, and the platform intelligently infers, cleanses, standardizes, and normalizes columns into canonical schemas in seconds.",
    problem: "Sales operations teams were wasting an average of 4-6 hours weekly hand-formatting CSV exports from disparate marketing channels before importing them into CRMs.",
    solution: "Engineered a batched AI data pipeline utilizing structured LLM prompt schema enforcement, client-side preview tables, and fault-tolerant parsing with automatic retries.",
    approach: "Combined Next.js responsive UI with drag-and-drop file ingestion, streaming progress indicators, and an Express service running schema-mapping agents against Gemini.",
    keyFeatures: [
      "Zero-configuration drag-and-drop CSV parser handling 100k+ row datasets",
      "Gemini AI automated column mapping and fuzzy name reconciliation",
      "Interactive data preview table with in-place cell editing",
      "JSON-schema validation with automated type coercion and sanitization",
      "One-click export to HubSpot, Salesforce, and clean CSV format"
    ],
    challenges: "Minimizing token overhead when processing extensive files with unpredictable headers. Solved by sampling representative subsets for inference before running vectorized batch transforms.",
    results: "Reduced data preparation times by 85% for over 500+ processed datasets in test trials.",
    liveUrl: "https://grow-easy-lime.vercel.app/",
    githubUrl: "https://github.com/Vaasu2906"
  },
  {
    id: "proj_banking_ledger",
    slug: "banking-ledger",
    title: "Atomic Banking Ledger & Transaction Engine",
    shortDescription: "High-concurrency financial ledger engine ensuring strict write integrity, double-entry bookkeeping, and sub-millisecond audit trails.",
    category: "Systems & APIs",
    featured: true,
    priority: 3,
    year: "2025",
    author: "Vasu Singhal",
    authorSlug: "vasu-singhal",
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1000&auto=format&fit=crop&q=80",
    accentColor: "#5FC8C8",
    technologies: ["Node.js", "Express.js", "PostgreSQL", "JWT", "REST APIs", "Docker"],
    overview: "A core financial service built for fintech applications that demand zero write-discrepancies, rigorous role validation, and immutable transaction audit logs.",
    problem: "Concurrent balance deductions in distributed web systems frequently suffer from race conditions, resulting in duplicate transfers or negative balances.",
    solution: "Constructed an atomic ledger pipeline enforcing double-entry invariants, pessimistic row locking during balance transitions, and signed event ledgers.",
    approach: "Designed pure functional transaction handlers wrapped in strict ACID boundary operations with tamper-evident event streaming.",
    keyFeatures: [
      "Double-entry bookkeeping engine where debits strictly balance credits",
      "Pessimistic concurrency control preventing balance overdraws",
      "Comprehensive audit trail recording actor, IP, timestamp, and signature",
      "Granular role-level access control (Viewer, Auditor, Teller, Admin)"
    ],
    challenges: "Preventing deadlock scenarios during multi-party settlement transactions. Solved by deterministic sorting of account locks prior to execution.",
    results: "Processed 50,000 simulated concurrent transactions with zero anomalies and 100% audit log consistency.",
    liveUrl: "",
    githubUrl: "https://github.com/Vaasu2906"
  },
  {
    id: "proj_agora_debate",
    slug: "agora-debate",
    title: "Agora — Real-Time Debate & Community Hub",
    shortDescription: "Full-stack community portal for collegiate debate societies featuring live parliamentary timers, automated adjudications, and event scheduling.",
    category: "Web Application",
    featured: true,
    priority: 4,
    year: "2025",
    author: "Vasu Singhal",
    authorSlug: "vasu-singhal",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80",
    accentColor: "#9B8EC4",
    technologies: ["React", "Next.js", "Socket.io", "Express.js", "Framer Motion", "Tailwind CSS"],
    overview: "Built for ABES Engineering College's premier debating society, Agora modernizes debate management with real-time motion announcements, speaker timers, and round pairings.",
    problem: "Organizers relied on ad-hoc spreadsheets and messaging channels, leading to delays between tournament rounds and inaccurate speaker scoring.",
    solution: "Delivered an interactive platform with Socket.io real-time synchronizers, automated tab room computation, and motion releases.",
    approach: "Architected real-time WebSocket channels with Framer Motion animations for visual timer countdowns and live announcements.",
    keyFeatures: [
      "Synchronized real-time tournament timers across participant screens",
      "Automated team pairing and bracket progression engine",
      "Secure adjudicator scorecards with bcrypt session authorization",
      "Archived motions database and speaker rankings leaderboards"
    ],
    challenges: "Ensuring zero timer drift across varied network conditions. Solved with client-server monotonic timestamp synchronization protocols.",
    results: "Powered 3 campus tournaments with 200+ active participants without a single scoring delay.",
    liveUrl: "",
    githubUrl: "https://github.com/Vaasu2906"
  },
  {
    id: "proj_url_analytics",
    slug: "url-shortener-analytics",
    title: "Distributed URL Shortener & Telemetry API",
    shortDescription: "Ultra-fast URL shortening engine using custom Base62 algorithms, Redis caching, and real-time geographical traffic analytics.",
    category: "Systems & APIs",
    featured: false,
    priority: 5,
    year: "2024",
    author: "Akshat Gupta",
    authorSlug: "akshat-gupta",
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80",
    accentColor: "#EF6E6E",
    technologies: ["Node.js", "Express.js", "Redis", "Docker", "REST API", "Tailwind CSS"],
    overview: "A carrier-grade URL redirection service engineered for sub-10ms redirection latency and real-time ingestion of visitor analytics, geo-IP coordinates, and device metrics.",
    problem: "Standard link redirectors often introduce 150-300ms latency overhead and fail to provide actionable real-time campaign insights.",
    solution: "Implemented an in-memory Redis caching layer with write-behind persistence, Base62 collision-free ID hashing, and asynchronous click-stream logging.",
    approach: "Decoupled the redirect hot-path from the analytics ingestion pipeline, ensuring immediate 301/302 redirects while pushing visitor logs to asynchronous worker queues.",
    keyFeatures: [
      "Custom Base62 encoding generating compact 7-character vanity keys",
      "Redis memory-cache layer slashing redirect latency by 85%",
      "Geo-analytics dashboard tracking countries, referring domains, and browser user-agents",
      "Docker containerized microservice ready for Kubernetes clustering"
    ],
    challenges: "Handling viral traffic spikes without database connection exhaustion. Mitigated using Redis read-replicas and connection pooling.",
    results: "Achieved sustained throughput of 8,500 requests/second with a p99 latency under 12ms.",
    liveUrl: "",
    githubUrl: "https://github.com/AK-GUPTA-20"
  },
  {
    id: "proj_enquiry_system",
    slug: "enquiry-system",
    title: "Enterprise Enquiry Lifecycle Management",
    shortDescription: "B2B customer inquiry tracking platform featuring automated triage, SLA countdowns, and server-side validation pipelines.",
    category: "Business Website",
    featured: false,
    priority: 6,
    year: "2025",
    author: "Akshat Gupta",
    authorSlug: "akshat-gupta",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80",
    accentColor: "#E8A33D",
    technologies: ["React", "Node.js", "Express.js", "REST APIs", "Tailwind CSS"],
    overview: "A central operational tool engineered to streamline corporate customer lead intake, team assignment, communication histories, and status resolution.",
    problem: "Sales inquiries were scattered across email inboxes and chat tools, leading to missed client opportunities and poor response times.",
    solution: "Crafted a unified web desk with role-based routing, instant lead prioritization, and comprehensive response analytics.",
    approach: "Implemented server-side schema sanitation, granular REST endpoints for status lifecycle mutations, and responsive dashboard UI.",
    keyFeatures: [
      "Dynamic multi-stage lead lifecycle (New, Assigned, Contacted, Converted, Closed)",
      "Strict input sanitization preventing XSS and injection vulnerabilities",
      "Activity changelog tracking all internal note edits and status progressions",
      "Exportable reporting for weekly resolution metrics"
    ],
    challenges: "Building an intuitive, high-density table view that renders smoothly on mobile devices for field managers.",
    results: "Accelerated median lead response speed from 18 hours down to under 45 minutes.",
    liveUrl: "",
    githubUrl: "https://github.com/AK-GUPTA-20"
  },
  {
    id: "proj_disease_predictor",
    slug: "ml-disease-predictor",
    title: "ML Multiple Clinical Disease Diagnostic System",
    shortDescription: "Machine learning clinical intelligence platform predicting Diabetes, Heart Disease, and Parkinson's with SVM and Random Forest models.",
    category: "AI & Machine Learning",
    featured: false,
    priority: 7,
    year: "2025",
    author: "Akshat Gupta",
    authorSlug: "akshat-gupta",
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80",
    accentColor: "#5FC8C8",
    technologies: ["Python", "Scikit-Learn", "Streamlit", "Pandas", "NumPy", "Data Science"],
    overview: "An interactive clinical diagnostic tool allowing healthcare workers to submit patient biometrics and receive immediate disease risk assessments with confidence intervals.",
    problem: "Early-stage diagnostics in rural health clinics are hindered by lack of immediate specialist consultation.",
    solution: "Trained and cross-validated statistical classifiers on verified medical repositories to offer fast probabilistic triage support.",
    approach: "Cleaned and normalized multi-dimensional health datasets with custom imputation pipelines before training optimized Support Vector Machines (SVM).",
    keyFeatures: [
      "Multi-model inference engine covering Diabetes, Heart Disease, and Parkinson's",
      "Visual probability confidence bars explaining risk levels",
      "Robust data scaling mitigating distorted outliers"
    ],
    challenges: "Handling sparse patient records with missing laboratory parameters without compromising diagnostic recall.",
    results: "Achieved >91% accuracy across test sets with near-zero latency inference.",
    liveUrl: "",
    githubUrl: "https://github.com/AK-GUPTA-20"
  },
  {
    id: "proj_multithread_downloader",
    slug: "multithreaded-downloader",
    title: "High-Throughput Concurrent Downloader in Java",
    shortDescription: "Multi-worker CLI downloading utility that partitions remote files across concurrent threads using HTTP Range headers.",
    category: "Systems & APIs",
    featured: false,
    priority: 8,
    year: "2025",
    author: "Akshat Gupta",
    authorSlug: "akshat-gupta",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80",
    accentColor: "#EF6E6E",
    technologies: ["Java", "Concurrency", "Multithreading", "HTTP Client", "CLI"],
    overview: "A systems utility designed to maximize network bandwidth saturation by chunking large binary assets across independent worker pools.",
    problem: "Single-stream HTTP file transfers frequently stall on high-latency connections, leaving available client bandwidth severely underutilized.",
    solution: "Engineered an asynchronous worker pool that computes byte-range offsets, concurrently streams parts, and reassembles them with checksum verification.",
    approach: "Employed Java's Concurrent package (`CountDownLatch`, thread-safe queues, and synchronized byte buffers) for deterministic assembly.",
    keyFeatures: [
      "Dynamic chunk partitioning tailored to content length and worker thread count",
      "Real-time terminal progress indicators tracking byte velocity per thread",
      "Automatic chunk retry on socket timeout without restarting whole file",
      "MD5/SHA256 checksum verification validating file integrity"
    ],
    challenges: "Preventing file corruption during concurrent block writes. Addressed with random access file pointers locked by chunk index.",
    results: "Reduced transfer duration by 2.8x on connections with artificial packet jitter.",
    liveUrl: "",
    githubUrl: "https://github.com/AK-GUPTA-20"
  }
];

export const initialTeamMembers = [
  {
    id: "member_akshat",
    slug: "akshat-gupta",
    name: "Akshat Gupta",
    role: "Co-Founder & Lead Backend Architect",
    specialty: "REST API Design, Database Architecture & Systems Engineering",
    profileImage: "https://akshat-portfolio-tau.vercel.app/images/image2.png",
    bio: "Fourth-year B.Tech CSE student specializing in Data Science at Galgotias University (8.9 CGPA). Architect of high-throughput backend services, secure REST APIs, and database-driven systems. Has solved 400+ DSA problems with a passion for clean system design, concurrency, and rock-solid write integrity.",
    shortBio: "Specialist in RESTful architecture, database indexing, and backend security. Solved 400+ DSA problems with an 8.9 CGPA.",
    quote: "Good backend architecture isn't just about moving data; it's about guaranteeing correctness, security, and low latency under pressure.",
    stats: [
      { label: "DSA Problems Solved", value: 400, suffix: "+" },
      { label: "Projects Built", value: 7, suffix: "+" },
      { label: "B.Tech CGPA", value: "8.9", suffix: "/10" },
      { label: "Years of Engineering", value: 2, suffix: "+" }
    ],
    education: {
      degree: "B.Tech in Computer Science & Engineering (Specialization: Data Science)",
      institution: "Galgotias University",
      duration: "2022 — 2026",
      score: "CGPA: 8.9 / 10.0"
    },
    skills: [
      { category: "Languages", items: ["Java", "Python", "JavaScript (ES6+)", "SQL"] },
      { category: "Backend Architecture", items: ["Node.js", "Express.js", "REST API Design", "JWT Auth", "RBAC", "Middleware Design"] },
      { category: "Databases & Storage", items: ["Firebase Firestore", "MongoDB", "MySQL", "Redis (Caching)"] },
      { category: "Systems & Tools", items: ["Git", "GitHub", "Postman", "Docker", "VS Code", "Linux CLI"] },
      { category: "Core Computer Science", items: ["Data Structures & Algorithms", "OOP", "DBMS", "Operating Systems", "Concurrency"] }
    ],
    rolesTypewriter: [
      "Backend Developer",
      "REST API Designer",
      "MERN Stack Engineer",
      "Systems Architect",
      "DSA Problem Solver"
    ],
    journey: [
      {
        year: "2025",
        title: "Advanced System Design & Scalable APIs",
        description: "Built GreenCart's multi-tenant architecture, Redis caching layers, and high-concurrency Java downloaders."
      },
      {
        year: "2024",
        title: "MERN Stack Mastery & 400+ DSA Milestones",
        description: "Intensive algorithmic problem solving across LeetCode; architected RESTful enterprise management systems."
      },
      {
        year: "2023",
        title: "Computer Science Foundations & OOP",
        description: "Specialized coursework at Galgotias University in Data Structures, Database Systems, and Object-Oriented Programming."
      }
    ],
    contact: {
      email: "guptaakshat7795@gmail.com",
      phone: "+91 9027278481",
      location: "Saharanpur, Uttar Pradesh, India",
      github: "https://github.com/AK-GUPTA-20",
      linkedin: "https://www.linkedin.com/in/akshat-gupta-243460280",
      codolio: "https://codolio.com/profile/user_akshat",
      resumeUrl: "https://drive.google.com/file/d/1lYUvqTV6xanWVTw6aYJiQLy46A4hGns7/view?usp=sharing"
    }
  },
  {
    id: "member_vasu",
    slug: "vasu-singhal",
    name: "Vasu Singhal",
    role: "Co-Founder & Lead Full-Stack / UI-UX Engineer",
    specialty: "Interactive Frontend, Modern React/Next.js & Resilient Full-Stack Systems",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80",
    bio: "Full-stack developer studying Information Technology at ABES Engineering College (8.1 CGPA). Bridges aesthetic frontend design with resilient backend engines. Maintains a 1650+ contest rating on LeetCode with 450+ solved algorithmic challenges, and has led development across two 36-hour hackathons.",
    shortBio: "Crafts animated, ultra-responsive web experiences with Next.js, Framer Motion, and resilient backend pipelines.",
    quote: "A great product must look effortless to the user while having unbreakable engineering underneath.",
    stats: [
      { label: "LeetCode Contest Rating", value: 1650, suffix: "+" },
      { label: "DSA Problems Solved", value: 450, suffix: "+" },
      { label: "B.Tech CGPA", value: "8.1", suffix: "/10" },
      { label: "Hackathons Led", value: 2, suffix: "x" }
    ],
    education: {
      degree: "B.Tech in Information Technology",
      institution: "ABES Engineering College, Ghaziabad",
      duration: "2023 — 2027",
      score: "CGPA: 8.1 / 10.0"
    },
    skills: [
      { category: "Frontend & UI/UX", items: ["React.js", "Next.js", "Tailwind CSS", "Framer Motion", "HTML5/CSS3", "Responsive Design"] },
      { category: "Backend & Real-time", items: ["Node.js", "Express.js", "Socket.io", "REST APIs", "Bcrypt", "JWT Sessions"] },
      { category: "Languages & Core", items: ["C++", "JavaScript", "TypeScript", "DSA", "Object Oriented Design"] },
      { category: "Databases & AI", items: ["Firebase Firestore", "MongoDB", "PostgreSQL", "Gemini API Integration"] },
      { category: "Developer Tools", items: ["Git", "GitHub", "Postman", "Vite", "Linux"] }
    ],
    rolesTypewriter: [
      "Full-Stack Developer",
      "UI/UX Design Engineer",
      "React & Next.js Specialist",
      "Competitive Programmer",
      "AI Pipeline Builder"
    ],
    journey: [
      {
        year: "2025",
        title: "AI Integration & Financial Ledgers",
        description: "Built the GrowEasy AI CSV pipeline with Gemini and designed atomic double-entry banking ledger systems."
      },
      {
        year: "2024",
        title: "Collegiate Debating Platform & Hackathons",
        description: "Created the Agora real-time debate portal with WebSockets; captained two teams to victory in 36-hour sprints."
      },
      {
        year: "2023",
        title: "Competitive Programming & Web Core",
        description: "Achieved top percentiles in LeetCode contests and established deep foundations in C++, algorithms, and React."
      }
    ],
    contact: {
      email: "vasu.singhal@example.com",
      phone: "+91 7017641954",
      location: "Ghaziabad, Uttar Pradesh, India",
      github: "https://github.com/Vaasu2906",
      linkedin: "https://www.linkedin.com/in/vasu-singhal-9603142a3/",
      leetcode: "https://leetcode.com/u/vasusinghal29/",
      resumeUrl: "#"
    }
  }
];

export const initialServices = [
  {
    id: "srv_web_design",
    order: 1,
    code: "01",
    title: "Bespoke Website Design",
    shortDescription: "Custom, human-crafted web designs that express your brand's unique identity without cookie-cutter templates.",
    overview: "We design websites that convert visitors into loyal clients. Every layout, typography decision, and color accent is engineered for readability, visual impact, and intuitive user journeys.",
    problemsSolved: [
      "Generic templates that make your business look like everyone else",
      "Cluttered interfaces confusing prospective clients",
      "Lack of mobile polish driving away smartphone customers"
    ],
    deliverables: [
      "Figma design system & interactive prototypes",
      "Responsive typography and bespoke color hierarchy",
      "Desktop, tablet, and mobile UI specifications",
      "Custom iconography and micro-interaction guides"
    ],
    technologies: ["Figma", "Tailwind CSS", "CSS Variables", "Modern Typography", "Design Systems"],
    typicalTimeline: "1–2 Weeks"
  },
  {
    id: "srv_fullstack_dev",
    order: 2,
    code: "02",
    title: "Full-Stack Web Development",
    shortDescription: "End-to-end web applications built with modern React, Node.js, Express, and resilient cloud architectures.",
    overview: "From interactive client-side SPAs to scalable backend REST APIs, we build seamless digital products that scale smoothly as your business grows.",
    problemsSolved: [
      "Fragile monolithic codebases that break upon new feature release",
      "Slow page load times degrading SEO and search engine ranking",
      "Disjointed communication between separate frontend and backend contractors"
    ],
    deliverables: [
      "Clean, modular React/Next.js frontend codebase",
      "Robust Node.js & Express RESTful API backend",
      "Database schema modeling with indexing and validation",
      "Automated CI/CD pipelines & production hosting deployment"
    ],
    technologies: ["React", "Next.js", "Node.js", "Express.js", "Firebase", "PostgreSQL", "Tailwind CSS"],
    typicalTimeline: "2–4 Weeks"
  },
  {
    id: "srv_ecommerce",
    order: 3,
    code: "03",
    title: "E-Commerce Development",
    shortDescription: "High-conversion online stores with lightning-fast catalog search, secure payment gateways, and inventory controls.",
    overview: "We construct custom e-commerce experiences tailored to your sales funnel — eliminating the transaction fees and performance penalties of bloated off-the-shelf platforms.",
    problemsSolved: [
      "Abandoned shopping carts caused by sluggish checkout pages",
      "Inability to handle custom vendor workflows or wholesale pricing tiers",
      "High third-party plugin subscription costs"
    ],
    deliverables: [
      "Fast product catalog with faceted instant search",
      "Stripe, PayPal, or UPI payment gateway integrations",
      "Vendor and administrator order management consoles",
      "Transactional email and SMS order updates"
    ],
    technologies: ["React", "Express.js", "Stripe API", "Firebase Firestore", "Webhooks"],
    typicalTimeline: "3–5 Weeks"
  },
  {
    id: "srv_business_sites",
    order: 4,
    code: "04",
    title: "High-Impact Business Websites",
    shortDescription: "Polished corporate and startup web presence built to generate leads, build trust, and showcase authority.",
    overview: "Your website is your company's most important salesperson. We build fast, accessible business sites that present your services clearly and drive qualified inquiries directly into your pipeline.",
    problemsSolved: [
      "Outdated sites that fail to represent your team's actual capability",
      "Poor search engine rankings due to bad technical SEO",
      "Difficulty updating content without hiring costly maintenance contractors"
    ],
    deliverables: [
      "High-converting landing pages and service directories",
      "Integrated contact inquiry capture with instant email alerts",
      "Comprehensive on-page technical SEO, OpenGraph tags, and sitemaps",
      "Intuitive admin control portal to manage updates without touching code"
    ],
    technologies: ["React", "Tailwind CSS", "Express API", "Framer Motion", "SEO Meta"],
    typicalTimeline: "1–3 Weeks"
  },
  {
    id: "srv_web_apps",
    order: 5,
    code: "05",
    title: "Custom Web Applications & SaaS",
    shortDescription: "Complex browser-based software, internal dashboards, portals, and SaaS minimum viable products (MVPs).",
    overview: "We turn complex business operations into straightforward, automated web applications. Whether you need a client portal, an AI data tool, or a multi-tenant SaaS, we ship production-ready code.",
    problemsSolved: [
      "Spreadsheets and manual processes causing human error",
      "Lengthy development cycles stalling product validation",
      "Unreliable data validation leading to corrupted records"
    ],
    deliverables: [
      "Full user authentication with RBAC and session security",
      "Interactive data grids, charts, and real-time dashboards",
      "Background task workers and third-party API webhooks",
      "Comprehensive test coverage and API documentation"
    ],
    technologies: ["React", "Express.js", "WebSockets", "Firebase", "Redis", "Docker"],
    typicalTimeline: "3–6 Weeks"
  },
  {
    id: "srv_redesign",
    order: 6,
    code: "06",
    title: "Website Modernization & Redesign",
    shortDescription: "Transform dated, slow websites into fast, modern, mobile-first web platforms with zero loss in search rank.",
    overview: "We breathe new life into legacy digital assets, upgrading typography, aesthetic polish, Core Web Vitals, and underlying frameworks without disrupting your active business operations.",
    problemsSolved: [
      "Embarrassing 5-year-old designs that damage business credibility",
      "Terrible mobile user experience driving bounce rates above 70%",
      "Security vulnerabilities from unpatched legacy CMS platforms"
    ],
    deliverables: [
      "Modern UI revamp with contemporary engineering aesthetic",
      "Migration from outdated CMS to lightweight modern stacks",
      "Core Web Vitals optimization targeting 95+ PageSpeed scores",
      "301 redirect mapping to preserve existing search rankings"
    ],
    technologies: ["Vite", "React", "Tailwind CSS", "Semantic HTML", "Lighthouse"],
    typicalTimeline: "1–3 Weeks"
  },
  {
    id: "srv_api_backend",
    order: 7,
    code: "07",
    title: "API & Backend Architecture",
    shortDescription: "High-throughput RESTful APIs, database schema design, indexing, authentication, and secure cloud microservices.",
    overview: "The engine behind great digital experiences. We design, build, and optimize backend architectures that process millions of records with sub-millisecond reliability.",
    problemsSolved: [
      "Unoptimized database queries freezing server instances under load",
      "Insecure endpoints exposed to authentication bypass and data leakage",
      "Chaotic API specifications that make frontend integration agonizing"
    ],
    deliverables: [
      "Documented RESTful API endpoints with Swagger/Postman specs",
      "Normalized or optimized NoSQL schemas with indexing strategies",
      "JWT and OAuth 2.0 authentication with role enforcement",
      "Automated rate limiting, CORS controls, and security headers"
    ],
    technologies: ["Node.js", "Express.js", "Firebase Admin", "PostgreSQL", "Redis", "JWT"],
    typicalTimeline: "2–4 Weeks"
  },
  {
    id: "srv_maintenance",
    order: 8,
    code: "08",
    title: "Ongoing Performance & Maintenance",
    shortDescription: "Continuous uptime monitoring, security patching, dependency upgrades, and iterative feature enhancements.",
    overview: "A great website is never finished; it evolves. We partner with companies on ongoing retainers to guarantee 99.9% uptime, security updates, and rapid turnaround on new feature requests.",
    problemsSolved: [
      "Websites silently crashing without team awareness",
      "Dependency vulnerabilities leaving user data exposed",
      "Slow turnaround times when minor copy or project updates are needed"
    ],
    deliverables: [
      "24/7 uptime and error monitoring with automated alerts",
      "Monthly security reviews and dependency updates",
      "Guaranteed priority SLAs for urgent hotfixes",
      "Continuous performance auditing and database backups"
    ],
    technologies: ["Cloud Monitoring", "GitHub Actions", "Firebase Backups", "Sentry"],
    typicalTimeline: "Monthly Retainer"
  }
];

export const initialTestimonials = [
  {
    id: "tst_1",
    clientName: "David Sterling",
    role: "Founder & CEO",
    company: "Aura Logistics (Beta Client)",
    avatar: "/images/testimonials/avatar1.png",
    content: "Working with Akshat and Vasu felt like having an elite engineering team in-house. They completely rebuilt our fleet dispatch dashboard from scratch, cutting our latency from 800ms down to near instant. Truly exceptional engineering.",
    rating: 5,
    projectRef: "Fleet Telemetry Hub",
    verified: true,
    isSample: true
  },
  {
    id: "tst_2",
    clientName: "Elena Rostova",
    role: "Head of Product",
    company: "Veritas Debate Association (ABES)",
    avatar: "/images/testimonials/avatar2.png",
    content: "Vasu delivered our tournament platform ahead of deadline and with zero bugs during tournament day. The synchronized timer and realtime WebSocket pairings saved us countless hours of manual work.",
    rating: 5,
    projectRef: "Agora Debate Society",
    verified: true,
    isSample: true
  },
  {
    id: "tst_3",
    clientName: "Priya Sharma",
    role: "Operations Lead",
    company: "FreshFields Supply",
    avatar: "/images/testimonials/avatar3.png",
    content: "Akshat designed our vendor catalog API with bulletproof role controls. Even during morning demand surges, our vendors experienced 100% uptime and smooth order reconciliation. Highly recommended!",
    rating: 5,
    projectRef: "GreenCart Vendor Platform",
    verified: true,
    isSample: true
  }
];

export const initialBlogPosts = [
  {
    id: "post_1",
    slug: "engineering-double-entry-banking-ledgers",
    title: "Engineering Atomic Double-Entry Ledgers in Node.js",
    excerpt: "How we prevent balance race conditions and ensure zero financial write discrepancies in concurrent distributed web architectures.",
    content: "In high-throughput transactional systems, traditional database updates can easily introduce discrepancies under concurrent execution. In this article, we break down our approach to pessimistic row locks, double-entry balancing invariants, and deterministic deadlock avoidance...",
    author: "Vasu Singhal",
    date: "Sep 2025",
    readTime: "6 min read",
    tags: ["Backend", "Node.js", "PostgreSQL", "Fintech"]
  },
  {
    id: "post_2",
    slug: "rest-api-indexing-strategies-for-scale",
    title: "Database Indexing & Schema Design for High-Throughput REST APIs",
    excerpt: "Deep dive into query planning, compound indexes, and latency profiling that shaved 40% off response times.",
    content: "When designing REST endpoints, database schema decisions dictate your upper performance bound. We explore B-Tree indexing, covered queries, and when caching with Redis becomes essential...",
    author: "Akshat Gupta",
    date: "Aug 2025",
    readTime: "8 min read",
    tags: ["Databases", "REST API", "Performance", "Redis"]
  }
];

export const initialAgencySettings = {
  companyName: "Syntax Studio",
  tagline: "We build websites that move businesses forward.",
  subtagline: "From technical strategy and custom UI/UX design to high-throughput backend systems and cloud deployment, we craft fast, modern digital experiences for ambitious companies.",
  heroAnnouncement: "2-person engineering studio • Galgotias & ABES co-founders",
  founders: ["Akshat Gupta", "Vasu Singhal"],
  establishedYear: "2024",
  contactEmail: "guptaakshat7795@gmail.com",
  contactPhone: "+91 9027278481",
  location: "Uttar Pradesh & National (Remote Worldwide)",
  promoCode: "syntaxStudio",
  discountPercentage: 10,
  discountLabel: "10% Special Studio Discount",
  promoDescription: "Enter code syntaxStudio in the project inquiry form to apply 10% off the project scope.",
  promoActive: true,
  stats: [
    { value: "850+", label: "DSA Problems Solved" },
    { value: "100%", label: "Custom Hand-Coded" },
    { value: "<100ms", label: "Average API Latency" }
  ],
  technologies: [
    { name: "React", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Express.js", category: "Backend" },
    { name: "Firebase", category: "Cloud Database" },
    { name: "PostgreSQL", category: "Relational DB" },
    { name: "Next.js", category: "Full-Stack" },
    { name: "TypeScript", category: "Language" },
    { name: "JavaScript", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Framer Motion", category: "Animation" },
    { name: "Redis", category: "Caching" },
    { name: "Docker", category: "DevOps" },
    { name: "Git & GitHub", category: "Version Control" },
    { name: "Figma", category: "UI/UX" }
  ],
  capabilitiesBadge: "// Capabilities",
  capabilitiesTitle: "Full-cycle web engineering capabilities.",
  capabilitiesSubtitle: "We cover the entire product lifecycle — combining systems programming discipline with modern frontend craftsmanship.",
  capabilities: [
    { id: "cap_1", title: "Full-Stack Development", desc: "End-to-end applications from front to back with zero data mismatches.", priority: 1 },
    { id: "cap_2", title: "Bespoke Web Design", desc: "Modern, human-crafted interfaces that elevate brand authority.", priority: 2 },
    { id: "cap_3", title: "High-Performance APIs", desc: "Low-latency RESTful microservices and resilient architectures.", priority: 3 },
    { id: "cap_4", title: "E-Commerce Architecture", desc: "Custom stores with instant catalogs, cart state, and payment webhooks.", priority: 4 },
    { id: "cap_5", title: "Web Applications & SaaS", desc: "Interactive dashboards, portals, and MVPs designed for rapid scale.", priority: 5 },
    { id: "cap_6", title: "Database Optimization", desc: "Schema design, indexing, and caching reducing response times by up to 85%.", priority: 6 },
    { id: "cap_7", title: "AI & Data Pipelines", desc: "Structured LLM workflow integrations, batch parsers, and automation.", priority: 7 },
    { id: "cap_8", title: "Continuous Maintenance", desc: "Proactive uptime monitoring, security audits, and guaranteed turnaround SLAs.", priority: 8 }
  ],
  // Homepage & General Section Badges/Titles
  featuredProjectsBadge: "// Featured Projects",
  featuredProjectsTitle: "Work engineered to deliver results.",
  servicesSectionBadge: "// What We Do",
  servicesSectionTitle: "Comprehensive web development services.",
  servicesSectionSubtitle: "Whether you need a brand-new website from scratch or a high-traffic backend overhauled, we handle the engineering.",
  teamSectionBadge: "// The Studio Founders",
  teamSectionTitle: "Two dedicated engineers. One unified studio.",
  teamSectionSubtitle: "We don't outsource your project to junior contractors. You communicate directly with the two engineers writing your code.",
  techSectionBadge: "// Technology Arsenal",
  techSectionTitle: "Modern, battle-tested tools. Zero obsolete bloat.",
  techSectionSubtitle: "We intentionally build on Firebase, PostgreSQL, React, and Node.js for predictable performance, airtight security, and cloud scalability.",
  testimonialsSectionBadge: "// Client Feedback",
  testimonialsSectionTitle: "What collaborators say about working with us.",
  testimonialsSectionSubtitle: "Feedback from beta trials, campus organizations, and project collaborations.",
  ctaBadge: "// Ready To Build?",

  // About Page
  aboutBadge: "// Our Story & Philosophy",
  aboutStoryTitle: "The Studio Story",
  aboutStory: "Syntax Studio was founded by Akshat Gupta (Galgotias University CSE, Data Science) and Vasu Singhal (ABES Engineering College IT) who met through their shared obsession with full-stack software development and competitive programming.\n\nBetween them, they have solved over 850+ algorithmic problems across LeetCode, CodeChef, and collegiate hackathons, while building production systems ranging from atomic banking ledgers to vendor e-commerce platforms.\n\nThey noticed a major pain point in the web development industry: businesses were forced to choose between bloated agency firms charging exorbitant fees for junior-level work, or low-cost freelancers building fragile templates that break the moment traffic spikes.\n\nSyntax Studio was established to offer the ideal alternative: a lean, highly technical 2-person studio where founders communicate directly with clients and write every line of production code.",
  primaryStack: "React, Node, Express, Firebase",
  academicCenters: "Galgotias & ABES Colleges",
  principlesBadge: "// Principles",
  principlesTitle: "What We Believe",
  meetFoundersTitle: "Meet Akshat Gupta & Vasu Singhal",
  meetFoundersSubtitle: "Read each founder's personal journey, inspect individual projects, and view their GitHub contributions.",

  // Services Page
  servicesPageBadge: "// Full-Cycle Engineering Services",
  servicesPageTitle: "Services Designed for Scale & Reliability",
  servicesPageSubtitle: "From high-performance frontend interfaces to high-throughput backend APIs, we engineer custom web software that solves real business problems.",
  faqBadge: "// FAQ",
  faqTitle: "Frequently Asked Questions",

  // Team Page
  teamPageBadge: "// The Engineers Behind Syntax Studio",
  teamPageTitle: "Meet the Founders & Core Engineers",
  teamPageSubtitle: "We are a tight-knit 2-person studio. When you work with us, you speak directly with the engineers architecting your database and designing your UI. No account managers, no junior subcontractors, no miscommunication.",
  advantageBadge: "// The 2-Person Advantage",
  advantageTitle: "Why Working Directly With Founders Wins",
  advantageSubtitle: "Large agencies bill for layers of middle management. We deliver code.",
  teamCtaTitle: "Want to discuss a project with the founders?",
  teamCtaSubtitle: "Schedule an introductory technical discovery session to review your scope.",

  // Contact Page
  contactBadge: "// Start a Conversation",
  contactTitle: "Let's Build Something Exceptional",
  contactSubtitle: "Tell us about your project requirements, timeline, and goals. We review inquiries directly and respond with technical insights and an estimated scope within 24 hours.",
  contactFormTitle: "Project Inquiry Form",
  commitmentsBadge: "// Our Commitment",
  commitments: [
    "Response guaranteed within 24 hours",
    "Strict confidentiality & NDA compliant",
    "Direct technical consultation with founders"
  ],

  // Footer & Branding
  brandSubtitle: "2-person agency",
  footerTechStack: "Built with React + Tailwind + Express + Firebase • Zero generic templates",
  values: [
    {
      title: "Zero Template Bloat",
      desc: "Every line of CSS, component code, and backend handler is intentionally crafted. No 50MB theme bundles slowing down your customers."
    },
    {
      title: "Algorithmic Rigor",
      desc: "With 850+ DSA problems solved between both founders, we apply computer science fundamentals to database indexing, write integrity, and latency reduction."
    },
    {
      title: "Direct Founder Access",
      desc: "You always communicate directly with the software engineers writing your code. Zero layers of account managers or junior interns."
    },
    {
      title: "Production-Grade Security",
      desc: "Input sanitization, helmet headers, strict CORS, rate limiting, and role-based access control are baseline standards on every build."
    }
  ],
  faqs: [
    {
      q: "How does working with a 2-person studio differ from a traditional agency?",
      a: "Traditional agencies bill for account managers, sales reps, and overhead, often handing actual coding off to junior contractors. At Syntax Studio, you collaborate directly with founders Akshat Gupta & Vasu Singhal from architecture to deployment."
    },
    {
      q: "What is your typical project timeline?",
      a: "Landing pages and corporate business websites typically take 1 to 2 weeks. Full-scale web applications, custom e-commerce stores, and complex REST backends typically take 3 to 5 weeks with weekly milestone demos."
    },
    {
      q: "Why do you use Firebase & PostgreSQL instead of generic shared hosting?",
      a: "We choose technologies that provide sub-second query performance, automated zero-downtime backups, and predictable cloud scaling without security vulnerabilities."
    },
    {
      q: "Do you offer post-launch maintenance and support?",
      a: "Yes. We offer monthly engineering retainers covering 24/7 uptime monitoring, security patching, dependency upgrades, and rapid feature iterations."
    }
  ],
  ctaTitle: "Have an ambitious project in mind?",
  ctaDescription: "Let's discuss architecture, timelines, and technical requirements. Direct founder communication, zero agency runaround.",
  advantages: [
    {
      title: "Direct Technical Line",
      desc: "Every design decision and architectural choice is discussed directly with Akshat and Vasu. Zero translation losses."
    },
    {
      title: "Algorithmic Discipline",
      desc: "With 850+ combined DSA problems solved across LeetCode, we engineer for efficiency, edge-case safety, and clean complexity."
    },
    {
      title: "Complete Accountability",
      desc: "Our reputations are directly tied to the performance and uptime of the systems we deliver. We stand behind our work."
    }
  ]
};

