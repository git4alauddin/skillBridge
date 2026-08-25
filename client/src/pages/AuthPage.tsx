import { useState, type FormEvent } from "react";

import { apiErrorMessage } from "../api";
import { useAuth } from "../state/useAuth";
import type { Role } from "../types";

type AuthMode = "login" | "register";

export const AuthPage = () => {
  const { login, register, user } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Extract<Role, "student" | "mentor">>(
    "student",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === "register";

  // Submit the active auth flow without reloading the page.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register({
          fullName,
          email,
          password,
          role,
        });
      } else {
        await login({
          email,
          password,
        });
      }
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <h1>SkillBridge</h1>
          <p>You are signed in as {user.fullName}.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-header">
          <h1>SkillBridge</h1>
          <p>Sign in or create an account to continue.</p>
        </div>

        <div className="auth-tabs" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegisterMode ? (
            <>
              <label>
                Full name
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </label>

              <label>
                Role
                <select
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as Extract<Role, "student" | "mentor">)
                  }
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                </select>
              </label>
            </>
          ) : null}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : isRegisterMode
                ? "Create account"
                : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
};
