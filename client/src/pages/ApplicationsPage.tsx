import { useEffect, useState } from "react";

import { api, apiErrorMessage } from "../api";
import { PaginationControls } from "../components/PaginationControls";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../state/useAuth";
import type {
  Application,
  ApplicationListResponse,
  ApplicationResponse,
  ApplicationStatus,
  PaginationMeta,
} from "../types";

const mentorReviewStatuses: ApplicationStatus[] = [
  "shortlisted",
  "selected",
  "rejected",
  "waitlisted",
  "completed",
];

const defaultReviewStatus = (status: ApplicationStatus): ApplicationStatus =>
  mentorReviewStatuses.includes(status) ? status : "shortlisted";

const pageSize = 3;

export const ApplicationsPage = () => {
  const { user } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reviewStatuses, setReviewStatuses] = useState<
    Record<string, ApplicationStatus>
  >({});
  const [mentorNotes, setMentorNotes] = useState<Record<string, string>>({});

  // Load applications visible to the signed-in user.
  useEffect(() => {
    const loadApplications = async () => {
      setError("");
      setIsLoading(true);

      try {
        const response = await api.get<ApplicationListResponse>(
          `/applications?page=${page}&limit=${pageSize}`,
        );
        const loadedApplications = response.data.applications;

        setApplications(loadedApplications);
        setPagination(response.data.pagination);
        setReviewStatuses(
          Object.fromEntries(
            loadedApplications.map((application) => [
              application.id,
              defaultReviewStatus(application.status),
            ]),
          ),
        );
        setMentorNotes(
          Object.fromEntries(
            loadedApplications.map((application) => [
              application.id,
              application.mentorNote || "",
            ]),
          ),
        );
      } catch (loadError) {
        setError(apiErrorMessage(loadError));
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, [page]);

  const handleWithdraw = async (application: Application) => {
    setError("");
    setSuccessMessage("");
    setWithdrawingId(application.id);

    try {
      const response = await api.post<ApplicationResponse>(
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

  const handleStatusUpdate = async (application: Application) => {
    setError("");
    setSuccessMessage("");
    setUpdatingId(application.id);

    try {
      const response = await api.patch<ApplicationResponse>(
        `/applications/${application.id}/status`,
        {
          status:
            reviewStatuses[application.id] ??
            defaultReviewStatus(application.status),
          mentorNote: mentorNotes[application.id] || undefined,
        },
      );

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? response.data.application : item,
        ),
      );
      setReviewStatuses((current) => ({
        ...current,
        [application.id]: defaultReviewStatus(response.data.application.status),
      }));
      setMentorNotes((current) => ({
        ...current,
        [application.id]: response.data.application.mentorNote || "",
      }));
      setSuccessMessage(`Updated application for ${application.student.fullName}.`);
    } catch (updateError) {
      setError(apiErrorMessage(updateError));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="page-content">
      <section className="page-panel">
        <div className="page-heading">
          <div>
            <h2>Applications</h2>
            <p>
              {user?.role === "mentor"
                ? "Review applications for your opportunities."
                : "Track submitted applications and their review status."}
            </p>
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
            const canReview =
              user?.role === "mentor" && application.status !== "withdrawn";

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
                  {user?.role === "mentor" ? (
                    <div>
                      <dt>Student</dt>
                      <dd>{application.student.fullName}</dd>
                    </div>
                  ) : null}
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

                {user?.role === "student" ? (
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
                ) : null}

                {canReview ? (
                  <div className="review-controls">
                    <label>
                      Review status
                      <select
                        value={
                          reviewStatuses[application.id] ??
                          defaultReviewStatus(application.status)
                        }
                        onChange={(event) =>
                          setReviewStatuses((current) => ({
                            ...current,
                            [application.id]: event.target
                              .value as ApplicationStatus,
                          }))
                        }
                      >
                        {mentorReviewStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Mentor note
                      <textarea
                        value={mentorNotes[application.id] || ""}
                        onChange={(event) =>
                          setMentorNotes((current) => ({
                            ...current,
                            [application.id]: event.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </label>

                    <button
                      type="button"
                      disabled={updatingId === application.id}
                      onClick={() => void handleStatusUpdate(application)}
                    >
                      {updatingId === application.id
                        ? "Updating..."
                        : "Update review"}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <PaginationControls
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
};
