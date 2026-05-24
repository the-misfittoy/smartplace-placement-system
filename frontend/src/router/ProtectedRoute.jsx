import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { T } from "@/tokens"; // For styling the loading state

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const location = useLocation();

  // Prevent flash of login screen while Zustand reads localStorage
  if (!_hasHydrated) {
    return (
      <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center", background:"#1C1917", color:T.amber, fontFamily:T.font }}>
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated || !user)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.role)) {
    const home =
      user.role === "tpo"     ? "/tpo/dashboard" :
      user.role === "company" ? "/hr/dashboard"  :
                                "/student/dashboard";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}