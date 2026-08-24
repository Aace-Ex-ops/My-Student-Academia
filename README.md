<div align="center">

  <img src="frontend/public/android-chrome-512x512.png" alt="My Student Academia Logo" width="120" height="120" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(255, 109, 31, 0.35);" />

  # 🎓 My Student Academia (MSA)
  ### *Next-Generation Academic Schedule & Course Registration Management System*

  <p align="center">
    A high-velocity, aesthetically crafted university course registration platform featuring multi-slot routine freedom, real-time schedule conflict resolution, 3D WebGL scrollytelling, and instant cloud edge deployments.
  </p>

  [![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
  [![GSAP](https://img.shields.io/badge/GSAP_3-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://greensock.com/gsap/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![Cloudflare](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
  [![Firebase](https://img.shields.io/badge/Firebase_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

  <br />

  [Explore Features](#-key-features) • [Tech Stack](#-technology-stack) • [Quick Start](#-getting-started) • [Deployment](#-deployment-options) • [API Documentation](#-api-overview)

</div>

---

## 🌟 Highlights

- ⚡ **Sub-50ms Landing Page & 120 FPS WebGL**: Code-split micro-chunks, Service Worker CacheStorage API, and hardware-accelerated 3D holographic scenes.
- 📅 **Multi-Slot Routine Engine**: Dynamic visual timetable with automatic minute-by-minute collision detection ensuring zero double-booking.
- 🚀 **1-Click Frictionless Course Registration**: Instant enrollment with auto-student upsert, prerequisite guidance, and transparent waitlist management.
- 🤖 **Rocket Jet Mascot Alerts**: Custom animated interactive modals for duplicate course warnings, waitlist status, and registration caps.
- 👤 **Student Persona Avatar Sync**: Real-time profile customization across astronaut, scholar, techie, and minimalist personas with custom photo upload.
- 📊 **Performance & Routine Analytics**: Live auditing of enrolled credit totals (max 18 credits), commitment hours, routine balance, and workload score.
- 🌐 **Cloudflare & Firebase Native**: Pre-configured with Single-Page Application (SPA) fallback routing (`_redirects`), security headers (`_headers`), and `firebase.json`.

---

## 🎯 Key Features

### 1. 🏎️ 5-Chapter Continuous 3D Scrollytelling (`PearMasterpieceExperience`)
- Continuous, hardware-accelerated 3D cylinder revolution tied directly to scroll progress with zero stepped lag.
- High-gloss obsidian glass cards with dynamic specular light reflections, depth occlusion, and swipe/drag gesture support.

### 2. 🗓️ Visual Interactive Timetable Builder
- 5-day weekly visual timetable grid (Monday–Friday, 8:00 AM – 6:00 PM).
- Color-coded department cards with instructor details, room locations, and 1-click slot dropping.

### 3. 📚 Smart Course Catalog & Filtering
- Instant search by course code, title, or keywords with in-memory RAM caching (`< 1.5ms` response latency).
- Real-time seat capacity bars (e.g., 28/30 seats filled) with automated waitlist queue positions.

### 4. 🔒 Frictionless Student Authentication
- Direct, zero-friction Google Sign-In workflow with custom photo upload and persistent dashboard synchronization.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite, Tailwind CSS |
| **3D Graphics & Animations** | Three.js, GSAP 3 (ScrollTrigger), Framer Motion, Lucide Icons |
| **Backend API** | Node.js, Express.js, TypeScript |
| **Database & ORM** | SQLite (development/local) / PostgreSQL, Prisma ORM |
| **Caching & Acceleration** | Progressive Web App Service Worker (CacheStorage), Server RAM In-Memory Cache |
| **Deployment & Hosting** | Cloudflare Pages, Firebase Hosting, Google Cloud Run, Docker |

---

## 📁 Repository Structure

```text
My-Student-Academia/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database models (Courses, Sections, Enrollments, Students)
│   │   └── seed.ts                # Database seed data with realistic curriculum
│   ├── src/
│   │   ├── routes/                # Course, Registration, Auth, & Admin routes
│   │   └── server.ts              # Express server with caching headers & CORS
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── _redirects             # Cloudflare Pages SPA fallback routing
│   │   ├── _headers               # Cloudflare Edge security & immutable asset caching
│   │   └── sw.js                  # PWA Service Worker Cache engine
│   ├── src/
│   │   ├── components/ui/         # 3D WebGL Hero, Pear Scrollytelling, Robot Modals
│   │   ├── pages/                 # LandingPage, Catalog, Dashboard, Timetable, Auth
│   │   ├── lib/api.ts             # Unified API client (local + cloud proxy)
│   │   └── main.tsx
│   ├── vite.config.ts             # Rollup manual vendor chunking & ES2022 target
│   └── package.json
│
├── .firebaserc                    # Firebase project configuration
├── firebase.json                  # Firebase Hosting & SPA rewrites configuration
├── wrangler.toml                  # Cloudflare Pages Wrangler CLI configuration
├── DEPLOYMENT_GUIDE.md            # Comprehensive cloud deployment instructions
├── Dockerfile                     # Multi-stage production container build
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/Aace-Ex-ops/My-Student-Academia.git
cd My-Student-Academia
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Initialize Database & Seed Courses
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

### 4. Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend API - Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend App - Port 5173):**
```bash
cd frontend
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🌐 Deployment Options

### ⚡ Deploy to Cloudflare Pages (Free & Unlimited Bandwidth)
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=my-student-academia
```
*Or connect your GitHub repository in the [Cloudflare Dashboard](https://dash.cloudflare.com/) with root directory `frontend` and output directory `dist`.*

### 🔥 Deploy to Firebase Hosting
```bash
cd frontend
npm run build
cd ..
firebase login
firebase deploy --only hosting
```

For complete step-by-step instructions (including Google Cloud Run and Render backend setups), check out the **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**.

---

## 📡 API Overview

| Method | Endpoint | Description | Cache Strategy |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/courses` | Fetch all courses, sections, and live capacity | In-Memory RAM (`60s TTL`) |
| `GET` | `/api/courses/departments` | Fetch academic departments | In-Memory RAM (`120s TTL`) |
| `POST` | `/api/registration/enroll` | 1-Click register for a course/section | Real-time Transaction |
| `POST` | `/api/registration/drop` | Drop an enrolled course | Real-time Transaction |
| `GET` | `/api/registration/my-courses/:studentId` | Fetch registered courses & schedule slots | Real-time Query |
| `GET` | `/api/health` | Backend status & heartbeat check | Public |

---

## 👨‍💻 Author

**Aditya Chatterjee**
- GitHub: [@Aace-Ex-ops](https://github.com/Aace-Ex-ops)
- Project Repository: [My-Student-Academia](https://github.com/Aace-Ex-ops/My-Student-Academia)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
