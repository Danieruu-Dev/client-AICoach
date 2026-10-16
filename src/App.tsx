import { Navigate, Route, Routes } from "react-router";
import Dashboard from "./pages/Dashboard";
import Authentication from "./pages/Authentication";
import ProtectedRoutes, { PublicRoute } from "./routes/ProtectedRoutes";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
// import Onboarding from "./pages/Onboarding";
// import NotAvailable from "./pages/NotAvailable";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import OnboardingRoute from "./routes/OnboardingRoute";
import Roadmap from "./pages/Roadmap";
import Interview from "./pages/Interview";
import InterviewPreflight from "./features/interview/InterviewPreflight";
import InterviewQuestion from "./features/interview/InterviewQuestion";
import InterviewEvaluation from "./features/interview/InterviewEvaluation";
import AuthCallback from "./routes/AuthCallback";

function App() {
  return (
    <>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        {/* <Route path="/not-available" element={<NotAvailable />} /> */}

        <Route path="/auth/callback" element={<AuthCallback />} />

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
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/interview" element={<Interview />}>
            <Route index element={<Navigate to="preflight" replace />} />
            <Route path="preflight" element={<InterviewPreflight />} />
            <Route
              path="question/:interviewSessionPublicId"
              element={<InterviewQuestion />}
            />
            <Route path="evaluation/:interviewSessionPublicId" element={<InterviewEvaluation />} />
            <Route path="evaluation" element={<Navigate to="/roadmap" replace />} />
          </Route>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
