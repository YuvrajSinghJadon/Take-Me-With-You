import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.user);
  const userType = user?.userType?.toLowerCase();

  if (!userType || !allowedRoles.includes(userType)) {
    // If the user is not authorized, redirect them to the "Unauthorized" page
    return <Navigate to="/unauthorized" />;
  }

  // If the user is authorized, render the child components (i.e., the protected route)
  return children;
};

export default ProtectedRoute;
