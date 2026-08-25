import { useEffect, useState } from "react";

import { api, apiErrorMessage } from "../api";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../state/useAuth";
import type {
  UpdateUserPayload,
  User,
  UserListResponse,
  UserResponse,
  UserStatus,
} from "../types";

export const UsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load users for the admin management workflow.
  useEffect(() => {
    const loadUsers = async () => {
      if (currentUser?.role !== "admin") {
        setUsers([]);
        setIsLoading(false);
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const response = await api.get<UserListResponse>("/users");
        setUsers(response.data.users);
      } catch (loadError) {
        setError(apiErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    };

    void loadUsers();
  }, [currentUser]);

  const handleStatusChange = async (user: User, status: UserStatus) => {
    setError("");
    setSuccessMessage("");
    setUpdatingId(user.id);

    const payload: UpdateUserPayload = { status };

    try {
      const response = await api.patch<UserResponse>(
        `/users/${user.id}`,
        payload,
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? response.data.user : item,
        ),
      );
      setSuccessMessage(`${response.data.user.fullName} is now ${status}.`);
    } catch (updateError) {
      setError(apiErrorMessage(updateError));
    } finally {
      setUpdatingId(null);
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <main className="page-content">
        <section className="page-panel">
          <h2>Users</h2>
          <p>This page is available to admins.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-content">
      <section className="page-panel">
        <div className="page-heading">
          <div>
            <h2>Users</h2>
            <p>Manage account access for students, mentors, and admins.</p>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {successMessage ? (
          <p className="form-success">{successMessage}</p>
        ) : null}

        {isLoading ? <p>Loading users...</p> : null}

        {!isLoading && users.length === 0 ? <p>No users found.</p> : null}

        <div className="application-list">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUser.id;
            const isSuspended = user.status === "suspended";

            return (
              <article className="application-card" key={user.id}>
                <div>
                  <h3>{user.fullName}</h3>
                  <StatusBadge status={user.status} />
                </div>

                <dl className="details-list">
                  <div>
                    <dt>Email</dt>
                    <dd>{user.email}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{user.role}</dd>
                  </div>
                  <div>
                    <dt>Joined</dt>
                    <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  disabled={!isSuspended || updatingId === user.id}
                  onClick={() => void handleStatusChange(user, "active")}
                >
                  {updatingId === user.id && isSuspended
                    ? "Activating..."
                    : "Activate"}
                </button>

                <button
                  type="button"
                  disabled={
                    isSuspended || isCurrentUser || updatingId === user.id
                  }
                  onClick={() => void handleStatusChange(user, "suspended")}
                >
                  {updatingId === user.id && !isSuspended
                    ? "Suspending..."
                    : "Suspend"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};
