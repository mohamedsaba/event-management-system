import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // 1. If we are still checking if the user is logged in, show a spinner
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. If no user, redirect to auth but save the location they were trying to visit
  // This allows us to send them back to /payment after they log in!
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;