import { Route, Routes } from "react-router";
import Dashboard from "./page/Dashboard";
import Authentication from "./page/Authentication";
import ProtectedRoutes, { PublicRoute } from "./components/ProtectedRoutes";
import NotFound from "./page/NotFound";
import Verification from "./features/authentication/Verification";
import VerificationSuccess from "./features/authentication/VerificationSuccess";
import Home from "./page/Home";
// import Onboarding from "./page/Onboarding";
// import NotAvailable from "./page/NotAvailable";
import Profile from "./page/Profile";
import Onboarding from "./page/Onboarding";
import OnboardingRoute from "./components/OnboardingRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/verification/:id" element={<Verification />} />
        {/* <Route path="/not-available" element={<NotAvailable />} /> */}
        <Route
          path="/verification/success/:id"
          element={<VerificationSuccess />}
        />

        <Route
          path="/authentication"
          element={
            <PublicRoute>
              <Authentication />
            </PublicRoute>
          }
        />

        <Route element={<ProtectedRoutes />}>
          <Route element={<OnboardingRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
