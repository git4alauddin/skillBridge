# SkillBridge

## 1. Title Page

### Project Report

**Project Title:** SkillBridge  
**Project Type:** Full-Stack Role-Based Opportunity Management Platform  
**Course/Lab:** Application Development Lab  
**Student Name:** Md Alauddin Ansari  
**Roll Number:** 22f1001182  
**Institution:** IIT Madras  
**Submission Date:** 5 September 2026

---

## Table of Contents

1. Title Page
2. Abstract
3. Introduction
4. Objectives
5. Technology Stack
6. System Architecture
7. Database Design
8. Main Features and Modules
9. Implementation Details
10. Testing and Verification
11. AI Usage Declaration
12. Limitations
13. Future Scope
14. Conclusion
15. Appendix A: Local Setup and Build Instructions

---

## 2. Abstract

SkillBridge is a full-stack, role-based web application for managing academic projects, internships, research tasks, hackathon openings, and collaboration opportunities. The platform is designed to replace informal opportunity sharing through messages, notice boards, and scattered communication channels with a structured workflow for publishing, applying to, reviewing, and tracking opportunities.

The system supports three main user roles: students, mentors or recruiters, and administrators. Mentors and recruiters can create and manage opportunities, administrators can approve or reject submitted opportunities and manage users, and students can browse published opportunities, submit applications before deadlines, track application status, and withdraw applications when required. Role-specific dashboards provide relevant metrics for each type of user.

The frontend is implemented using React, TypeScript, and Vite, with React Router for navigation and Axios for backend API communication. The backend is implemented using Node.js, Express, TypeScript, TypeORM, JWT authentication, bcrypt password hashing, and Zod validation. PostgreSQL is used as the relational database, with Docker Compose supporting local database infrastructure.

## 3. Introduction

Students often discover academic projects, internships, research tasks, hackathon openings, and collaboration opportunities through informal channels such as classroom announcements, messaging groups, emails, notice boards, or personal networks. These methods can make opportunities difficult to track, compare, and manage. Students may miss relevant openings, mentors may struggle to organize applications, and administrators may not have a clear view of platform activity.

SkillBridge addresses this problem by providing a centralized platform for opportunity management. It introduces a structured workflow in which mentors or recruiters create opportunities, administrators review and approve them, students browse and apply to published listings, and mentors review submitted applications. This makes the overall process more organized, transparent, and easier to monitor.

The project is designed around role-specific access and workflows. Students, mentors or recruiters, and administrators each interact with the platform through features relevant to their responsibilities. The backend enforces authentication, authorization, ownership checks, application rules, deadline handling, and capacity constraints, while the frontend presents these workflows through protected pages, dashboards, lists, forms, and reusable interface components.

SkillBridge therefore combines a practical user-facing application with core full-stack development concepts, including frontend routing, API integration, backend middleware, database modeling, role-based access control, validation, and persistent storage.

## 4. Objectives

The main objectives of SkillBridge are:

1. To provide a centralized platform for managing academic projects, internships, research tasks, hackathon openings, and collaboration opportunities.
2. To allow mentors and recruiters to create and manage opportunity listings.
3. To allow administrators to review, approve, or reject opportunities before they are published.
4. To allow students to browse published opportunities and apply before the deadline.
5. To allow students to track their application status and withdraw applications when required.
6. To allow mentors and recruiters to review applications submitted for their own opportunities.
7. To provide role-specific dashboards for administrators, mentors or recruiters, and students.
8. To enforce authentication, role-based authorization, ownership checks, application rules, and capacity constraints through backend logic.
9. To use a structured relational database model for users, opportunities, applications, categories, uploaded files, and audit logs.
10. To provide a responsive frontend interface with reusable components, protected routes, and consistent user workflows.

## 5. Technology Stack

SkillBridge uses a full-stack JavaScript and TypeScript-based technology stack.

### Frontend Technologies

| Technology | Purpose |
|---|---|
| React | Building the user interface as reusable components and pages |
| TypeScript | Adding type safety to frontend code |
| Vite | Development server and production build tool |
| React Router | Client-side routing and protected page navigation |
| Axios | Sending HTTP requests from the frontend to the backend API |
| Lucide React | Providing icons for the user interface |
| CSS | Styling, layout, responsiveness, and visual polish |

### Backend Technologies

| Technology | Purpose |
|---|---|
| Node.js | Server-side JavaScript runtime |
| Express | REST API server, routing, and middleware handling |
| TypeScript | Adding type safety to backend code |
| TypeORM | Database entities, relationships, and repository-based database access |
| JWT | Token-based authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| Helmet, CORS, express-rate-limit | Security headers, cross-origin access control, and request rate limiting |

### Database and Infrastructure

| Technology | Purpose |
|---|---|
| PostgreSQL | Relational database for persistent storage |
| Docker Compose | Local PostgreSQL database setup |
| npm | Dependency management and project scripts |

This stack supports a clear separation between the React frontend, Express backend, and PostgreSQL database, while TypeScript improves maintainability across both client and server code.

## 6. System Architecture

SkillBridge follows a layered full-stack architecture. The application is divided into a user layer, frontend layer, backend API layer, and data layer. Each layer has a separate responsibility, which makes the system easier to develop, test, and maintain.

### User Layer

The user layer consists of the three main roles supported by the system:

- **Admin:** Reviews opportunities, manages users, views applications, and monitors platform-level metrics.
- **Mentor or Recruiter:** Creates opportunities, manages owned listings, and reviews applications submitted by students.
- **Student:** Browses published opportunities, applies before deadlines, tracks application status, and withdraws applications when needed.

Each role has a different set of permissions and a different workflow in the application.

### Frontend Layer

The frontend layer is implemented using React and TypeScript. It contains page components, reusable UI components, authentication state, protected routes, and an Axios-based API client. React Router handles navigation, while protected route components restrict access based on authentication and user role.

The frontend communicates with the backend through HTTP API requests. After login, the authentication token is stored on the client side and sent with protected API requests. This allows the frontend to show role-specific dashboards, actions, and pages.

### Backend API Layer

The backend layer is implemented using Express and TypeScript. It exposes REST-style route modules for authentication, users, opportunities, applications, and dashboards. Middleware handles common backend concerns such as JSON parsing, security headers, CORS, rate limiting, authentication, authorization, and error handling.

Request validation is handled with Zod before data is processed. The backend also enforces business rules such as ownership checks, role permissions, opportunity approval status, application deadlines, duplicate application prevention, and capacity limits.

### Data Layer

The data layer uses PostgreSQL with TypeORM. TypeORM entities define the database tables and relationships used by the application. The main entities are `User`, `Category`, `Opportunity`, `Application`, `UploadedFile`, and `AuditLog`.

Backend route logic accesses the database through TypeORM repositories. This keeps database operations connected to typed entity models and supports relationships between users, opportunities, applications, uploaded files, and audit records.

### Request Flow

A typical request in SkillBridge follows this flow:

1. The user performs an action in the React frontend.
2. The frontend sends an HTTP request through the Axios API client.
3. The Express backend receives the request and applies middleware.
4. Authentication and role checks are applied for protected operations.
5. Request data is validated.
6. The route handler executes the required business logic.
7. TypeORM reads from or writes to PostgreSQL.
8. The backend returns a response to the frontend.
9. The frontend updates the relevant page, dashboard, table, or status display.

This architecture supports separation of concerns between presentation, API logic, security rules, and persistent data storage.

## 7. Database Design

SkillBridge uses PostgreSQL as the relational database and TypeORM for entity modeling. The database is designed around users, opportunities, applications, categories, uploaded file metadata, and audit records. UUID values are used as primary keys for the main entities.

### Main Entities

| Entity | Table | Purpose |
|---|---|---|
| `User` | `users` | Stores user identity, login credentials, role, account status, and timestamps |
| `Category` | `categories` | Stores opportunity categories and whether each category is active |
| `Opportunity` | `opportunities` | Stores opportunity details, type, capacity, deadline, status, owner, category, and optional media links |
| `Application` | `applications` | Connects students to opportunities and stores application status, cover note, mentor note, and timestamps |
| `UploadedFile` | `uploaded_files` | Stores uploaded file metadata and optional links to an application or opportunity |
| `AuditLog` | `audit_logs` | Stores audit activity such as action name, entity type, entity ID, metadata, actor, and creation time |

### User Entity

The `User` entity stores the full name, email address, password hash, role, account status, creation time, and update time. The email field is unique. User roles are represented using an enum with `admin`, `mentor`, and `student` values. Account status is represented as either `active` or `suspended`.

### Category Entity

The `Category` entity stores a unique category name and an `isActive` flag. Categories are used to classify opportunities and allow the application to organize listings by subject or domain.

### Opportunity Entity

The `Opportunity` entity stores the main listing information, including title, description, opportunity type, capacity, deadline, optional start date, optional image URL, optional attachment URL, status, owner, category, and timestamps. Opportunity types include project, internship, research, hackathon, and collaboration. Opportunity statuses include draft, pending approval, published, closed, and rejected.

Each opportunity belongs to one owner, represented by a required relationship to the `User` entity. An opportunity can also optionally belong to a category.

### Application Entity

The `Application` entity represents a student's application to an opportunity. It stores the application status, optional cover note, optional mentor note, student relationship, opportunity relationship, and timestamps. A unique constraint is applied to the student and opportunity combination, which prevents the same student from applying to the same opportunity more than once.

Application statuses include pending, shortlisted, selected, rejected, waitlisted, withdrawn, and completed.

### UploadedFile Entity

The `UploadedFile` entity stores file metadata such as original name, stored name, MIME type, file size, URL, and creation time. It can optionally be linked to either an application or an opportunity.

### AuditLog Entity

The `AuditLog` entity records platform activity. It stores the action name, entity type, entity ID, optional JSON metadata, optional actor, and creation timestamp. This structure allows the system to record important activity in a consistent format.

### Key Relationships

The main database relationships are:

1. A user can own multiple opportunities.
2. A category can be associated with multiple opportunities.
3. An opportunity can receive multiple applications.
4. A student can submit multiple applications.
5. Each application belongs to one student and one opportunity.
6. Uploaded files can be connected to applications or opportunities.
7. Audit records can optionally reference the user who performed an action.

These relationships support ownership checks, application tracking, category-based organization, duplicate application prevention, and audit activity.

## 8. Main Features and Modules

SkillBridge is organized into feature modules that support the complete opportunity management workflow from user login to application review.

### Authentication and User Session

The authentication module supports registration, login, and retrieval of the current logged-in user. Student and mentor accounts can be registered through the public authentication flow. After login, the backend issues a JWT token, and the frontend stores the session information for authenticated API access.

The frontend authentication state is managed through context, provider, and hook files. Protected routes use this state to decide whether a user can access a page.

### Role-Based Access Control

SkillBridge uses role-based access control for both backend APIs and frontend navigation. The supported roles are admin, mentor, and student.

Admin users can review opportunities, manage users, view platform-level applications, and access administrative dashboard metrics. Mentors can create and manage their own opportunities and review applications for those opportunities. Students can browse published opportunities, apply, track application statuses, and withdraw applications.

### Opportunity Management

The opportunity module allows mentors and recruiters to create opportunity listings with details such as title, description, type, capacity, deadline, optional start date, optional image URL, optional attachment URL, and category. Newly created opportunities follow an approval workflow before they become visible for public browsing.

Administrators can review opportunities and approve or reject them. Mentors can manage only the opportunities they own, which is enforced through backend ownership checks.

### Student Opportunity Browsing

Students can browse published opportunities from the frontend. The browse page supports search and type filters, allowing students to find relevant projects, internships, research tasks, hackathons, and collaboration opportunities. Students can apply directly from the published opportunity listing.

### Application Workflow

The application module manages student applications to opportunities. Students can submit an application with an optional cover note, view their submitted applications, track status changes, and withdraw applications when required.

The backend prevents duplicate applications by using a unique student-and-opportunity constraint. It also checks whether an opportunity is published, whether the deadline is valid, and whether the capacity rules allow additional selected applications.

### Mentor Application Review

Mentors can view applications submitted to their own opportunities and update application review statuses. Supported statuses include pending, shortlisted, selected, rejected, waitlisted, withdrawn, and completed. Mentors can also provide review notes during the application review process.

This workflow allows mentors to manage the selection process while preventing them from reviewing applications for opportunities they do not own.

### Admin User Management

The user management module allows administrators to view users and update account status. This supports administrative control over active and suspended accounts. Access to this module is restricted to admin users.

### Role-Specific Dashboards

Dashboard data is generated according to the logged-in user's role. Admin dashboards show platform-level metrics, mentor dashboards focus on owned opportunities and received applications, and student dashboards summarize submitted applications and application statuses.

These dashboards help each user type understand the information most relevant to their workflow.

### Pagination and List Controls

The project includes pagination support for list-based workflows such as users, opportunities, and applications. Backend endpoints return paginated responses, and the frontend uses reusable pagination controls to navigate through records consistently.

### Reusable Frontend Components

The frontend uses shared components such as the application shell, protected route component, metric grid, status badge, and pagination controls. These components reduce repeated code and keep the interface consistent across pages.

## 9. Implementation Details

This section describes how the main parts of SkillBridge are implemented in the codebase.

### Frontend Implementation

The frontend is located in the `client/` folder and is implemented with React, TypeScript, and Vite. The main application routing is defined in `client/src/App.tsx`. It uses React Router to define the public authentication route and the protected application routes.

The main frontend routes are:

| Route | Page | Access |
|---|---|---|
| `/auth` | `AuthPage` | Public login and registration |
| `/` | `DashboardPage` | Authenticated users |
| `/browse` | `BrowsePage` | Students |
| `/applications` | `ApplicationsPage` | Students, mentors, and admins |
| `/opportunities` | `OpportunitiesPage` | Mentors and admins |
| `/users` | `UsersPage` | Admins |

Protected routing is handled through the `RequireAuth` component. The `Shell` component provides the common authenticated layout and role-specific navigation links.

### Frontend State and API Layer

Authentication state is implemented in `client/src/state`. The auth context, provider, and hook allow the application to store the logged-in user, manage login/logout behavior, and expose session state to pages and components.

The API layer is implemented in `client/src/api.ts`. It uses Axios to communicate with the backend API and sends authenticated requests using the stored JWT token. Frontend TypeScript types are defined in `client/src/types.ts`, which helps keep API response usage consistent across pages.

### Frontend Pages and Components

The frontend pages are organized under `client/src/pages`:

- `AuthPage.tsx` handles login and registration.
- `DashboardPage.tsx` displays role-specific dashboard metrics.
- `BrowsePage.tsx` allows students to browse and apply to published opportunities.
- `ApplicationsPage.tsx` displays application records and supports student withdrawal and mentor review actions.
- `OpportunitiesPage.tsx` supports mentor opportunity management and admin opportunity review.
- `UsersPage.tsx` supports admin user management.

Reusable frontend components are stored under `client/src/components`. These include:

- `Shell.tsx` for the authenticated layout.
- `RequireAuth.tsx` for protected route behavior.
- `MetricGrid.tsx` for dashboard metric cards.
- `StatusBadge.tsx` for consistent status display.
- `PaginationControls.tsx` for paginated list navigation.

The main styling is handled through `client/src/index.css`, which defines the responsive layout, cards, forms, lists, status badges, dashboards, and pagination styling.

### Backend Implementation

The backend is located in the `server/` folder and is implemented with Express and TypeScript. The Express application is created in `server/src/app.ts`, while `server/src/index.ts` starts the server and initializes the application runtime.

The backend applies global middleware for security headers, CORS, JSON request parsing, and rate limiting. It then mounts route modules for authentication, health checks, opportunities, applications, dashboards, and users. Not-found and error-handling middleware are registered at the end of the middleware chain.

### Backend Routes

Backend route modules are stored under `server/src/routes`:

| Route File | Main Responsibility |
|---|---|
| `auth.ts` | Registration, login, and current-user APIs |
| `health.ts` | Backend health check endpoint |
| `opportunities.ts` | Opportunity creation, listing, update, approval, rejection, and public browsing |
| `applications.ts` | Student applications, application listing, mentor review, and withdrawal |
| `dashboard.ts` | Role-specific dashboard metrics |
| `users.ts` | Admin user listing and status updates |

In this project, controller-level logic is implemented directly inside the route files instead of using a separate `controllers/` folder. This keeps the backend structure simple while still separating functionality by feature area.

### Middleware, Validation, and Utilities

Authentication and authorization are handled in `server/src/middleware/auth.ts`. This middleware verifies JWT tokens and checks whether the logged-in user has permission to access protected endpoints. Error handling is implemented in `server/src/middleware/errors.ts`.

Request validation is performed using Zod schemas inside the route modules. This helps ensure that incoming request data has the expected structure before database operations are performed.

Reusable backend helper functions are stored under `server/src/utils`:

- `security.ts` contains password hashing and token-related helpers.
- `sanitize.ts` contains response sanitization helpers used to avoid returning sensitive fields such as password hashes.
- `pagination.ts` contains pagination helpers for list endpoints.

### Database Configuration

Database configuration is handled through `server/src/config.ts` and `server/src/data-source.ts`. Environment variables are documented in `server/.env.example`. The project uses PostgreSQL as the database and TypeORM to register entities and connect the backend to the database.

For local development, PostgreSQL is supported through `docker-compose.yml`.

### Business Rule Enforcement

The backend enforces important business rules to keep workflows consistent:

1. Only authenticated users can access protected operations.
2. Role checks restrict admin, mentor, and student actions.
3. Mentors can manage only their own opportunities.
4. Students can apply only to published opportunities.
5. Duplicate applications by the same student to the same opportunity are prevented.
6. Application withdrawal is limited to the student who submitted the application.
7. Mentor review actions are limited to applications for opportunities owned by that mentor.
8. Application capacity rules are checked during selection workflows.

These rules ensure that the frontend interface is backed by server-side validation and authorization, not only client-side controls.

## 10. Testing and Verification

SkillBridge was verified through a combination of manual API tests, frontend workflow checks, and build/lint scripts. The project includes HTTP request files for checking backend behavior and npm scripts for validating the frontend and backend code.

### Backend API Verification

Manual backend API tests are stored in `server/api-tests`. These files are used to verify route behavior through HTTP requests during development.

| Test File | Verification Area |
|---|---|
| `auth.http` | Registration, login, current-user access, and authentication flow |
| `rbac.http` | Role-based access control checks |
| `health.http` | Backend health endpoint |
| `opportunities.http` | Opportunity creation, listing, update, approval, rejection, and browsing workflows |
| `applications.http` | Student application, application listing, mentor review, and withdrawal workflows |
| `dashboard.http` | Role-specific dashboard responses |
| `users.http` | Admin user listing and account status updates |

These API checks help confirm that protected endpoints require authentication, role-based access rules are enforced, and the main backend workflows behave as expected.

### Frontend Verification

Frontend verification focuses on the role-based user workflows implemented in the React application. The main workflows checked are:

1. Login and registration through the authentication page.
2. Protected route behavior for unauthenticated users.
3. Role-specific navigation in the authenticated shell.
4. Student browsing and application submission.
5. Student application tracking and withdrawal.
6. Mentor opportunity management and application review.
7. Admin opportunity approval and user management.
8. Dashboard metric display for admin, mentor, and student users.
9. Pagination behavior on list pages.
10. Loading, empty, success, and error states.

### Build and Static Checks

The backend package provides scripts for development, build, and production startup:

```text
npm run dev
npm run build
npm start
```

The frontend package provides scripts for development, build, linting, and preview:

```text
npm run dev
npm run build
npm run lint
npm run preview
```

The build scripts validate TypeScript compilation and production build readiness. The frontend lint script checks frontend code quality using ESLint.

### Verification Summary

The verification process focused on confirming that:

1. Backend routes return expected responses.
2. Authentication and authorization rules are applied server-side.
3. Frontend routes match backend API behavior.
4. User roles see only the pages and actions intended for them.
5. Opportunity and application workflows follow the required status rules.
6. Paginated list views work consistently across users, opportunities, and applications.
7. The project can be built using the provided npm scripts.

## 11. AI Usage Declaration

AI assistance was used during selected parts of the SkillBridge project. The detailed AI usage quantification table and prompt history are maintained separately in `ai_usage.md`.

The AI usage calculation follows the provided AI Usage Quantification Guidelines. Partial AI involvement was counted only for areas where AI assisted with implementation suggestions, code structure, UI refinement, debugging, or documentation support. Final code was reviewed, modified, integrated, and understood manually.

### AI Usage Summary

| Category | Counted AI Usage (%) |
|---|---:|
| Frontend | 15.00 |
| Backend | 9.25 |
| Infrastructure / Optional | 2.50 |
| Total | 26.75 |

The estimated total AI contribution is 26.75%, which is below the recommended 30% threshold mentioned in the provided guideline document.

### Tools Used

- ChatGPT
- Codex

### Declaration

AI tools were used as a support aid for selected frontend UI implementation, styling refinement, route/API wiring, helper utility implementation, and debugging support. Core project flow, role-based behavior, database relationships, API behavior, and final integration decisions were manually verified and can be explained by the student.

## 12. Limitations

Although SkillBridge implements the main full-stack workflow, some limitations remain:

1. **Admin account creation:** Public registration supports student and mentor accounts. Admin accounts are intended to be created directly in the database for local development.
2. **File storage:** The database includes uploaded file metadata, but a complete production-ready file upload and storage workflow would require further implementation.
3. **Email notifications:** The system does not currently include email notifications for opportunity approvals, application updates, or account status changes.
4. **Production deployment:** The project is prepared for local development and verification. A complete production deployment setup would require hosting configuration, environment management, and production database setup.
5. **Advanced search and recommendations:** The current opportunity browsing flow supports basic discovery, but advanced recommendation logic is not included.
6. **Audit visibility:** Audit log storage exists at the database level, but a complete admin-facing audit review interface can be improved in future versions.

These limitations do not block the main project workflow, but they identify areas where the platform can be extended beyond the current submission scope.

## 13. Future Scope

SkillBridge can be extended in several ways to make it more useful in a real academic or institutional environment:

1. **Production deployment:** The application can be deployed with a hosted frontend, hosted backend, production PostgreSQL database, and secure environment variable management.
2. **Email and in-app notifications:** Notifications can be added for opportunity approval, application submission, application status changes, and account updates.
3. **Complete file upload workflow:** Resume uploads, opportunity attachments, and document storage can be implemented using a production-ready file storage service.
4. **Advanced search and filtering:** Opportunity discovery can be improved with filters for category, deadline, mentor, opportunity type, availability, and skill requirements.
5. **Recommendation system:** A recommendation feature can suggest opportunities to students based on interests, previous applications, skills, or categories.
6. **Improved audit dashboard:** Admin users can be given a complete audit log interface to review important platform actions.
7. **Analytics and reports:** Dashboard metrics can be extended into detailed analytics for opportunity trends, application outcomes, user activity, and mentor engagement.
8. **Profile and portfolio features:** Student profiles can be expanded to include skills, resumes, academic details, project history, and portfolio links.
9. **Messaging or comment system:** Students and mentors can communicate within the platform about applications or opportunity requirements.
10. **Automated testing:** Unit, integration, and end-to-end tests can be added to strengthen reliability and reduce manual verification effort.

## 14. Conclusion

SkillBridge successfully implements a full-stack role-based opportunity management platform for students, mentors or recruiters, and administrators. The project provides a structured workflow for creating opportunities, approving listings, browsing published opportunities, submitting applications, reviewing applications, managing users, and viewing role-specific dashboard metrics.

The application demonstrates key full-stack development concepts, including React-based frontend development, protected routing, API integration, Express route handling, middleware-based authentication and authorization, TypeORM entity modeling, PostgreSQL persistence, request validation, and reusable UI design. The backend enforces important business rules such as role checks, ownership restrictions, duplicate application prevention, deadline handling, and capacity checks.

Overall, SkillBridge meets its main objective of replacing informal opportunity sharing with a centralized and organized platform. The current implementation is suitable for local demonstration and academic project submission, while the identified future scope provides a clear path for further improvement and production readiness.

## Appendix A: Local Setup and Build Instructions

SkillBridge is organized as separate frontend and backend packages inside the project folder.

### Backend Setup

The backend is located in the `server/` folder. Environment variables are documented in `server/.env.example`. For local development, PostgreSQL can be started through Docker Compose.

Backend build command:

```text
cd server
npm run build
```

Backend development command:

```text
cd server
npm run dev
```

### Frontend Setup

The frontend is located in the `client/` folder and runs as a Vite React application.

Frontend build and lint commands:

```text
cd client
npm run build
npm run lint
```

Frontend development command:

```text
cd client
npm run dev
```

### Supporting Files

The detailed AI usage declaration and prompt history are provided in `ai_usage.md`. Manual backend API checks are available under `server/api-tests/`.
