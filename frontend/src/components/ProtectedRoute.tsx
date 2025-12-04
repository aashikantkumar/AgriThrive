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

  // Only show loading on initial auth check, NOT during profile refresh
  // This prevents unmounting children during profile refetch
  if (loading) {
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

  // Show loading ONLY if we don't have profile yet AND we require it
  // But if we already have a profile, don't show loading (prevents remount)
  if (requireProfile && !profile && profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Logged in but no profile - redirect to profile page
  if (requireProfile && !profile && !profileLoading) {
    return <Navigate to="/profile" replace />;
  }

  // All good - render the protected content
  // Key change: Don't unmount children just because profileLoading is true
  // If we already rendered children once, keep them rendered
  return <>{children}</>;
};

export default ProtectedRoute;