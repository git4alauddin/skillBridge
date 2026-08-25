import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "./components/RequireAuth";
import { Shell } from "./components/Shell";
import { AuthPage } from "./pages/AuthPage";

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
        <Route
          index
          element={
            <main className="page-content">
              <section className="page-panel">
                <h2>Dashboard</h2>
                <p>Your role dashboard will appear here.</p>
              </section>
            </main>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;