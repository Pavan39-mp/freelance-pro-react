# CHAPTER 5

# IMPLEMENTATION

## 5.1 Tools and Technologies Used

FreelancePro is implemented using JavaScript across the frontend and backend. This reduces context switching between application layers and allows validation structures, date formats, identifiers, and response contracts to be coordinated consistently.

**Table 5.1: Tools and Technologies**

| Layer / Purpose | Technology | Use in FreelancePro |
|---|---|---|
| Frontend | React.js | Component-based role pages, forms, cards, drawers, modals, and state-driven interfaces |
| Build tool | Vite | Development server and optimized production bundle |
| Styling | Tailwind CSS | Responsive utility classes and existing light/dark theme system |
| Routing | React Router | Public and protected Freelancer/Client routes and redirects |
| HTTP client | Axios | REST communication, JWT request headers, and response/error interception |
| State coordination | Context API | User, client, project, task, meeting, note, invoice, analytics, notification, and settings contexts |
| Animation | Framer Motion and existing transition utilities | Reduced-motion-aware onboarding and subtle interface transitions |
| Charts | Recharts | Productivity and analytics visualization |
| Feedback | React Hot Toast | Success and error messages |
| Icons | Lucide React | Consistent navigation and action icons |
| Date handling | date-fns and native Date utilities | Formatting, filtering, and deadline operations |
| Backend runtime | Node.js | Server-side JavaScript execution |
| Web framework | Express.js | REST routes, middleware, controllers, uploads, and error handling |
| Database | MongoDB Atlas | Cloud document persistence |
| ODM | Mongoose | Schemas, references, validation, indexes, queries, and timestamps |
| Authentication | JSON Web Token | Signed identity token for protected API access |
| Password security | bcrypt | Salted password hashing and comparison |
| HTTP security | Helmet | Security-related HTTP headers |
| Cross-origin policy | CORS | Controlled frontend origins |
| Abuse prevention | express-rate-limit | General API and stricter authentication limits |
| File processing | Multer | Controlled multipart file upload metadata and size limits |
| Export support | jsPDF, jsPDF AutoTable, XLSX | PDF and spreadsheet outputs where applicable |
| Version control | Git | Source history and change review |

### Development and Deployment Configuration

The root npm scripts start the Vite frontend and delegate backend execution to the backend package. The frontend production command is `npm run build`, which invokes `vite build`. The backend uses ES modules and starts through `node server.js`. Environment variables provide database connection, JWT secret, token lifetime, frontend origin, email configuration, and other deployment-specific values. Secrets are not embedded in source code.

## 5.2 Module Description

### 5.2.1 Role Selection and Authentication Module

Role Selection stores the selected role temporarily and navigates to the existing login query route. Registration validates the user’s name, email, password strength, and role. The User model hashes a changed password before persistence. Login verifies the password and confirms that the requested role matches the account role before generating a JWT.

The frontend stores the token after successful login. The Axios request interceptor attaches it as a Bearer token. The backend `protect` middleware verifies the token, loads the user without the password, normalizes the role, and attaches the user to the request. `/api/auth/me` restores the authenticated profile when the application reloads. ProtectedRoute separates client and freelancer navigation, while backend `authorizeRoles` prevents direct API bypass.

Forgot-password and reset-password endpoints generate and verify time-limited reset data and use the configured email service where available. Logout clears the token and frontend user state.

### 5.2.2 Freelancer Profile and Discovery Module

Freelancers maintain public-profile fields such as title, skills, services, experience, availability, biography, and portfolio link. Clients can search public freelancers and inspect approved profile fields, completed projects, and verified reviews. Private profiles do not become discoverable. Completed projects are presented as a professional portfolio using actual project descriptions and request skills; absent information is not replaced with fabricated ratings or technologies.

### 5.2.3 Client Management Module

The Freelancer workspace maintains CRM client records containing name, organization, contact information, status, notes, industry, and ownership. Client listing, search, filters, cards/tables, detail drawer, project summary, billing information, meetings, and reliability evidence are scoped to the freelancer. These CRM records are distinct from authenticated platform Client users, although a Project may associate with both a CRM client and a platform client depending on its origin.

### 5.2.4 Project Request and Proposal Module

A client can submit a targeted request to a selected public freelancer or create a marketplace-oriented request where supported. Input validation covers title, description, skills/category where required, positive budget or valid range, future deadline, project type, freelancer validity, public availability, and duplicate pending targeted requests.

Pending targeted requests allow the requesting client to cancel and the assigned freelancer to accept or reject. Once finalized, an invalid second transition is rejected. Acceptance checks whether a Project already references that request; if not, one project is created with the request title, description, budget, normalized due date, platform client, assigned freelancer, and request reference.

### 5.2.5 Messaging Module

The messaging layer supports unique direct conversations between one client and one freelancer and request-specific communication. Backend controllers verify conversation membership or project-request participation before listing or sending messages. Message records preserve sender, receiver, conversation type, request reference, text, read state, and timestamps. The current implementation uses authenticated REST requests and persistent MongoDB messages; Socket.IO is not part of the installed runtime configuration.

### 5.2.6 Project Management Module

Projects preserve the central link between operational data and role access. `createdBy` identifies the owning freelancer, `platformClient` identifies the authenticated client allowed to view accepted work, `client` optionally links a freelancer-owned CRM client, and `projectRequest` prevents duplicate conversion. Freelancers may create and update permitted projects. Clients receive only projects in which they are the linked platform client.

The project details drawer organizes Overview, Tasks, Activity, and Files tabs. Overview contains status, priority, budget/rate, due date, progress, billing summary, comments, project health, client reliability, and rule-based insights according to available data.

### 5.2.7 Task and Progress Module

Task creation requires a title and `projectId`. Before `Task.create`, the controller loads the project, verifies ownership, normalizes the current date and project `dueDate`, rejects malformed configured dates, and returns HTTP 400 when the project deadline has passed. This server-side rule prevents an API caller from bypassing the frontend restriction.

Tasks support status, priority, estimated and worked hours, progress, blocked state, reason, deadline, description, comments, attachments, and progress history. Progress updates record previous/new percentages, hours, summary, blocked details, user, and timestamp. Project progress is recalculated after relevant task changes. Deletion uses the existing protected API and the UI requires confirmation before execution.

### 5.2.8 Meeting Module

Meetings store title, freelancer/client association, project label, provider, join URL, date, time, time zone, agenda, duration, participants, and status. Protected controllers validate which role can create or access the meeting. Meeting cards and detail drawers provide scheduled information, summaries, decisions, action items, and follow-up handling where implemented.

### 5.2.9 Notes, Files, Notifications, and Activity Module

Notes are user-scoped records managed through protected routes. Files store metadata and project/task references. Both Freelancer and linked Client can list and download project files, but upload and deletion routes remain Freelancer-only. Download controllers validate access to the file’s parent project instead of trusting a visible URL.

Notifications are generated for relevant application events and retrieved by user. Activity records provide a recent-work timeline for dashboards and project contexts. Both modules use user references and timestamps to prevent mixing unrelated users’ data.

### 5.2.10 Time Tracking and Analytics Module

Timer sessions associate tracked work with the authenticated freelancer and relevant task/project. Start, stop, and summary operations produce daily and weekly totals used by dashboards. Analytics aggregate clients, projects, tasks, invoices, and payments within optional date ranges. Recharts renders charts, while PDF/spreadsheet libraries support reporting and export where exposed by the interface.

### 5.2.11 Invoice and Payment Module

Invoices are created by authenticated Clients for an accepted project with an assigned freelancer. The controller verifies that the client owns the project through `platformClient`, that the project has an assigned freelancer and request, and that a duplicate invoice does not already exist for the same relationship. Items are validated and totals, tax, and discount are calculated server-side. Status, sent/paid dates, paid amount, and payment records provide financial tracking. Freelancer invoice queries use the `freelancer` relationship, while client queries use client ownership.

### 5.2.12 Productivity Intelligence Module

Productivity and health information is calculated on demand rather than duplicated in MongoDB. Freelancer productivity combines available task completion, dated delivery, project success, and verified feedback evidence. Project health uses completion, pending work, overdue tasks, blocked work, and days remaining. Client reliability uses available payment, completed-project, and meeting evidence and returns “Building score from project activity” when evidence is insufficient. Portfolio data is assembled from the authenticated freelancer’s completed projects and saved skills. Protected intelligence endpoints enforce self or project relationship access.

### 5.2.13 Profile and Settings Module

Both roles can update common profile fields. Freelancer-only public profile and availability fields are rejected when submitted by a Client. Settings maintain theme and notification preferences. Frontend contexts keep profile state synchronized after a successful update and display server validation errors when an update is rejected.

### REST API Organization

**Table 5.2: REST API Groups**

| API Prefix | Responsibility |
|---|---|
| `/api/auth` | Registration, login, logout, current user, password recovery |
| `/api/clients` | Freelancer CRM clients |
| `/api/freelancers` | Public freelancer discovery, profiles, reviews, completed projects |
| `/api/project-requests` | Requests, marketplace listing, status transitions |
| `/api/project-proposals` | Marketplace proposal operations |
| `/api/projects` | Authorized project CRUD and comments |
| `/api/tasks` | Task CRUD, progress, comments, attachments |
| `/api/messages` | Direct conversations and request-specific messages |
| `/api/meetings` | Meeting creation and role-aware retrieval |
| `/api/files` | Project files, authenticated download, freelancer upload/delete |
| `/api/notes` | User notes |
| `/api/timer` | Time sessions and summaries |
| `/api/notifications` | User notifications |
| `/api/activities` | User activity feed |
| `/api/invoices` | Invoice creation, retrieval, status, summary |
| `/api/payments` | Payment records |
| `/api/analytics` | Aggregated operational reports |
| `/api/intelligence` | Productivity, project health, reliability, portfolio calculations |

## 5.3 Code Snippets and Explanation

Only representative extracts should be included in the final formatted report. The complete source repository should not be reproduced.

### 5.3.1 Password Hashing and JWT Generation

This extract should demonstrate the User pre-save password hash and token generation. The explanation should identify that plaintext passwords are not stored and that token expiry is configurable.

<!-- Add password hashing and JWT code snippet here manually -->

### 5.3.2 Authentication and Role Middleware

This extract should show Bearer token verification, user loading without password, role normalization, and `authorizeRoles`. The important point is that authorization occurs before protected controllers.

<!-- Add authentication / role middleware code snippet here manually -->

### 5.3.3 Accepted Request to Project Conversion

This extract should show authorization of the pending transition, the check for an existing project by request identifier, and creation of the linked project. It demonstrates workflow integrity and duplicate prevention.

<!-- Add project request acceptance code snippet here manually -->

### 5.3.4 Project Deadline Validation Before Task Creation

This extract should show project lookup, ownership validation, date normalization, invalid-date handling, and the HTTP 400 response before `Task.create`. It demonstrates why frontend validation is supplemented by a non-bypassable backend rule.

<!-- Add task deadline validation code snippet here manually -->

### 5.3.5 Project File Authorization

This extract should show that GET/download accepts Freelancer and Client roles, but the controller verifies `createdBy` for a freelancer or `platformClient` for a client. Upload and deletion routes remain freelancer-only.

<!-- Add project file authorization code snippet here manually -->

### 5.3.6 Dynamic Intelligence Calculation

This extract should illustrate calculation from existing Task, Project, Invoice, Meeting, or Review records without persisting a duplicate score. It should also show the insufficient-evidence condition for reliability.

<!-- Add intelligence calculation code snippet here manually -->

## 5.4 Screenshots of Application

Screenshots should be captured from representative test accounts after removing or masking private information. Each screenshot must be numbered, captioned, and discussed briefly.

### Figure 5.1 Login Module

The screenshot should show role-aware login input and validation feedback.

<!-- Insert Login screenshot here -->

### Figure 5.2 Project Request Module

The screenshot should show a client request and the freelancer’s request-review state.

<!-- Insert Project Request screenshot here -->

### Figure 5.3 Task and Progress Module

The screenshot should show project tasks, status, progress, deadline, and update controls.

<!-- Insert Task / Progress screenshot here -->

### Figure 5.4 Invoice and Payment Module

The screenshot should show a project-linked invoice and its current payment status.

<!-- Insert Invoice / Payment screenshot here -->

Additional screenshots may be included for Freelancer Dashboard, Client Dashboard, messaging, meetings, files, analytics, project intelligence, professional portfolio, profile, and settings, provided that they remain relevant and clearly labelled.

