import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useDataQueries";
import { PageLoadingSkeleton } from "@/components/skeletons/PageSkeletons";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading || profileLoading) {
    return <PageLoadingSkeleton />;
  }

  if (!user) {
    // Store the intended destination to redirect after login
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  // Check if onboarding is completed (skip check if already on onboarding page)
  if (
    location.pathname !== "/onboarding" &&
    profile &&
    !profile.onboarding_completed
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Route specifically for onboarding - requires auth but not onboarding completion
export function OnboardingRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (loading || profileLoading) {
    return <PageLoadingSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If already onboarded, go to dashboard
  if (profile?.onboarding_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// For pages that should redirect away if already logged in (like Auth page)
interface PublicOnlyRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicOnlyRoute({
  children,
  redirectTo = "/dashboard",
}: PublicOnlyRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (user) {
    // Redirect to the page they came from, or dashboard
    const from = (location.state as { from?: string })?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
