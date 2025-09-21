import { Navigate, useLocation } from "react-router";
import UseAuth from "../../../../Hooks/UseAuth";


const AdminRoute = ({ children }) => {
  const { role, loading } = UseAuth();
  const location = useLocation();

  if (loading) return <p className="text-center">Loading...</p>; // or a spinner

  if (role === "admin") {
    return children;
  }

  // Redirect non-admins to homepage (or safe page)
  return <Navigate to="/" state={{ from: location }} replace />;
};

export default AdminRoute;
