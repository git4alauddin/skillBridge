import { useEffect, useState } from "react";

import { api, apiErrorMessage } from "../api";
import { MetricGrid } from "../components/MetricGrid";
import type { DashboardResponse } from "../types";

type MentorDashboardVisualProps = {
  metrics: Record<string, number>;
};

type DashboardVisualItem = {
  className: string;
  label: string;
  metric: string;
  totalMetric?: string;
};

type DashboardVisualProps = {
  description: string;
  items: DashboardVisualItem[];
  metrics: Record<string, number>;
  overviewLabel: string;
  overviewTotalMetric: string;
  overviewValueMetric: string;
  title: string;
};

const mentorPipelineItems = [
  {
    label: "Shortlisted",
    metric: "shortlistedStudents",
    className: "pipeline-warning",
  },
  {
    label: "Selected",
    metric: "selectedStudents",
    className: "pipeline-success",
  },
  {
    label: "Waitlisted",
    metric: "waitlistedStudents",
    className: "pipeline-info",
  },
];

const adminSnapshotItems = [
  {
    label: "Students",
    metric: "totalStudents",
    totalMetric: "totalUsers",
    className: "pipeline-info",
  },
  {
    label: "Mentors",
    metric: "totalMentors",
    totalMetric: "totalUsers",
    className: "pipeline-success",
  },
  {
    label: "Pending approvals",
    metric: "pendingApprovals",
    totalMetric: "totalOpportunities",
    className: "pipeline-warning",
  },
];

const studentStatusItems = [
  { label: "Pending", metric: "pending", className: "pipeline-warning" },
  { label: "Shortlisted", metric: "shortlisted", className: "pipeline-info" },
  { label: "Selected", metric: "selected", className: "pipeline-success" },
  { label: "Waitlisted", metric: "waitlisted", className: "pipeline-info" },
  { label: "Rejected", metric: "rejected", className: "pipeline-danger" },
  { label: "Completed", metric: "completed", className: "pipeline-success" },
];

const percentage = (value: number, total: number) => {
  return total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100));
};

const DashboardVisual = ({
  description,
  items,
  metrics,
  overviewLabel,
  overviewTotalMetric,
  overviewValueMetric,
  title,
}: DashboardVisualProps) => {
  const overviewValue = metrics[overviewValueMetric] ?? 0;
  const overviewTotal = metrics[overviewTotalMetric] ?? 0;
  const overviewPercent = percentage(overviewValue, overviewTotal);

  return (
    <section className="dashboard-visual">
      <div className="section-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="pipeline-overview">
        <div>
          <span>{overviewLabel}</span>
          <strong>
            {overviewValue} / {overviewTotal}
          </strong>
        </div>
        <div
          className="pipeline-track"
          aria-label={`${overviewPercent}% ${overviewLabel.toLowerCase()}`}
        >
          <span style={{ width: `${overviewPercent}%` }} />
        </div>
      </div>

      <div className="pipeline-grid">
        {items.map((item) => {
          const value = metrics[item.metric] ?? 0;
          const total = item.totalMetric
            ? (metrics[item.totalMetric] ?? 0)
            : overviewTotal;
          const itemPercent = percentage(value, total);

          return (
            <article className="pipeline-card" key={item.metric}>
              <div>
                <span>{item.label}</span>
                <strong>{value}</strong>
              </div>
              <div className="pipeline-track">
                <span
                  className={item.className}
                  style={{ width: `${itemPercent}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

const AdminDashboardVisual = ({ metrics }: MentorDashboardVisualProps) => (
  <DashboardVisual
    title="Platform Snapshot"
    description="Review users, opportunities, and items waiting for approval."
    overviewLabel="Active review load"
    overviewValueMetric="pendingApprovals"
    overviewTotalMetric="totalOpportunities"
    items={adminSnapshotItems}
    metrics={metrics}
  />
);

const MentorDashboardVisual = ({ metrics }: MentorDashboardVisualProps) => {
  const reviewedApplications = mentorPipelineItems.reduce(
    (total, item) => total + (metrics[item.metric] ?? 0),
    0,
  );

  return (
    <DashboardVisual
      title="Application Pipeline"
      description="See how applications are moving through your review process."
      overviewLabel="Reviewed"
      overviewValueMetric="reviewedApplications"
      overviewTotalMetric="applicationsReceived"
      items={mentorPipelineItems}
      metrics={{ ...metrics, reviewedApplications }}
    />
  );
};

const StudentDashboardVisual = ({ metrics }: MentorDashboardVisualProps) => {
  const activeApplications =
    (metrics.pending ?? 0) +
    (metrics.shortlisted ?? 0) +
    (metrics.waitlisted ?? 0);

  return (
    <DashboardVisual
      title="Application Status"
      description="Track where your submitted applications stand right now."
      overviewLabel="Active applications"
      overviewValueMetric="activeApplications"
      overviewTotalMetric="totalApplications"
      items={studentStatusItems}
      metrics={{ ...metrics, activeApplications }}
    />
  );
};

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
        <div className="page-heading">
          <div>
            <h2>Dashboard</h2>
            <p>{dashboard.role} overview</p>
          </div>
        </div>
        <MetricGrid metrics={dashboard.metrics} />
        {dashboard.role === "admin" ? (
          <AdminDashboardVisual metrics={dashboard.metrics} />
        ) : null}
        {dashboard.role === "mentor" ? (
          <MentorDashboardVisual metrics={dashboard.metrics} />
        ) : null}
        {dashboard.role === "student" ? (
          <StudentDashboardVisual metrics={dashboard.metrics} />
        ) : null}
      </section>
    </main>
  );
};
