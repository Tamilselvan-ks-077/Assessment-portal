# 🎯 AssessPulse — Full-Stack Online Assessment & Certification Portal

[![React](https://img.shields.io/badge/React-18.3-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **AssessPulse** is an enterprise-grade, full-stack online examination, candidate testing, and psychometric evaluation SaaS platform. It enables educators, academies, bootcamps, and hiring teams to create high-stakes assessments, randomize question delivery, enforce anti-cheat proctoring rules, and track candidate analytics with automated grading.

---

## 🌟 Key Features

### 👨‍🎓 Candidate Examination Engine
- **Instant Access Code Entry**: Candidates enter assessment access codes (e.g. `DEV2026`, `REACT99`) to load tailored tests.
- **Candidate Registration**: Collects candidate identity (Name, Email, Student ID / Roll Number) before testing.
- **Anti-Cheat & Proctoring Warnings**: Tracks `document.hidden` visibility changes with live warning toasts and incident counter logging (`tabSwitchCount`).
- **Live Countdown Timer & Auto-Submit**: Real-time timer with urgent countdown alerts and automatic examination submission on time expiration.
- **Interactive Question Palette**: Fast navigation across all question numbers with status badges (Answered, Unanswered, Marked for Review).
- **Navigation & Leave Guard**: Intercepts accidental browser reloads, back swipes, or window closures with confirmation safeguards.
- **Instant Grading & Performance Reports**: Celebratory feedback, category breakdown, score percentages, and printable completion certificates.

### 🛡️ Admin & Assessment Creator Suite
- **Interactive Dashboard**: KPI summaries (Total Tests, Active Candidates, Pass Rates), recent submissions timeline, and score distribution charts.
- **4-Step Assessment Creation Wizard**:
  1. *Basic Details*: Title, category, description, duration, passing score percentage.
  2. *Question Builder*: Multi-format question creator with option reordering and point allocation.
  3. *Delivery Rules*: Question shuffling, option randomization, immediate result visibility, and anti-cheat toggles.
  4. *Access Code Generation*: Generates unique test access codes and shareable candidate invitation links.
- **Dynamic Question Management**: Add, modify, duplicate, reorder, and delete questions with auto-synchronized total marks.
- **Candidate Result Directory**: Filterable submissions table with CSV data export and per-candidate question response inspection.
- **Psychometric Item Analytics**: Question difficulty curves, cohort discrimination metrics, and average time-per-question analysis.
- **RBAC Security**: Role-based access control supporting `ADMIN`, `TEST_CREATOR`, and `PARTICIPANT` permissions.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    User([Candidate / Admin Browser]) --> |React 18 + Tailwind UI| Frontend[Vite Frontend SPA]
    Frontend --> |Axios REST Client| API[Express.js REST API]
    API --> |Zod & JWT Middleware| Controller[Controllers & Services]
    Controller --> |Prisma ORM| DB[(PostgreSQL Database)]
    Frontend -.-> |Offline Fallback| StorageService[LocalStorage Engine]
```

### **Frontend**
- **Framework**: React 18 (TypeScript) + Vite 5
- **Styling**: TailwindCSS 3 + Custom Glassmorphic Design System
- **Icons & UI**: Lucide React Icons, Canvas Confetti
- **Visualizations**: Recharts (Responsive Area, Bar, and Pie charts)
- **Routing**: React Router DOM v6 with route-level code splitting & guards

### **Backend REST API**
- **Runtime**: Node.js + Express + TypeScript (`tsx`)
- **ORM & Database**: Prisma ORM with PostgreSQL
- **Validation**: Zod schema validation middleware
- **Security**: Helmet, CORS, Express Rate Limiting, bcryptjs password hashing, JWT Access & Refresh tokens
- **Testing**: Jest + Supertest integration test suite
- **Documentation**: Swagger OpenAPI interactive documentation (`/api/docs`)

---

## 📁 Repository Structure

```
Assessment-portal/
├── index.html                  # Frontend HTML entry
├── package.json                # Root frontend scripts & dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind styling tokens & design system
├── src/
│   ├── api/                    # API client layer & Axios interceptors
│   │   ├── client.ts           # Base Axios instance with token injection
│   │   ├── authApi.ts          # Authentication endpoints
│   │   ├── assessmentApi.ts    # Assessment CRUD endpoints
│   │   ├── questionApi.ts      # Question management endpoints
│   │   ├── attemptApi.ts       # Candidate exam lifecycle endpoints
│   │   └── resultApi.ts        # Results & certificate endpoints
│   ├── components/ui/          # Reusable design system components
│   │   ├── Button.tsx, Input.tsx, Card.tsx, Modal.tsx, Table.tsx, ...
│   ├── constants/              # Categories, demo profiles, default seed fixtures
│   ├── context/                # Global React contexts (AuthContext, ToastContext)
│   ├── layouts/                # PublicLayout, AdminLayout, TestLayout
│   ├── pages/
│   │   ├── admin/              # Dashboard, Assessment Management, Analytics, Settings
│   │   ├── public/             # LandingPage, LoginPage, RegisterPage, NotFoundPage
│   │   └── test/               # TestAccessPage, TestStartPage, AssessmentTakingPage, TestResultPage
│   ├── routes/                 # ProtectedRoute & AppRoutes configuration
│   ├── types/                  # TypeScript domain models & DTOs
│   └── utils/                  # Formatters, class merger, LocalStorage fallback
└── server/                     # Production REST API Backend
    ├── package.json            # Backend dependencies
    ├── prisma/
    │   ├── schema.prisma       # Prisma data model definitions
    │   └── seed.ts             # Database seed script
    ├── src/
    │   ├── config/             # Database connection, env loader, Swagger setup
    │   ├── controllers/        # Express route controllers
    │   ├── middleware/         # Auth, RBAC, Validation, Error Handling, Rate Limiting
    │   ├── repositories/       # Prisma database query layer
    │   ├── routes/             # REST API endpoint definitions
    │   ├── services/           # Business logic & auto-grading engine
    │   ├── utils/              # JWT, password utilities, API response wrappers
    │   └── validators/         # Zod request validators
    └── tests/                  # Integration & unit test suites
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14+ running locally or on a cloud provider (e.g., Supabase, Neon, Railway)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Tamilselvan-ks-077/Assessment-portal.git
cd Assessment-portal
```

---

### 2. Configure Environment Variables

#### Frontend Configuration (`.env`)
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=AssessPulse
```

#### Backend Configuration (`server/.env`)
Create a `server/.env` file:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/assesspulse_db?schema=public"

JWT_SECRET=assesspulse_jwt_secret_super_key_2026_production_grade
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=assesspulse_jwt_refresh_super_key_2026_production_grade
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
```

---

### 3. Install Dependencies & Setup Database

#### Install Root & Server Dependencies
```bash
# Install root frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

#### Initialize Database Schema & Seed Fixtures
```bash
# Inside server directory:
npm run prisma:push
npm run seed
cd ..
```

---

### 4. Run the Full-Stack Application

Run both the Frontend and Backend concurrently with a single command from the root:
```bash
npm run dev:all
```

- **Frontend Application**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000/api`
- **Interactive Swagger API Docs**: `http://localhost:5000/api/docs`

---

## 🔑 Demo Credentials & Test Codes

### Default User Accounts
| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@assesspulse.com` | `password123` | Full admin control, candidate directory, analytics |
| **Test Creator** | `creator@assesspulse.com` | `password123` | Assessment builder, question management, reports |
| **Candidate** | `student@assesspulse.com` | `password123` | Candidate exam taking & result history |

### Ready-to-Test Access Codes
Enter these codes on the homepage or at `/test/<code>`:
- **`DEV2026`**: Full-Stack Web Development & Cloud Architecture Assessment (5 Questions, 20 Mins)
- **`REACT99`**: Frontend React & Modern Web Mastery (5 Questions, 15 Mins)
- **`CLOUD44`**: Cloud Architecture & DevOps Essentials (4 Questions, 20 Mins)
- **`SQL2024`**: Database Design & SQL Optimization Challenge (4 Questions, 25 Mins)

---

## 🧪 Testing & Quality Assurance

### Run Backend Integration Tests
```bash
cd server
npm test
```
*Executes comprehensive tests covering authentication, question authoring, candidate attempt lifecycles, and auto-grading logic.*

### Production Build Verification
```bash
# Build Frontend
npm run build

# Build Backend
cd server
npm run build
```

---

## 📡 Key REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new admin/creator account | No |
| `POST` | `/api/auth/login` | Login and obtain JWT tokens | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer Token |
| `GET` | `/api/assessments` | List all assessments | Bearer Token |
| `POST` | `/api/assessments` | Create new assessment | Bearer Token (Admin/Creator) |
| `GET` | `/api/assessments/access/:code` | Candidate test access code lookup | No |
| `POST` | `/api/attempts/start` | Begin new candidate exam attempt | No |
| `POST` | `/api/attempts/:id/answers` | Auto-save answer to attempt | No |
| `POST` | `/api/attempts/:id/tab-switch` | Log anti-cheat tab switch warning | No |
| `POST` | `/api/attempts/:id/submit` | Submit attempt & compute score | No |
| `GET` | `/api/results/:attemptId` | Retrieve candidate report card | No |

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).