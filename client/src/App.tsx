import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "./components/RequireAuth";
import { Shell } from "./components/Shell";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { AuthPage } from "./pages/AuthPage";
import { BrowsePage } from "./pages/BrowsePage";
import { DashboardPage } from "./pages/DashboardPage";
import { OpportunitiesPage } from "./pages/OpportunitiesPage";
import { UsersPage } from "./pages/UsersPage";

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="browse"
          element={
            <RequireAuth allowedRoles={["student"]}>
              <BrowsePage />
            </RequireAuth>
          }
        />

        <Route
          path="applications"
          element={
            <RequireAuth allowedRoles={["student", "mentor", "admin"]}>
              <ApplicationsPage />
            </RequireAuth>
          }
        />

        <Route
          path="opportunities"
          element={
            <RequireAuth allowedRoles={["mentor", "admin"]}>
              <OpportunitiesPage />
            </RequireAuth>
          }
        />

        <Route
          path="users"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <UsersPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
