# SmartPlace — AI-Assisted Placement Management System

> DBMS Course Project · Group 13 · IIIT Vadodara

A full-stack web application that manages the entire college placement process with intelligent features — placement strategy recommendations, CGPA simulation, rejection analysis, and an AI chatbot powered by Google Gemini.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind-inspired inline tokens (DM Serif Display + DM Sans) |
| State | Zustand (auth) + TanStack Query v5 (server state) |
| Routing | React Router v6 with lazy-loaded routes |
| Backend | FastAPI (Python) |
| Database | MySQL |
| AI | Google Gemini API |
| Auth | JWT (python-jose) + bcrypt |

---

## Features

### Core Management
- **Student Management** — add, edit, delete students; track CGPA, branch, backlogs, placement status
- **Company Management** — store company details, role, package, and eligibility criteria
- **Placement Drives** — schedule drives, track type and status
- **Applications** — students apply for drives; track every application through Pending → Selected / Rejected
- **Results** — TPO records pass/fail per round per student
- **Offers** — track offer letters; accept / decline workflow
- **Placed Students** — joined report of all placed students with company and package details

### Smart Features (USP)
| Feature | Description |
|---|---|
| Placement Strategy | Ranks eligible companies by match score, difficulty, and priority. Tells students which company to apply to first. |
| CGPA Simulator | Slider to set a target CGPA — instantly shows which companies become newly accessible. |
| Rejection Analysis | Identifies why applications failed (competition, CGPA gap, eligibility mismatch) with actionable suggestions. |
| Dream Company Tracker | Student sets a goal company; the system tracks eligibility, drives, application status, and offer in a visual timeline. |
| AI Assistant | Text + voice chatbot (Gemini-backed). Asks questions in natural language — "which companies am I eligible for?" — gets a human-readable answer. Includes a stop-speaking button. |

### Roles
| Role | Access |
|---|---|
| **Student** | Own profile, companies, drives, applications, all smart features, AI chat |
| **TPO** | Full CRUD on students / companies / drives, manage applications, results, offers, placed report, AI chat |
| **HR** | View eligible students, view drives and applications for their company, AI chat |

---

## Project Structure

```
smartplace-frontend/
├── index.html
├── vite.config.js
├── package.json
├── .env.example          → copy to .env
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── tokens.js           ← shared design tokens
    ├── api.js              ← axios client + all endpoint functions
    ├── store/
    │   └── authStore.js    ← Zustand auth store
    ├── hooks/
    │   └── useQueries.js   ← TanStack Query hooks
    ├── router/
    │   ├── index.jsx       ← route tree
    │   ├── ProtectedRoute.jsx
    │   └── RoleRedirect.jsx
    ├── context/
    │   └── ThemeContext.jsx ← dark/light mode
    ├── components/
    │   ├── layout/
    │   │   └── AppShell.jsx
    │   └── ui/
    │       ├── DataTable.jsx
    │       ├── Toast.jsx
    │       └── PageSkeleton.jsx
    └── pages/
        ├── Login.jsx
        ├── Unauthorized.jsx
        ├── student/
        │   ├── Dashboard.jsx
        │   ├── Profile.jsx
        │   ├── Strategy.jsx
        │   ├── Simulator.jsx
        │   ├── RejectionAnalysis.jsx
        │   └── DreamCompany.jsx
        ├── shared/
        │   ├── Chat.jsx
        │   ├── Companies.jsx
        │   ├── Drives.jsx
        │   ├── Applications.jsx
        │   └── PlacedStudents.jsx
        ├── tpo/
        │   ├── Dashboard.jsx
        │   ├── Students.jsx
        │   ├── Results.jsx
        │   └── Offers.jsx
        └── hr/
            └── Dashboard.jsx
```

---

## Setup

```bash
# 1 — Clone and install
git clone <repo-url>
cd smartplace-frontend
npm install

# 2 — Environment
cp .env.example .env
# Edit .env — set VITE_API_URL if your backend runs on a different port

# 3 — Start FastAPI backend (separate terminal)
cd smartplace-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 4 — Start frontend
npm run dev
# Opens at http://localhost:5173
```

The Vite proxy forwards all API calls to `localhost:8000` in development — no CORS configuration needed.

---

## Demo Flow

Follow this sequence for the presentation:

1. **Login** — log in as Student (`/login`)
2. **Student Dashboard** — show stat cards, upcoming drives, recent applications
3. **Placement Strategy** — show ranked company cards with match scores
4. **CGPA Simulator** — drag the slider, watch companies unlock live
5. **Rejection Analysis** — expand an accordion row, show the suggestion
6. **Dream Company** — select Google, step through the timeline
7. **AI Chat** — type "which companies am I eligible for?", then demo the mic button
8. **Switch to TPO** — reload, log in as TPO
9. **TPO Dashboard** — show placement charts, pending actions
10. **Students** — add a student via modal
11. **Offers** — accept a pending offer, show stat cards update

---

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/login` | Public |
| GET / POST | `/students` | TPO, HR |
| PUT / DELETE | `/students/:id` | TPO |
| GET / POST | `/companies` | Any auth / TPO |
| GET / POST | `/drives` | Any auth / TPO |
| POST | `/apply` | Student |
| GET / PUT | `/applications` | Any auth / TPO |
| POST | `/results` | TPO |
| GET / POST / PUT | `/offers` | TPO |
| GET | `/placed-students` | Any auth |
| GET | `/placement-strategy/:id` | Student, TPO |
| GET | `/whatif-simulator/:id` | Student, TPO |
| GET | `/rejection-analysis/:id` | Student, TPO |
| GET / POST | `/dream-company` | Student |
| POST | `/voice-chat` | Any auth |

---

## Group Members

Group 13 · IIIT Vadodara  
Department of Computer Science · MCA Programme
