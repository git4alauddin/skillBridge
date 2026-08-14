# SkillBridge

SkillBridge is a role-based project and internship opportunity management platform.

## Project Goal

The goal of SkillBridge is to help students, mentors/recruiters, and administrators manage academic projects, internships, research tasks, hackathon openings, and collaboration opportunities in one organized place.

## Roles

- Admin
- Mentor / Recruiter
- Student

## Planned Tech Stack

- React
- Express
- PostgreSQL
- TypeORM
- JWT

## Development Status

This project is being built step by step as a learning-by-doing full-stack application.

## Current Backend Features

- Express API server.
- PostgreSQL database through Docker Compose.
- TypeORM entity models.
- JWT authentication.
- Role-based authorization middleware.
- Manual HTTP API tests.
- Health and readiness checks.

## Backend Setup

Start PostgreSQL from the project root:

```powershell
docker compose up -d postgres
```

Start the backend:

```powershell
cd server
npm run dev
```

Build the backend:

```powershell
cd server
npm run build
```

## Service Checks

Liveness check:

```text
GET http://localhost:4000/health
```

This confirms the Express server is running.

Readiness check:

```text
GET http://localhost:4000/ready
```

This confirms the backend can reach the database.

## Manual API Tests

Manual backend checks live in:

```text
server/api-tests/auth.http
```

Use this file to test:

- Registration.
- Login.
- Current-user lookup.
- Missing and invalid token handling.
- Role-based admin route protection.
