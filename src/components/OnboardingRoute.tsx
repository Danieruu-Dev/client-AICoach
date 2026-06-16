import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthProviderContext";

function OnboardingRoute() {
  const auth = useAuth();

  const onboardingCompleted = auth?.user?.onboardingCompleted ?? false;

  return onboardingCompleted ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Outlet />
  );
}

export default OnboardingRoute;
