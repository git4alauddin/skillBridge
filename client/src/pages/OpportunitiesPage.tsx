import { useEffect, useState, type FormEvent } from "react";

import { api, apiErrorMessage } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../state/useAuth";
import type {
  CreateOpportunityPayload,
  MyOpportunitiesResponse,
  Opportunity,
  OpportunityResponse,
  OpportunityType,
} from "../types";

const opportunityTypes: OpportunityType[] = [
  "project",
  "internship",
  "research",
  "hackathon",
  "collaboration",
];

export const OpportunitiesPage = () => {
  const { user } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
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

  // Load opportunities owned by the signed-in mentor.
  useEffect(() => {
    const loadOpportunities = async () => {
      if (user?.role !== "mentor") {
        setIsLoading(false);
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const response =
          await api.get<MyOpportunitiesResponse>("/opportunities/mine");
        setOpportunities(response.data.opportunities);
      } catch (loadError) {
        setError(apiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadOpportunities();
  }, [user]);

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
      setSuccessMessage("Opportunity created and sent for admin approval.");
      resetForm();
    } catch (createError) {
      setError(apiErrorMessage(createError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== "mentor") {
    return (
      <main className="page-content">
        <section className="page-panel">
          <h2>Opportunities</h2>
          <p>Admin opportunity approvals will be added in a later task.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-content">
      <section className="page-panel">
        <div className="page-heading">
          <div>
            <h2>My Listings</h2>
            <p>Create opportunities and track their approval status.</p>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {successMessage ? (
          <p className="form-success">{successMessage}</p>
        ) : null}

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
            {isSubmitting ? "Creating..." : "Create opportunity"}
          </button>
        </form>

        {isLoading ? <p>Loading opportunities...</p> : null}

        {!isLoading && opportunities.length === 0 ? (
          <p>No opportunities created yet.</p>
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
      </section>
    </main>
  );
};
