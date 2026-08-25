import { useEffect, useState } from "react";

import { api, apiErrorMessage } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import type {
  Application,
  ApplicationListResponse,
  WithdrawApplicationResponse,
} from "../types";

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  // Load applications visible to the signed-in user.
  useEffect(() => {
    const loadApplications = async () => {
      setError("");
      setIsLoading(true);

      try {
        const response = await api.get<ApplicationListResponse>("/applications");
        setApplications(response.data.applications);
      } catch (loadError) {
        setError(apiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, []);

  const handleWithdraw = async (application: Application) => {
    setError("");
    setSuccessMessage("");
    setWithdrawingId(application.id);

    try {
      const response = await api.post<WithdrawApplicationResponse>(
        `/applications/${application.id}/withdraw`,
      );

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? response.data.application : item,
        ),
      );
      setSuccessMessage(`Withdrawn from ${application.opportunity.title}.`);
    } catch (withdrawError) {
      setError(apiErrorMessage(withdrawError));
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <main className="page-content">
      <section className="page-panel">
        <div className="page-heading">
          <div>
            <h2>Applications</h2>
            <p>Track submitted applications and their review status.</p>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {successMessage ? (
          <p className="form-success">{successMessage}</p>
        ) : null}

        {isLoading ? <p>Loading applications...</p> : null}

        {!isLoading && applications.length === 0 ? (
          <p>No applications found.</p>
        ) : null}

        <div className="application-list">
          {applications.map((application) => {
            const isWithdrawn = application.status === "withdrawn";

            return (
              <article className="application-card" key={application.id}>
                <div>
                  <h3>{application.opportunity.title}</h3>
                  <StatusBadge status={application.status} />
                </div>

                <p>{application.opportunity.description}</p>

                <dl className="details-list">
                  <div>
                    <dt>Type</dt>
                    <dd>{application.opportunity.type}</dd>
                  </div>
                  <div>
                    <dt>Deadline</dt>
                    <dd>
                      {new Date(
                        application.opportunity.deadline,
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt>Applied</dt>
                    <dd>
                      {new Date(application.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>

                {application.coverNote ? (
                  <p>Cover note: {application.coverNote}</p>
                ) : null}

                {application.mentorNote ? (
                  <p>Mentor note: {application.mentorNote}</p>
                ) : null}

                <button
                  type="button"
                  disabled={isWithdrawn || withdrawingId === application.id}
                  onClick={() => void handleWithdraw(application)}
                >
                  {isWithdrawn
                    ? "Withdrawn"
                    : withdrawingId === application.id
                      ? "Withdrawing..."
                      : "Withdraw"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};
