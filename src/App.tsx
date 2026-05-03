import { Route, Routes } from "react-router";
import Dashboard from "./page/Dashboard";
import Authentication from "./page/Authentication";
import ProtectedRoutes, { PublicRoute } from "./components/ProtectedRoutes";
import NotFound from "./page/NotFound";

function App() {
  return (
    <>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<p>House</p>} />
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
