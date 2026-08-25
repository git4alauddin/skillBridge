import { useEffect, useState } from "react";

import { api, apiErrorMessage } from "../api";
import { MetricGrid } from "../components/MetricGrid";
import type { DashboardResponse } from "../types";

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load role-specific dashboard metrics for the signed-in user.
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get<DashboardResponse>("/dashboard");
        setDashboard(response.data);
      } catch (loadError) {
        setError(apiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  if (isLoading) {
    return <main className="page-status">Loading dashboard...</main>;
  }

  if (error) {
    return <main className="page-status">{error}</main>;
  }

  if (!dashboard) {
    return <main className="page-status">Dashboard is unavailable.</main>;
  }

  return (
    <main className="page-content">
      <section className="page-panel">
        <div>
          <h2>Dashboard</h2>
          <p>{dashboard.role} overview</p>
        </div>
        <MetricGrid metrics={dashboard.metrics} />
      </section>
    </main>
  );
};