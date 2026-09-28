# Syntax Studio — Full-Stack Web Development Agency Platform

> Production-quality, high-performance digital agency platform built for a 2-person engineering studio founded by **Akshat Gupta** (Backend & Systems Architect) and **Vasu Singhal** (Full-Stack & UI/UX Engineer).

Built using the exact dark theme, color palette, and typography from `akshat-portfolio`:
* **Display Font**: Space Grotesk
* **Body Font**: Inter
* **Code / Terminal / Accent Font**: JetBrains Mono
* **Palette**: `#0B0F14` (ink), `#121821` (surface), `#1A2230` (surface2), `#26303F` (border), `#E8EDF2` (text), `#8A97A8` (muted), `#E8A33D` (amber), `#5FC8C8` (cyan), `#6FCF97` (green).

---

## 🚀 Key Highlights & Features

1. **Bespoke Agency Homepage (`/`)**:
   * Hero section with an interactive terminal runner.
   * Trust and capabilities matrix.
   * Dynamic featured case studies carousel.
   * 8 core services breakdown.
   * 6-stage engineering workflow (`01 Discover`, `02 Plan`, `03 Design`, `04 Develop`, `05 Test`, `06 Launch`).
   * Founder preview cards with live status indicators.
   * Real-world technology arsenal (Firebase, React, Node, Express, PostgreSQL, Redis, Docker).
   * Verified demo testimonials.
   * High-conversion project inquiry CTA banner.

2. **Project Case Studies & Filtering (`/projects` & `/projects/:slug`)**:
   * Filter by category: E-commerce, Web Application, Systems & APIs, Business Website, AI & Machine Learning.
   * Live search by technology or keyword.
   * In-depth case studies detailing problem statement, architectural solution, approach, key features, challenges, and measurable results.

3. **Co-Founders & Dedicated Personal Portfolios (`/team` & `/team/:slug`)**:
   * **Akshat Gupta (`/team/akshat-gupta`)**: Galgotias University CSE (8.9 CGPA), 400+ DSA problems solved, typewriter hero roles, systems & API projects (GreenCart, URL Shortener, ML Disease Predictor, Java Multithreaded Downloader).
   * **Vasu Singhal (`/team/vasu-singhal`)**: ABES Engineering College IT (8.1 CGPA), 1650+ LeetCode rating, 450+ DSA problems solved, 2x hackathon lead, full-stack projects (GrowEasy AI CSV Importer, Banking Ledger, Agora Debate Platform).

4. **Agency Services Catalog (`/services`)**:
   * 8 comprehensive services with solved problems, deliverables, timeline estimates, and inquiry links.
   * Interactive FAQ section.

5. **About Studio (`/about`)**:
   * The founding story, core engineering principles, and transparency standards.

6. **Secure Project Inquiry Gateway (`/contact`)**:
   * Direct contact form with client-side & server-side validation.
   * IP-based rate limiting (`express-rate-limit`).
   * Input sanitization preventing injection and XSS.
   * Real-time submission confirmation.

7. **Protected Admin Management Console (`/admin`)**:
   * Password and token-secured administrative interface.
   * Manage incoming client inquiries (read, replied, unread, delete).
   * Create, update, and delete project case studies.
   * Review team credentials and services.

---

## 🛠 Tech Stack

### Frontend
* **React 18** with **Vite**
* **Tailwind CSS** with custom design tokens
* **Framer Motion** for subtle motion & transitions
* **Lucide React** for icons
* **React Router DOM (v6)** for SPA routing

### Backend
* **Node.js** with **Express.js (ES Modules)**
* **Firebase Admin SDK** for Cloud Firestore
* **In-Memory Mock Firestore Engine** for zero-config local development
* **Helmet** for HTTP security headers
* **CORS** with configurable origins
* **Express Rate Limit** to mitigate brute force & spam
* **Express Validator** for strict request schema enforcement

---

## 📂 Project Architecture

```
syntax-studio/
├── package.json              # Root script runner (concurrently)
├── README.md                 # Full documentation
├── .gitignore                # Production ignore patterns
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── .env.example
│   ├── src/
│   │   ├── app.js            # Express app, helmet, cors, rate-limit, routers
│   │   ├── server.js         # Server bootstrap
│   │   ├── config/           # Environment loader (env.js)
│   │   ├── firebase/         # Firebase Admin SDK & fallback mock engine
│   │   ├── controllers/      # Projects, Team, Services, Testimonials, Contact, Auth
│   │   ├── middleware/       # Auth, ErrorHandler, RateLimiter
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Firestore service layer
│   │   ├── utils/            # ApiResponse, Sanitize, SeedData
│   │   └── validators/       # Input schemas (Contact, Projects)
└── frontend/
    ├── package.json
    ├── vite.config.js        # Vite config with /api proxy to port 5000
    ├── tailwind.config.js    # Design tokens & color palette
    ├── index.html            # Space Grotesk, Inter, JetBrains Mono
    ├── src/
    │   ├── App.jsx           # Main routing layout
    │   ├── main.jsx          # Entry point
    │   ├── index.css         # Dot-grid, scrollbar, animations
    │   ├── api/client.js     # REST API client
    │   ├── components/       # Navbar, Footer, ProjectCard, ServiceCard, TeamCard, TerminalBox
    │   └── pages/            # Home, Projects, ProjectDetail, Team, MemberPortfolio, Services, About, Contact, Admin
```

---

## ⚡ Quick Start & Local Setup

### 1. Install Dependencies
In the root directory or inside each subfolder:
```bash
# In backend/
cd backend
npm install

# In frontend/
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Create `backend/.env` from `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_SECRET_KEY=admin_syntax_studio_2025_secure_key
ADMIN_ACCESS_TOKEN=akshat0021
```

*(Optional)* If you wish to connect directly to Google Cloud Firestore instead of the local in-memory engine:
```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Run Both Servers Concurrently
From the root directory:
```bash
npm run dev
```
Or start them individually:
```bash
# Terminal 1 (Backend on http://localhost:5000)
cd backend && npm run dev

# Terminal 2 (Frontend on http://localhost:5173)
cd frontend && npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

## 🔐 Admin Dashboard Access
* **URL**: `http://localhost:5173/admin`
* **Default Password**: `akshat0021`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | No |
| `GET` | `/api/projects` | List all projects (supports `?category=` and `?featured=`) | No |
| `GET` | `/api/projects/:slug` | Retrieve single project case study | No |
| `POST` | `/api/projects` | Create new project case study | Yes (Admin) |
| `PUT` | `/api/projects/:id` | Update project case study | Yes (Admin) |
| `DELETE` | `/api/projects/:id` | Delete project case study | Yes (Admin) |
| `GET` | `/api/team` | List studio co-founders | No |
| `GET` | `/api/team/:slug` | Retrieve individual founder profile | No |
| `PUT` | `/api/team/:id` | Update founder profile | Yes (Admin) |
| `GET` | `/api/services` | List all agency services | No |
| `GET` | `/api/testimonials` | List client feedback | No |
| `POST` | `/api/contact` | Submit project inquiry (rate limited) | No |
| `GET` | `/api/contact` | List received inquiries | Yes (Admin) |
| `PATCH`| `/api/contact/:id` | Update inquiry status (read/replied) | Yes (Admin) |
| `DELETE`| `/api/contact/:id` | Delete inquiry | Yes (Admin) |
| `POST` | `/api/auth/login` | Admin login | No |
| `GET` | `/api/auth/verify` | Verify current admin token | Yes (Admin) |
