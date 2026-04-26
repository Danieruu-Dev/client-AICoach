import { Route, Routes } from "react-router";
import Dashboard from "./page/Dashboard";
import Authentication from "./page/Authentication";
import ProtectedRoutes from "./components/ProtectedRoutes";
import NotFound from "./page/NotFound";

function App() {
  const isAuthenticated = true;
  return (
    <>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
          <Route path="/authentication" element={<Authentication />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
