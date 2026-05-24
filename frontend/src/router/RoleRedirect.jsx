import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

/**
 * Sits at "/" — sends each role straight to their dashboard.
 * Unauthenticated users go to /login.
 */
export default function RoleRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role === "tpo")        return <Navigate to="/tpo/dashboard" replace />;
  if (user.role === "company")    return <Navigate to="/hr/dashboard"  replace />;
  return <Navigate to="/student/dashboard" replace />;
}
