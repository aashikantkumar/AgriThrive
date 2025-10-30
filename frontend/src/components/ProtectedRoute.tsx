import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfile?: boolean; // New prop to control profile requirement
}

const ProtectedRoute = ({ children, requireProfile = true }: ProtectedRouteProps) => {
  const { user, profile, loading, profileLoading } = useAuth();

  // Show loading spinner while checking auth
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but no profile - redirect to profile page
  if (requireProfile && !profile) {
    return <Navigate to="/profile" replace />;
  }

  // All good - render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;