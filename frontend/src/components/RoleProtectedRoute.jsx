import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/login" />;
  }

  return children;
}