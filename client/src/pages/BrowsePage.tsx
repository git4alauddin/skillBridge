import { useEffect, useMemo, useState } from "react";

import { api, apiErrorMessage } from "../api";
import { PaginationControls } from "../components/PaginationControls";
import { StatusBadge } from "../components/StatusBadge";
import type {
  ApplyResponse,
  Opportunity,
  OpportunityListResponse,
  OpportunityType,
  PaginationMeta,
} from "../types";

const opportunityTypes: Array<{ label: string; value: OpportunityType | "" }> = [
  { label: "All types", value: "" },
  { label: "Project", value: "project" },
  { label: "Internship", value: "internship" },
  { label: "Research", value: "research" },
  { label: "Hackathon", value: "hackathon" },
  { label: "Collaboration", value: "collaboration" },
];

const pageSize = 3;

export const BrowsePage = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<OpportunityType | "">("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [coverNotes, setCoverNotes] = useState<Record<string, string>>({});
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState<string[]>(
    [],
  );

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("q", search.trim());
    }

    if (type) {
      params.set("type", type);
    }

    params.set("page", String(page));
    params.set("limit", String(pageSize));

    return params.toString();
  }, [page, search, type]);

  // Load published opportunities using the current search and type filters.
  useEffect(() => {
    const loadOpportunities = async () => {
      setError("");
      setIsLoading(true);

      try {
        const response = await api.get<OpportunityListResponse>(
          `/opportunities${query ? `?${query}` : ""}`,
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
  }, [query]);

  const handleCoverNoteChange = (opportunityId: string, value: string) => {
    setCoverNotes((current) => ({
      ...current,
      [opportunityId]: value,
    }));
  };

  const handleApply = async (opportunity: Opportunity) => {
    setError("");
    setSuccessMessage("");
    setApplyingId(opportunity.id);

    try {
      await api.post<ApplyResponse>(`/opportunities/${opportunity.id}/apply`, {
        coverNote: coverNotes[opportunity.id] ?? "",
      });

      setAppliedOpportunityIds((current) => [...current, opportunity.id]);
      setSuccessMessage(`Applied to ${opportunity.title}.`);
    } catch (applyError) {
      setError(apiErrorMessage(applyError));
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <main className="page-content">
      <section className="page-panel">
        <div className="page-heading">
          <div>
            <h2>Browse Opportunities</h2>
            <p>Find published opportunities and apply as a student.</p>
          </div>

          <div className="filter-row">
            <label>
              Search
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, description, or category"
              />
            </label>

            <label>
              Type
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value as OpportunityType | "");
                  setPage(1);
                }}
              >
                {opportunityTypes.map((item) => (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {successMessage ? (
          <p className="form-success">{successMessage}</p>
        ) : null}

        {isLoading ? <p>Loading opportunities...</p> : null}

        {!isLoading && opportunities.length === 0 ? (
          <p>No published opportunities found.</p>
        ) : null}

        <div className="opportunity-grid">
          {opportunities.map((opportunity) => {
            const hasApplied = appliedOpportunityIds.includes(opportunity.id);

            return (
              <article className="opportunity-card" key={opportunity.id}>
                <div className="opportunity-summary">
                  <div>
                    <h3>{opportunity.title}</h3>
                    <StatusBadge status={opportunity.status} />
                  </div>

                  <p className="opportunity-description">
                    {opportunity.description}
                  </p>
                </div>

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

                <div className="apply-panel">
                  <label>
                    Cover note
                    <textarea
                      value={coverNotes[opportunity.id] ?? ""}
                      onChange={(event) =>
                        handleCoverNoteChange(
                          opportunity.id,
                          event.target.value,
                        )
                      }
                      placeholder="Write a short note for the mentor"
                      rows={4}
                    />
                  </label>

                  <div className="card-actions">
                    <button
                      type="button"
                      disabled={hasApplied || applyingId === opportunity.id}
                      onClick={() => void handleApply(opportunity)}
                    >
                      {hasApplied
                        ? "Applied"
                        : applyingId === opportunity.id
                          ? "Applying..."
                          : "Apply"}
                    </button>
                  </div>
                </div>
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
