import { Suspense, lazy } from "react";
import ProtectedRoute from "./ProtectedRoute";
import RoleRedirect   from "./RoleRedirect";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import { createBrowserRouter, RouterProvider, Link } from "react-router-dom";
// ── Lazy imports ──────────────────────────────────────────────────────────────
const Login             = lazy(() => import("@/pages/Login"));
const Unauthorized      = lazy(() => import("@/pages/Unauthorized"));
const AppShell          = lazy(() => import("@/components/layout/AppShell"));

// Student
const StudentDashboard  = lazy(() => import("@/pages/student/Dashboard"));
const Profile           = lazy(() => import("@/pages/student/Profile"));
const Strategy          = lazy(() => import("@/pages/student/Strategy"));
const Simulator         = lazy(() => import("@/pages/student/Simulator"));
const RejectionAnalysis = lazy(() => import("@/pages/student/RejectionAnalysis"));
const DreamCompany      = lazy(() => import("@/pages/student/DreamCompany"));
const ResumeAnalyzer = lazy(() => import("@/pages/student/ResumeAnalyzer"));
const StudentOffers     = lazy(() => import("@/pages/student/Offers"));
const MockInterview     = lazy(() => import("@/pages/student/MockInterview"));



// Shared (all roles)
const Chat              = lazy(() => import("@/pages/Shared/Chat"));
const Companies         = lazy(() => import("@/pages/Shared/Companies"));
const Drives            = lazy(() => import("@/pages/Shared/Drives"));
const Applications      = lazy(() => import("@/pages/Shared/Applications"));
const PlacedStudents    = lazy(() => import("@/pages/Shared/PlacedStudents"));
const Messages          = lazy(() => import("@/pages/Shared/Messages"));

// TPO
const TPODashboard      = lazy(() => import("@/pages/tpo/Dashboard"));
const Students          = lazy(() => import("@/pages/tpo/Students"));
const Results           = lazy(() => import("@/pages/tpo/Results"));
const Offers            = lazy(() => import("@/pages/tpo/Offers"));

// HR
const HRDashboard       = lazy(() => import("@/pages/HR/Dashboard"));

// ── Fallback shown while a lazy chunk loads ───────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      height:"100vh", background:"#1C1917",
      fontFamily:"'DM Sans',sans-serif", color:"#57534E", fontSize:13,
    }}>
      Loading…
    </div>
  );
}

// Shorthand: Suspense wrapper
function S({ C, ...props }) {
  return <Suspense fallback={<PageLoader />}><C {...props} /></Suspense>;
}

// ── Route tree ────────────────────────────────────────────────────────────────
const router = createBrowserRouter([

  // Public
  { path:"/login",        element:<S C={Login} /> },
  { path:"/",             element:<RoleRedirect /> },
  { path:"/forgot-password", element:<ForgotPassword /> },
  { path:"/reset-password",  element:<ResetPassword /> },
  { path:"/unauthorized", element:<S C={Unauthorized} /> },

  // ── Student ──────────────────────────────────────────────────────────────────
  {
    path:"student",
    element:<ProtectedRoute roles={["student"]} />,
    children:[{
      element:<S C={AppShell} />,
      children:[
        { path:"dashboard",  element:<S C={StudentDashboard} /> },
        { path:"profile",    element:<S C={Profile} /> },
        { path:"companies",  element:<S C={Companies}    role="student" /> },
        { path:"drives",     element:<S C={Drives}       role="student" /> },
        { path:"apps",       element:<S C={Applications} role="student" /> },
        { path:"strategy",   element:<S C={Strategy} /> },
        { path:"simulator",  element:<S C={Simulator} /> },
        { path:"rejection",  element:<S C={RejectionAnalysis} /> },
        { path:"dream",      element:<S C={DreamCompany} /> },
        { path:"resume", element:<S C={ResumeAnalyzer} /> },
        { path:"offers",     element:<S C={StudentOffers} /> },
        { path:"mock-interview", element:<S C={MockInterview} /> },
      ],
    }],
  },

  // ── Chat — all authenticated roles ───────────────────────────────────────────
  {
    element:<ProtectedRoute roles={["student","tpo","company"]} />,
    children:[{
      element:<S C={AppShell} />,
      children:[
        { path:"chat",     element:<S C={Chat} /> },
        { path:"tpo/chat", element:<S C={Chat} /> },
        { path:"hr/chat",  element:<S C={Chat} /> },
        { path:"messages", element:<S C={Messages} /> },
        { path:"tpo/messages", element:<S C={Messages} /> },
        { path:"hr/messages", element:<S C={Messages} /> },
      ],
    }],
  },

  // ── TPO ───────────────────────────────────────────────────────────────────────
  {
    element:<ProtectedRoute roles={["tpo"]} />,
    children:[{
      element:<S C={AppShell} />,
      children:[
        { path:"tpo/dashboard",    element:<S C={TPODashboard} /> },
        { path:"tpo/students",     element:<S C={Students} /> },
        { path:"tpo/companies",    element:<S C={Companies}    role="tpo" /> },
        { path:"tpo/drives",       element:<S C={Drives}       role="tpo" /> },
        { path:"tpo/applications", element:<S C={Applications} role="tpo" /> },
        { path:"tpo/results",      element:<S C={Results} /> },
        { path:"tpo/offers",       element:<S C={Offers} /> },
        { path:"tpo/placed",       element:<S C={PlacedStudents} /> },
      ],
    }],
  },

  // ── HR ────────────────────────────────────────────────────────────────────────
  {
    element:<ProtectedRoute roles={["company"]} />,
    children:[{
      element:<S C={AppShell} />,
      children:[
        { path:"hr/dashboard",    element:<S C={HRDashboard} /> },
        { path:"hr/companies",    element:<S C={Companies}    role="hr" /> },
        { path:"hr/drives",       element:<S C={Drives}       role="hr" /> },
        { path:"hr/applications", element:<S C={Applications} role="hr" /> },
        { path:"hr/placed",       element:<S C={PlacedStudents} /> },
      ],
    }],
  },

  // ── 404 ───────────────────────────────────────────────────────────────────────
  // ── 404 ───────────────────────────────────────────────────────────────────────
  {
    path:"*",
    element:(
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", height:"100vh", background:"#1C1917",
        fontFamily:"'DM Serif Display',serif", color:"#F5F5F4", gap:12,
      }}>
        <div style={{ fontSize:72, color:"#F59E0B", lineHeight:1 }}>404</div>
        <div style={{ fontSize:20 }}>Page not found</div>
        <Link to="/" style={{ fontSize:14, color:"#A8A29E", marginTop:6, textDecoration:"none" }}>← Go home</Link>
      </div>
    ),
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
