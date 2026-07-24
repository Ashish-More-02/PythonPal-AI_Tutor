import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps any route that should only be reachable once logged in. If there's no
// user, bounce to the homepage instead of rendering the product.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
