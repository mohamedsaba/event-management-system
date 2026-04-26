import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      const fallbackMap = {
        'admin': '/admin/dashboard',
        'organizer': '/organizer/dashboard',
        'attendee': '/dashboard'
      };
      return <Navigate to={fallbackMap[user.role] || '/dashboard'} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;