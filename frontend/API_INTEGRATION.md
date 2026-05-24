# API Integration Guide

How to swap every mock data constant for a real API call once your FastAPI backend is running.

---

## Pattern — read data (useQuery)

**Before (mock):**
```js
const students = MOCK_STUDENTS
```

**After (real API):**
```js
import { useStudents } from "@/hooks/useQueries"

const { data: students = [], isLoading, error } = useStudents()

if (isLoading) return <PageSkeleton type="table" dark={dark} />
if (error)     return <p>Error: {error.message}</p>
```

---

## Pattern — write data (useMutation)

**Before (mock):**
```js
const handleSave = (student) => setStudents(p => [...p, student])
```

**After (real API):**
```js
import { useCreateStudent } from "@/hooks/useQueries"
import { useToast }         from "@/components/ui/Toast"

const toast               = useToast()
const { mutate: create, isPending } = useCreateStudent()

const handleSave = (student) => {
  create(student, {
    onSuccess: () => { closeModal(); toast.success("Student added") },
    onError:   (e) => toast.error(e.response?.data?.detail ?? e.message),
  })
}
```

---

## Page-by-page swap reference

| Page | Mock constant | Hook | Notes |
|---|---|---|---|
| StudentDashboard | `MOCK.student` | `useStudent(user.student_id)` | `student_id` from `authStore` |
| StudentDashboard | `MOCK.upcomingDrives` | `useDrives()` | Filter `.filter(d => d.status === "upcoming")` client-side |
| StudentDashboard | `MOCK.recentApps` | `useApplications()` | Hook auto-scopes to student role |
| Chat | `getMockReply()` | `useSendChatMessage()` | Replace fake timeout with `mutate({ query, student_id })` |
| Strategy | `MOCK_STRATEGY` | `useStrategy(studentId)` | |
| Simulator | `ALL_COMPANIES` | `useSimulator(id, targetCgpa)` | Debounce slider 400 ms before passing |
| RejectionAnalysis | `MOCK` | `useRejectionAnalysis(studentId)` | |
| DreamCompany | `COMPANIES` | `useCompanies()` + `useDreamCompany(studentId)` | |
| TPODashboard | `MOCK` | `usePlacedStudents()` + `useDrives()` + `useStudents()` | Aggregate stats client-side |
| Students | `MOCK_STUDENTS` | `useStudents()` | + `useCreateStudent` / `useUpdateStudent` / `useDeleteStudent` |
| Companies | `MOCK_COMPANIES` | `useCompanies()` | + `useCreateCompany()` for TPO |
| Drives | `MOCK_DRIVES` | `useDrives()` | + `useApplyForDrive()` for student |
| Applications | `MOCK_APPS` | `useApplications()` | + `useUpdateApplication()` for TPO |
| PlacedStudents | `MOCK_PLACED` | `usePlacedStudents()` | |
| Results | `MOCK_RESULTS` | `useResults()` | + `useAddResult()` |
| Offers | `MOCK_OFFERS` | `useOffers()` | + `useUpdateOffer()` |
| HRDashboard | `MOCK_ELIGIBLE` | `useStudents()` then filter | Filter by `company.minCgpa` client-side |
| Profile | `MOCK_STUDENT` | `useStudent(user.student_id)` | |

---

## Login wiring

Replace the mock timeout in `Login.jsx` with:

```js
import { useNavigate }  from "react-router-dom"
import useAuthStore     from "@/store/authStore"
import { login as loginAPI } from "@/api"

const { login }  = useAuthStore()
const navigate   = useNavigate()

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  try {
    const { access_token, user } = await loginAPI({ username, password })
    login(user, access_token)

    const dest =
      user.role === "tpo"     ? "/tpo/dashboard" :
      user.role === "company" ? "/hr/dashboard"  :
                                "/dashboard"
    navigate(dest, { replace: true })
  } catch (err) {
    setError(err.response?.data?.detail ?? "Invalid credentials")
    setLoading(false)
  }
}
```

---

## Dark mode in pages

Every page receives a `dark` prop from `AppShell`.
To read it anywhere without prop drilling, use the context:

```js
import { useTheme } from "@/context/ThemeContext"

const { dark } = useTheme()
```

---

## Running the project

```bash
# 1. Install
npm install

# 2. Copy env
cp .env.example .env

# 3. Start FastAPI backend (separate terminal)
cd ../backend
uvicorn main:app --reload --port 8000

# 4. Start frontend
npm run dev
# → http://localhost:5173
```

The Vite proxy forwards all `/students`, `/drives`, etc. requests to
`localhost:8000` automatically — no CORS issues in development.

For production set `VITE_API_URL` in `.env` to your deployed backend URL
and run `npm run build` — output goes to `dist/`.
