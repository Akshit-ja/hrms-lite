# HRMS Lite

A lightweight Human Resource Management System (HRMS) built as a full-stack web application. It allows an admin to manage employee records and track daily attendance.

## Live Demo

- **Frontend**: *https://hrms-lite-two-theta.vercel.app*
- **Backend API**: *https://hrms-lite-api-8kuc.onrender.com*

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, React Router, Axios, Lucide Icons |
| **Backend** | Python, FastAPI, SQLAlchemy ORM |
| **Database** | SQLite (development) / PostgreSQL (production) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

## Features

### Core Features
- **Employee Management** — Add, view, search, and delete employees
- **Attendance Tracking** — Mark daily attendance (Present / Absent) for any employee
- **Attendance Records** — View attendance history per employee

### Bonus Features
- **Dashboard Summary** — Total employees, present/absent today, department breakdown
- **Date Filtering** — Filter attendance records by date range
- **Present Day Count** — Total present/absent days displayed per employee
- **Search** — Real-time search across employees by name, ID, department, or email

### UI/UX
- Clean, professional, production-ready interface
- Responsive sidebar navigation
- Loading, empty, and error states throughout
- Toast notifications for user feedback
- Confirmation modals for destructive actions
- Reusable component architecture

## Project Structure

```
ethara-ai/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # Database engine & session
│   ├── models.py               # SQLAlchemy models
│   ├── schemas.py              # Pydantic validation schemas
│   ├── requirements.txt        # Python dependencies
│   └── routes/
│       ├── employees.py        # Employee CRUD endpoints
│       ├── attendance.py       # Attendance endpoints
│       └── dashboard.py        # Dashboard summary endpoint
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx             # Router setup
│       ├── main.jsx            # React entry point
│       ├── index.css           # Global styles
│       ├── api/
│       │   └── api.js          # Axios API service
│       ├── components/
│       │   ├── Layout.jsx      # App layout with sidebar
│       │   ├── Sidebar.jsx     # Navigation sidebar
│       │   ├── Loading.jsx     # Loading state component
│       │   ├── EmptyState.jsx  # Empty state component
│       │   └── ErrorState.jsx  # Error state component
│       └── pages/
│           ├── DashboardPage.jsx
│           ├── EmployeesPage.jsx
│           └── AttendancePage.jsx
└── README.md
```

## API Endpoints

### Employees
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees/` | List all employees |
| GET | `/api/employees/{id}` | Get single employee |
| POST | `/api/employees/` | Create new employee |
| DELETE | `/api/employees/{id}` | Delete employee |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attendance/` | List all attendance (with optional filters) |
| GET | `/api/attendance/employee/{id}` | Get employee's attendance |
| GET | `/api/attendance/employee/{id}/summary` | Get present/absent totals |
| POST | `/api/attendance/` | Mark/update attendance |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Dashboard stats & recent activity |

## Steps to Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for interactive Swagger documentation.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`. It proxies API requests to `http://localhost:8000` during development.

### Production Build

```bash
cd frontend
npm run build
```

## Environment Variables

### Frontend
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `""` (proxied in dev) |

### Backend
| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Database connection string | `sqlite:///./hrms.db` |

## Assumptions & Limitations

- **Single admin user** — No authentication/authorization is implemented as per the assignment scope
- **SQLite** is used locally for simplicity; can be swapped with PostgreSQL via the `DATABASE_URL` env variable
- **Leave management, payroll, and advanced HR features** are intentionally out of scope
- Attendance for same employee + date will update the existing record (upsert behavior)

## Deployment Guide

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Set root directory: `backend`

### Frontend (Vercel)
1. Import the repo into Vercel
2. Set root directory: `frontend`
3. Set `VITE_API_URL` env variable to your deployed backend URL
4. Deploy
