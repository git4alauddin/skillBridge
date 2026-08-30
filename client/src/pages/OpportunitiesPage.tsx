import { useEffect, useState, type FormEvent } from "react";

import { api, apiErrorMessage } from "../api";
import { PaginationControls } from "../components/PaginationControls";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../state/useAuth";
import type {
  CreateOpportunityPayload,
  MyOpportunitiesResponse,
  Opportunity,
  OpportunityListResponse,
  OpportunityResponse,
  OpportunityStatus,
  OpportunityType,
  PaginationMeta,
} from "../types";

const opportunityTypes: OpportunityType[] = [
  "project",
  "internship",
  "research",
  "hackathon",
  "collaboration",
];

type AdminReviewStatusFilter = OpportunityStatus | "all";

const adminReviewStatusOptions: AdminReviewStatusFilter[] = [
  "pending_approval",
  "all",
  "published",
  "rejected",
  "draft",
  "closed",
];

const pageSize = 3;

export const OpportunitiesPage = () => {
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [adminStatusFilter, setAdminStatusFilter] =
    useState<AdminReviewStatusFilter>("pending_approval");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<OpportunityType>("internship");
  const [capacity, setCapacity] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [startDate, setStartDate] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewingAction, setReviewingAction] = useState<string | null>(null);

  // Load opportunity data for the signed-in user's workflow.
  useEffect(() => {
    const loadOpportunities = async () => {
      if (!user || user.role === "student") {
        setOpportunities([]);
        setPagination(null);
        setIsLoading(false);
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const response =
          user.role === "admin"
            ? await api.get<OpportunityListResponse>(
                `/opportunities/admin/review?status=${adminStatusFilter}&page=${page}&limit=${pageSize}`,
              )
            : await api.get<MyOpportunitiesResponse>(
                `/opportunities/mine?page=${page}&limit=${pageSize}`,
              );

        setOpportunities(response.data.opportunities);
        setPagination(response.data.pagination);
      } catch (loadError) {
        setError(apiErrorMessage(loadError));
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadOpportunities();
  }, [adminStatusFilter, page, user]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("internship");
    setCapacity(1);
    setDeadline("");
    setStartDate("");
  };

  // Create a pending opportunity for admin approval.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const payload: CreateOpportunityPayload = {
      title,
      description,
      type,
      capacity,
      deadline,
      startDate: startDate || undefined,
      imageUrl: "",
      attachmentUrl: "",
    };

    try {
      const response = await api.post<OpportunityResponse>(
        "/opportunities",
        payload,
      );

      setOpportunities((current) => [response.data.opportunity, ...current]);
      setSuccessMessage("Opportunity submitted for admin review.");
      resetForm();
    } catch (createError) {
      setError(apiErrorMessage(createError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminDecision = async (
    opportunity: Opportunity,
    action: "approve" | "reject",
  ) => {
    setError("");
    setSuccessMessage("");
    setReviewingAction(`${opportunity.id}:${action}`);

    try {
      const response = await api.post<OpportunityResponse>(
        `/opportunities/${opportunity.id}/${action}`,
      );
      const updatedOpportunity = response.data.opportunity;

      setOpportunities((current) => {
        if (
          adminStatusFilter !== "all" &&
          updatedOpportunity.status !== adminStatusFilter
        ) {
          return current.filter((item) => item.id !== updatedOpportunity.id);
        }

        return current.map((item) =>
          item.id === updatedOpportunity.id ? updatedOpportunity : item,
        );
      });
      setSuccessMessage(
        `${updatedOpportunity.title} ${
          action === "approve" ? "approved" : "rejected"
        }.`,
      );
    } catch (decisionError) {
      setError(apiErrorMessage(decisionError));
    } finally {
      setReviewingAction(null);
    }
  };

  if (user?.role === "admin") {
    return (
      <main className="page-content">
        <section className="page-panel">
          <div className="page-heading">
            <div>
              <h2>Approvals</h2>
              <p>Review opportunities before they appear in public browsing.</p>
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          {successMessage ? (
            <p className="form-success">{successMessage}</p>
          ) : null}

          <label>
            Review status
            <select
              value={adminStatusFilter}
              onChange={(event) => {
                setAdminStatusFilter(
                  event.target.value as AdminReviewStatusFilter,
                );
                setPage(1);
              }}
            >
              {adminReviewStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          {isLoading ? <p>Loading opportunities...</p> : null}

          {!isLoading && opportunities.length === 0 ? (
            <p>No opportunities found for this review filter.</p>
          ) : null}

          <div className="opportunity-grid">
            {opportunities.map((opportunity) => (
              <article className="opportunity-card" key={opportunity.id}>
                <div>
                  <h3>{opportunity.title}</h3>
                  <StatusBadge status={opportunity.status} />
                </div>

                <p>{opportunity.description}</p>

                <dl className="details-list">
                  <div>
                    <dt>Owner</dt>
                    <dd>{opportunity.owner.fullName}</dd>
                  </div>
                  <div>
                    <dt>Type</dt>
                    <dd>{opportunity.type}</dd>
                  </div>
                  <div>
                    <dt>Capacity</dt>
                    <dd>{opportunity.capacity}</dd>
                  </div>
                  <div>
                    <dt>Deadline</dt>
                    <dd>
                      {new Date(opportunity.deadline).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>

                <div className="admin-actions">
                  <button
                    type="button"
                    disabled={
                      reviewingAction !== null ||
                      opportunity.status === "published"
                    }
                    onClick={() =>
                      void handleAdminDecision(opportunity, "approve")
                    }
                  >
                    {reviewingAction === `${opportunity.id}:approve`
                      ? "Approving..."
                      : "Approve"}
                  </button>

                  <button
                    className="button-danger"
                    type="button"
                    disabled={
                      reviewingAction !== null ||
                      opportunity.status === "rejected"
                    }
                    onClick={() =>
                      void handleAdminDecision(opportunity, "reject")
                    }
                  >
                    {reviewingAction === `${opportunity.id}:reject`
                      ? "Rejecting..."
                      : "Reject"}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <PaginationControls
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setPage}
          />
        </section>
      </main>
    );
  }

  if (user?.role !== "mentor") {
    return (
      <main className="page-content">
        <section className="page-panel">
          <h2>Opportunities</h2>
          <p>This page is available to mentors and admins.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-content">
      <section className="page-panel">
        <div className="mentor-listing-layout">
          <section className="mentor-listings-panel">
            <div className="page-heading">
              <div>
                <h2>My Opportunities</h2>
                <p>
                  Manage your listings and submit new opportunities for review.
                </p>
              </div>
            </div>

            {error ? <p className="form-error">{error}</p> : null}
            {successMessage ? (
              <p className="form-success">{successMessage}</p>
            ) : null}

            {isLoading ? <p>Loading your opportunities...</p> : null}

            {!isLoading && opportunities.length === 0 ? (
              <p>No opportunities yet. Create your first listing from the form.</p>
            ) : null}

            <div className="opportunity-grid">
              {opportunities.map((opportunity) => (
                <article className="opportunity-card" key={opportunity.id}>
                  <div>
                    <h3>{opportunity.title}</h3>
                    <StatusBadge status={opportunity.status} />
                  </div>

                  <p>{opportunity.description}</p>

                  <dl className="details-list">
                    <div>
                      <dt>Type</dt>
                      <dd>{opportunity.type}</dd>
                    </div>
                    <div>
                      <dt>Capacity</dt>
                      <dd>{opportunity.capacity}</dd>
                    </div>
                    <div>
                      <dt>Deadline</dt>
                      <dd>
                        {new Date(opportunity.deadline).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <PaginationControls
              alwaysVisible
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={setPage}
            />
          </section>

          <div className="vertical-divider" aria-hidden="true" />

          <aside className="mentor-form-panel">
            <div className="section-heading">
              <h3>Create Opportunity</h3>
              <p>Share the details students need before submitting for review.</p>
            </div>

            <form className="opportunity-form" onSubmit={handleSubmit}>
              <label>
                Title
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                  minLength={4}
                  maxLength={160}
                />
              </label>

              <label>
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  minLength={20}
                  rows={5}
                />
              </label>

              <label>
                Type
                <select
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as OpportunityType)
                  }
                >
                  {opportunityTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Capacity
                <input
                  type="number"
                  value={capacity}
                  onChange={(event) => setCapacity(Number(event.target.value))}
                  required
                  min={1}
                  max={500}
                />
              </label>

              <label>
                Deadline
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                  required
                />
              </label>

              <label>
                Start date
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit for review"}
              </button>
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
};
