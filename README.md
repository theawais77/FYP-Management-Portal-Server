# FYP Management Portal - Server

Backend API for a role-based Final Year Project (FYP) Management Portal built with NestJS and MongoDB.

This service handles the full project lifecycle for:
- Students: group formation, project selection, proposal/document submission, schedules.
- Supervisors: project idea management, approvals, proposal/document review, evaluations.
- Coordinators: department oversight, faculty/group/project/proposal monitoring, announcements, panel and schedule management.

## What This API Covers

- JWT-based authentication and role-based authorization.
- End-to-end FYP workflow across student, supervisor, and coordinator personas.
- Proposal/document upload pipeline with server-side validation.
- Presentation panel and schedule management.
- Dashboard endpoints for each role.
- OpenAPI (Swagger) docs with Bearer auth support.

## Tech Stack

- Framework: NestJS 11, TypeScript
- Database: MongoDB + Mongoose
- Auth: Passport JWT + bcrypt
- API docs: Swagger (at /docs)
- Validation: class-validator + class-transformer
- Security: helmet + global guards/filters/interceptors
- File upload: Multer (disk storage)

## Architecture Overview

### Runtime behavior

On startup, the app:
- Loads environment config from .env.
- Connects to MongoDB using CONNECTION_STRING.
- Applies global validation pipe (whitelist + transform).
- Applies global exception filter and interceptors.
- Enables CORS and Helmet.
- Serves upload files statically at /uploads.
- Exposes Swagger docs at /docs.

### Security model

- Authentication: JWT bearer token.
- Authorization: role-based with custom @Roles decorator.
- Roles:
  - student
  - supervisor
  - coordinator
- Public endpoints are explicitly marked with @Public.

## Core Modules

- auth: coordinator/student/supervisor login and account flows
- student: registration profile, projects, proposals, groups, student dashboards/schedule
- supervisor: project ideas, approvals, reviews, evaluation, supervisor dashboards/schedule
- coordinator: departments, faculty, groups, monitoring, announcements, panels, schedules, dashboard
- shared/common: guards, decorators, filters, interceptors, constants

## Domain Model (MongoDB Schemas)

Major collections/entities:
- users: base user model abstraction
- students
- supervisors
- coordinators
- departments
- groups
- projects
- project ideas
- proposals
- documents
- announcements
- evaluation panels
- presentation schedules

Relationships are represented with ObjectId references (for example: group -> supervisor, project -> group, proposal -> project/group/uploader, schedule -> group/panel).

## API Groups

Swagger tags organize endpoints by workflow:
- Coordinator Auth
- Student Auth
- Supervisor Auth
- Coordinator - Departments, Faculty, User Management, Groups, Projects Monitoring, Proposals Monitoring, Announcements, Evaluation Panels, Presentation Schedules, Dashboard
- Student - FYP Registration, Groups, Projects, Proposals & Documents, Announcements, Presentation Schedule, Dashboard
- Supervisor - Project Ideas, Idea Approvals, Proposals, Documents, Evaluations, Presentation Schedules, Announcements, Dashboard

Visit:
- http://localhost:3003/docs

## Environment Variables

Create a .env file in the server root:

```env
CONNECTION_STRING=mongodb://localhost:27017/fyp_management
JWT_SECRET=replace-with-a-long-random-secret
PORT=3003
```

Notes:
- CONNECTION_STRING is required.
- JWT_SECRET must be set for any non-local environment.
- PORT defaults to 3003 if omitted.

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create .env using the template above.

### 3) Run seed (optional but recommended)

```bash
npm run seed:coordinator
```

Default seeded coordinator:
- Email: coordinator@university.edu
- Password: Coordinator@123
- Coordinator ID: COORD-001

### 4) Start server

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

## Scripts

```bash
npm run build
npm run format
npm run lint

npm run start
npm run start:dev
npm run start:debug
npm run start:prod

npm run test
npm run test:watch
npm run test:cov
npm run test:debug
npm run test:e2e

npm run seed:coordinator
```

## Health Check

Public endpoint:
- GET /health-check

## File Uploads

Student upload endpoints store files under:
- uploads/proposals
- uploads/documents

Current behavior in code:
- Max file size is 10 MB.
- File filter currently enforces .rar extension.
- Swagger summaries still mention ZIP in a few places, but backend checks are RAR-based.

If you want ZIP support, align the Multer file filter and Swagger descriptions together.

## Response and Error Shape

Successful responses are wrapped by a global transform interceptor:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

Errors are normalized by a global exception filter with fields like statusCode, timestamp, path, method, message, and error.

## Security Notes

Before production deployment, review these items:
- Set a strong JWT_SECRET (avoid default fallback).
- Restrict CORS origins.
- Review public coordinator endpoints (register/delete currently marked public for testing).
- Ensure upload directories and file policies meet your security standards.
- Consider filtering sensitive fields in logs.

## ERD Utility

There is an ERD helper script:
- generate-erd-puml.js

It scans compiled schema output and writes PlantUML. Review and sanitize any hardcoded connection data before sharing publicly.

## Project Structure (Server)

```text
src/
  common/          # guards, decorators, filters, interceptors, constants
  controllers/     # role-specific route handlers
  dto/             # request/response contracts and validation
  interfaces/      # shared TS interfaces
  modules/         # Nest feature modules
  schema/          # Mongoose schemas
  services/        # business logic
  scripts/         # utility seed scripts
  strategies/      # JWT strategy
test/
uploads/
``
