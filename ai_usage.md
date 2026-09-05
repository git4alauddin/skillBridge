# AI Usage Declaration, Quantification, and Prompt History

Project: SkillBridge

Tool(s) used: ChatGPT / Codex

Estimated total AI contribution: 26.75%

Path note: Project file paths in this document are written relative to the `skillBridge` project folder. The guideline path is written relative to this file using `../docs/...`.

## Section 1: AI Usage Quantification Table

### Basis of Calculation

The calculation follows the AI Usage Quantification Guidelines provided in `../docs/AI Usage Quantification Guidelines.pdf`.

For each component:

```text
Component weight x estimated AI involvement = counted AI usage
```

Only partial AI involvement is counted where the final implementation was reviewed, understood, modified, or integrated manually by the student.

### Frontend (React - 40%)

| Component / Module | Description / Scope | Doc Weight (%) | Estimated AI Involvement (%) | Counted AI Usage (%) | AI Assistance Details | Student Understanding / Modification |
|---|---:|---:|---:|---:|---|---|
| Components (`client/src/components`) | Reusable UI components such as shell layout, metric grid, status badges, pagination controls, and auth guard | 10 | 50 | 5.00 | AI assisted with reusable UI structure, styling polish, and repeated component patterns | Final component behavior and usage were reviewed and adjusted manually |
| Pages (`client/src/pages`) | Main screens such as authentication, dashboard, browsing, users, opportunities, and applications | 15 | 45 | 6.75 | AI assisted with page layout, UI refinement, and some flow structuring, including the applications page | Page purpose, navigation flow, role-based behavior, and final integration were understood and verified manually |
| Services (`client/src/api.ts`) | Frontend API interaction layer | 5 | 25 | 1.25 | AI assisted with API call structure and debugging support | API endpoints and request/response handling were reviewed manually |
| Context / Hooks (`client/src/state`) | Auth context, provider, and shared auth hook | 5 | 20 | 1.00 | AI assisted with state-management structure and implementation suggestions | Authentication flow and state usage were reviewed and understood manually |
| Main setup (`client/src/App.tsx`, `client/src/main.tsx`) | Routing, app bootstrap, and component tree setup | 5 | 20 | 1.00 | AI assisted with routing/bootstrap structure | Final routing and app initialization were verified manually |

Frontend AI usage subtotal: 15.00%

### Backend (Express + TypeORM - 50%)

Note: In this project, controller-level endpoint logic is implemented mainly inside route files under `server/src/routes` instead of a separate `controllers` directory.

| Component / Module | Description / Scope | Doc Weight (%) | Estimated AI Involvement (%) | Counted AI Usage (%) | AI Assistance Details | Student Understanding / Modification |
|---|---:|---:|---:|---:|---|---|
| Entities (`server/src/entities`) | TypeORM models and enums for users, applications, opportunities, categories, uploaded files, and audit logs | 10 | 15 | 1.50 | AI assisted with reviewing model structure and TypeORM patterns | Entity relationships, fields, and project data model were understood manually |
| Controllers / API endpoint logic | Request handling and endpoint behavior, implemented mostly within route files | 15 | 25 | 3.75 | AI assisted with endpoint logic structure and debugging suggestions | Final endpoint behavior, request validation, and role-based access were reviewed manually |
| Services (`server/src/services`) | Business-logic service layer | 10 | 0 | 0.00 | No separate service layer was implemented | Not applicable |
| Routes (`server/src/routes`) | Route definitions for auth, users, health, dashboard, applications, and opportunities | 5 | 20 | 1.00 | AI assisted with route organization and API wiring | Route purpose and middleware usage were reviewed and understood manually |
| Middlewares (`server/src/middleware`) | Authentication, authorization, and error handling middleware | 5 | 20 | 1.00 | AI assisted with middleware implementation/debugging suggestions | Middleware behavior and role checks were reviewed manually |
| Utils (`server/src/utils`) | Helper functions for pagination, sanitization, and security | 5 | 40 | 2.00 | AI assisted with utility function implementation and edge-case handling | Utility purpose and final behavior were reviewed manually |

Backend AI usage subtotal: 9.25%

### Infrastructure / Optional

| Component / Module | Description / Scope | Doc Weight (%) | Estimated AI Involvement (%) | Counted AI Usage (%) | AI Assistance Details | Student Understanding / Modification |
|---|---:|---:|---:|---:|---|---|
| Database Config (`server/src/data-source.ts`, `server/src/config.ts`) | TypeORM and environment configuration | 6 | 25 | 1.50 | AI assisted with database configuration structure and troubleshooting | Configuration values and TypeORM setup were reviewed manually |
| Redis Config | Optional Redis caching setup | 4 | 0 | 0.00 | Redis was not used | Not applicable |
| App & Server Setup (`server/src/app.ts`, `server/src/index.ts`) | Express initialization, middleware mounting, route mounting, and server startup | 4 | 25 | 1.00 | AI assisted with Express setup and integration structure | Final app/server flow was reviewed and understood manually |

Infrastructure AI usage subtotal: 2.50%

Note: The provided guideline labels Infrastructure / Optional as 10%, while its listed component rows total 14%. This calculation follows the individual row weights shown in the guideline table.

### Total AI Usage

| Category | Counted AI Usage (%) |
|---|---:|
| Frontend | 15.00 |
| Backend | 9.25 |
| Infrastructure / Optional | 2.50 |
| Total | 26.75 |

The estimated total AI contribution is 26.75%, which is below the recommended 30% threshold mentioned in the provided AI Usage Quantification Guidelines.

## Section 2: Prompt History Submission

The following prompt history is arranged chronologically and grouped according to the actual development areas where AI assistance was used. The `Prompt Used` entries are included as the submitted record of prompts used during development, and AI response summaries are shortened to important excerpts only, as required by the guideline document.

### Entry 1

Module/Feature: Project Setup and Folder Structure

Related AI Usage Row: Main setup (`client/src/App.tsx`, `client/src/main.tsx`) - 1.00%; App & Server Setup (`server/src/app.ts`, `server/src/index.ts`) - 1.00%

Files/Areas Affected: `client/`, `server/`, `server/src/app.ts`, `server/src/index.ts`, `client/src/App.tsx`, `client/src/main.tsx`

Prompt Used:

```text
Help me set up the initial full-stack project structure for SkillBridge using React for the frontend and Express with TypeORM for the backend.
```

AI Response Summary:

```text
The AI assistant suggested a client/server folder structure, basic frontend and backend setup, and separation of files for routes, entities, middleware, and frontend pages.
```

Your Understanding/Modification:

```text
I used the suggested structure as a reference, reviewed the folders manually, and kept the organization that matched the project requirements.
```

### Entry 2

Module/Feature: Database Entities

Related AI Usage Row: Backend Entities (`server/src/entities`) - 1.50%

Files/Areas Affected: `server/src/entities/User.ts`, `server/src/entities/Category.ts`, `server/src/entities/Opportunity.ts`, `server/src/entities/Application.ts`, `server/src/entities/UploadedFile.ts`, `server/src/entities/AuditLog.ts`, `server/src/entities/enums.ts`

Prompt Used:

```text
Help design TypeORM entities for a SkillBridge platform with users, opportunities, applications, categories, uploaded files, and audit logs.
```

AI Response Summary:

```text
The AI assistant suggested entity fields, enum usage, and relationships between the main database models.
```

Your Understanding/Modification:

```text
I reviewed the entity relationships and connected them to the actual project features before finalizing the database model.
```

### Entry 3

Module/Feature: Authentication and Role-Based Access

Related AI Usage Row: Middlewares (`server/src/middleware`) - 1.00%; Controllers / API endpoint logic - partial contribution included in 3.75%

Files/Areas Affected: `server/src/middleware/auth.ts`, `server/src/routes/auth.ts`, `client/src/components/RequireAuth.tsx`

Prompt Used:

```text
Help implement authentication and role-based access control for the Express backend, including protected routes and user role checks.
```

AI Response Summary:

```text
The AI assistant suggested middleware flow for authentication, role verification, and consistent error handling for unauthorized requests.
```

Your Understanding/Modification:

```text
I reviewed how protected routes use the middleware, understood the role-checking logic, and verified that access control matched the project roles.
```

### Entry 4

Module/Feature: Backend Routes and API Logic

Related AI Usage Row: Controllers / API endpoint logic - 3.75%; Routes (`server/src/routes`) - 1.00%

Files/Areas Affected: `server/src/routes/auth.ts`, `server/src/routes/users.ts`, `server/src/routes/dashboard.ts`, `server/src/routes/opportunities.ts`, `server/src/routes/applications.ts`

Prompt Used:

```text
Help create and review Express routes for authentication, users, dashboard, opportunities, and applications using TypeORM queries.
```

AI Response Summary:

```text
The AI assistant suggested route organization, request handling, validation checks, and TypeORM query patterns for backend API endpoints.
```

Your Understanding/Modification:

```text
I checked the endpoint behavior manually, reviewed how each route reads or updates data, and ensured that the route logic matched the frontend requirements.
```

### Entry 5

Module/Feature: Backend Utility Functions

Related AI Usage Row: Utils (`server/src/utils`) - 2.00%

Files/Areas Affected: `server/src/utils/security.ts`, `server/src/utils/sanitize.ts`, `server/src/utils/pagination.ts`

Prompt Used:

```text
Help improve reusable backend utilities for pagination, sanitization, and security checks.
```

AI Response Summary:

```text
The AI assistant suggested reusable helper functions and edge-case handling for pagination and safer request handling.
```

Your Understanding/Modification:

```text
I reviewed where the utilities were used in the routes and verified the inputs, outputs, and edge-case behavior.
```

### Entry 6

Module/Feature: Frontend API Integration

Related AI Usage Row: Services (`client/src/api.ts`) - 1.25%

Files/Areas Affected: `client/src/api.ts`, `client/src/types.ts`

Prompt Used:

```text
Help structure the frontend API helper so React pages can call the backend endpoints for authentication, users, dashboard, opportunities, and applications.
```

AI Response Summary:

```text
The AI assistant suggested API helper functions, request patterns, and response-handling approaches for connecting the React frontend to the Express backend.
```

Your Understanding/Modification:

```text
I matched the frontend API calls with the backend route paths and reviewed how each page uses the returned data.
```

### Entry 7

Module/Feature: Frontend Authentication State

Related AI Usage Row: Context / Hooks (`client/src/state`) - 1.00%; Main setup - partial contribution included in 1.00%

Files/Areas Affected: `client/src/state/AuthContext.ts`, `client/src/state/AuthProvider.tsx`, `client/src/state/useAuth.ts`, `client/src/components/RequireAuth.tsx`

Prompt Used:

```text
Help review the React auth context, provider, and protected route handling for the SkillBridge frontend.
```

AI Response Summary:

```text
The AI assistant explained the auth provider structure, shared auth hook usage, and protected page flow.
```

Your Understanding/Modification:

```text
I checked how login state is stored and used across the app, then verified that protected pages respond correctly to authentication state.
```

### Entry 8

Module/Feature: Frontend Pages

Related AI Usage Row: Pages (`client/src/pages`) - 6.75%

Files/Areas Affected: `client/src/pages/AuthPage.tsx`, `client/src/pages/DashboardPage.tsx`, `client/src/pages/BrowsePage.tsx`, `client/src/pages/OpportunitiesPage.tsx`, `client/src/pages/ApplicationsPage.tsx`, `client/src/pages/UsersPage.tsx`

Prompt Used:

```text
Help improve the main React pages for SkillBridge, including dashboard, browse, opportunities, applications, users, and authentication pages.
```

AI Response Summary:

```text
The AI assistant suggested page layout improvements, cleaner section structure, loading/error states, and more consistent page behavior.
```

Your Understanding/Modification:

```text
I reviewed the final page flow, checked navigation between pages, and verified that the pages matched the intended user roles and project workflow.
```

### Entry 9

Module/Feature: Applications Page

Related AI Usage Row: Pages (`client/src/pages`) - partial contribution included in 6.75%

Files/Areas Affected: `client/src/pages/ApplicationsPage.tsx`, `server/src/routes/applications.ts`, `client/src/api.ts`

Prompt Used:

```text
Help refine ApplicationsPage.tsx so application status, actions, list display, loading state, and role-based behavior are clear and consistent.
```

AI Response Summary:

```text
The AI assistant suggested improvements to the applications page layout, status display, action placement, and user-facing state handling.
```

Your Understanding/Modification:

```text
I reviewed how the page connects to application data, understood the role-based flow, and finalized only the parts that fit the project behavior.
```

### Entry 10

Module/Feature: Reusable Frontend Components and Styling

Related AI Usage Row: Components (`client/src/components`) - 5.00%; Pages (`client/src/pages`) - partial styling contribution included in 6.75%

Files/Areas Affected: `client/src/components/Shell.tsx`, `client/src/components/MetricGrid.tsx`, `client/src/components/StatusBadge.tsx`, `client/src/components/PaginationControls.tsx`, `client/src/index.css`

Prompt Used:

```text
Help polish reusable frontend components such as the shell layout, metric cards, status badges, and pagination controls so the UI is consistent.
```

AI Response Summary:

```text
The AI assistant suggested reusable component improvements, styling refinements, and consistent UI patterns across pages.
```

Your Understanding/Modification:

```text
I reviewed how the components are reused across the frontend and adjusted the final styling to keep the interface consistent.
```

### Entry 11

Module/Feature: Final Debugging and Review

Related AI Usage Row: Final review was not counted as a separate row; it supports the partial AI involvement estimates already included in the 26.75% total.

Files/Areas Affected: `client/src`, `server/src`, `server/api-tests`, `README.md`

Prompt Used:

```text
Review the SkillBridge frontend and backend integration for possible bugs, missing checks, route mismatches, or inconsistent UI behavior.
```

AI Response Summary:

```text
The AI assistant provided a checklist for verifying API calls, route behavior, loading states, role access, frontend/backend integration, and final consistency.
```

Your Understanding/Modification:

```text
I used the response as a review checklist, manually checked the affected files, and kept only changes that I understood and could explain.
```

## Section 3: Declaration Note

AI tools were used as a support aid for selected frontend UI implementation, styling refinement, route/API wiring, helper utility implementation, and debugging support. The final code was reviewed, modified, integrated, and understood by the student.

Core project flow, role-based behavior, database relationships, API behavior, and final integration decisions were manually verified and can be explained by the student.

Approximate AI contribution: 26.75%

Tools/models used: ChatGPT / Codex
