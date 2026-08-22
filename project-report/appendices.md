# APPENDICES

# APPENDIX A: SOURCE CODE SNIPPETS

This appendix should contain short, relevant extracts from the final submitted source code. Complete files should not be reproduced because the electronic source submission remains the authoritative implementation. Each extract should include its file path, purpose, and a brief explanation.

## A.1 User Registration and Password Hashing

Insert the model or controller extract that validates registration data, hashes the password, and excludes the stored hash from ordinary responses.

<!-- Insert relevant registration and password-hashing source-code extract here -->

## A.2 JWT Authentication Middleware

Insert the middleware extract that obtains the bearer token, validates it, loads the user, and rejects invalid or expired credentials.

<!-- Insert relevant JWT authentication middleware source-code extract here -->

## A.3 Role and Resource Authorization

Insert a concise extract demonstrating both route-level role checking and record-level project ownership or participant checking.

<!-- Insert relevant role and resource authorization source-code extract here -->

## A.4 Project Creation from an Accepted Request

Insert the controller extract that verifies request state and creates a project once after freelancer acceptance.

<!-- Insert relevant project-request acceptance source-code extract here -->

## A.5 Project Deadline Validation for Task Creation

Insert the task-controller extract that loads the project, normalizes the current date and project `dueDate`, rejects a passed deadline, and reaches `Task.create()` only after validation succeeds.

<!-- Insert relevant task deadline-validation source-code extract here -->

## A.6 Project File Access Validation

Insert the controller extract that allows an associated client or freelancer to view project files while preserving freelancer-only upload and deletion.

<!-- Insert relevant project-file authorization source-code extract here -->

## A.7 Rule-Based Project Intelligence

Insert a focused service extract showing how task completion, overdue work, or deadline distance contributes to a project-health result or insight.

<!-- Insert relevant project-intelligence source-code extract here -->

# APPENDIX B: USER MANUAL / INSTALLATION GUIDE

## B.1 System Prerequisites

The development system requires a supported Node.js installation, npm, a MongoDB database or MongoDB Atlas cluster, and a modern web browser for normal end-user access. Browser launch is not required during installation or command-line build verification. Optional email and Google Calendar capabilities require valid provider credentials.

## B.2 Installation Procedure

1. Obtain the approved FreelancePro source directory and open a terminal in its root.
2. Install frontend dependencies with `npm install`.
3. Install backend dependencies with `npm install --prefix backend`.
4. Copy the frontend environment template to the environment file used by the deployment and set `VITE_API_URL` to the backend API base, such as `http://localhost:5001/api` for local development.
5. Copy `backend/.env.example` to `backend/.env` and replace every sample value with an environment-specific secret or connection value. Environment files containing secrets must not be committed.
6. Permit the configured application host through MongoDB Atlas network access when Atlas is used, and create a database user with only the required privileges.
7. Start both development processes from the project root with `npm run dev`, or start them separately with `npm run dev:frontend` and `npm run dev:backend`.
8. Create a production frontend bundle with `npm run build`. Start the production-configured backend with `npm run start:backend` after supplying the required environment configuration.

The principal frontend environment variable is:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL used by frontend service modules for backend REST requests. |

The backend environment variables are summarized below. Actual secret values must never be printed in the report.

| Variable | Purpose |
| --- | --- |
| `PORT` | Port on which the Express application listens. |
| `MONGODB_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens. |
| `JWT_EXPIRES_IN` | Token validity duration. |
| `NODE_ENV` | Runtime environment, such as development or production. |
| `FRONTEND_URL` | Allowed frontend origin used by CORS configuration. |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE` | SMTP transport configuration. |
| `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | Authenticated sender configuration. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` | Optional Google Calendar integration configuration. |

## B.3 Basic User Manual

### Freelancer Workflow

1. Select the freelancer role and register or log in with freelancer credentials.
2. Complete the profile so that authorized client users can discover relevant professional information.
3. Review project requests and use the request conversation to clarify requirements.
4. Accept a suitable request to create its project, or reject it with the appropriate status.
5. Open the resulting project and manage tasks, deadlines, files, meetings, notes, time records, progress, and activity.
6. Review dashboard summaries, analytics, notifications, project health, productivity information, and the completed-project portfolio.
7. Review invoice and payment information associated with authorized engagements.
8. Use profile and settings pages to maintain account preferences, then log out when the session is complete.

### Client Workflow

1. Select the client role and register or log in with client credentials.
2. Search or browse freelancer profiles and select a suitable freelancer.
3. Submit a project request with an accurate title, description, budget, and intended schedule.
4. Communicate through the request while it is pending and observe its acceptance or rejection status.
5. After acceptance, open the created project to monitor progress, tasks, project health, viewable files, and meetings.
6. Create and manage authorized invoice records, review payment state, and respond to relevant notifications.
7. Maintain profile/settings information and log out at the end of the session.

### Common Safety Guidance

Users should use strong unique passwords, avoid sharing tokens or credentials, verify project and invoice details before submission, and log out on shared devices. A client should see only projects and files associated with that account. A freelancer should verify project context before changing tasks, files, meetings, or financial records.

# APPENDIX C: DATASET DETAILS (IF APPLICABLE)

FreelancePro does not rely on a fixed external research or machine-learning dataset. Its data consists of transactional records created by registered users while operating the application. Consequently, no third-party dataset license, sampling method, or training/test split applies.

The principal application data groups are users and freelancer profiles; freelancer-managed client records; project requests and proposals; conversations and messages; projects, tasks, comments, files, notes, timer sessions, and activities; meetings and notifications; and invoices and payments. Development and evaluation should use purpose-created demonstration accounts and records. Real personal, financial, message, file, token, or credential data must not be embedded in screenshots, test fixtures, or the submitted report.

If anonymized evaluation data is included in the final submission, its creation date, record count, field definitions, masking procedure, and deletion policy should be documented here.

<!-- Insert anonymized demonstration-data summary here only if required by the institution -->
