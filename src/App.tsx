import { Route, Routes } from "react-router";
import Dashboard from "./page/Dashboard";
import Authentication from "./page/Authentication";
import ProtectedRoutes, { PublicRoute } from "./components/ProtectedRoutes";
import NotFound from "./page/NotFound";
import Verification from "./features/authentication/Verification";
import VerificationSuccess from "./features/authentication/VerificationSuccess";

function App() {
  return (
    <>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<p>House</p>} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/verification/:id" element={<Verification />} />
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
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
