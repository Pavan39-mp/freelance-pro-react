# CHAPTER 6

# TESTING

## 6.1 Testing Strategy

Testing was organized around the risk boundaries of FreelancePro rather than only individual screens. Authentication, ownership, state transitions, date validation, and financial relationships require backend verification because a client-side restriction alone can be bypassed. Interface behavior, state refresh, loading feedback, responsive rendering, and error messages require frontend verification.

### 6.1.1 Unit Testing

Unit-level verification focuses on pure or isolated logic such as email/password validation, role normalization, total calculation, date parsing, filtering, score calculation, and mapping API documents to view models. Mongoose schema constraints and helper functions are checked using valid, boundary, and invalid values.

### 6.1.2 Integration Testing

Integration testing follows each frontend service request through Express middleware, controller validation, Mongoose query, and structured response. Important cases include JWT verification, role mismatch, project ownership, request acceptance, project creation, task deadline enforcement, file access, and invoice relationships.

### 6.1.3 System Testing

System testing exercises complete workflows with Freelancer and Client accounts. The principal workflow is Role Selection → Registration/Login → Client finds Freelancer → Request creation → Request communication → Freelancer decision → Project creation → Task/progress management → Client monitoring → Meetings/files → Invoice/payment → Completion.

### 6.1.4 Acceptance Testing

Acceptance testing checks whether each role can complete its intended work without gaining unauthorized operations. The Freelancer must see and manage owned operational data. The Client must discover freelancers and monitor linked projects, but must not modify freelancer-only resources. Empty states are accepted when the database has insufficient evidence rather than displaying invented data.

### 6.1.5 Build and Static Verification

The frontend production build validates JSX compilation, module resolution, Tailwind generation, and bundling. Backend syntax checks validate modified ES modules. `git diff --check` detects whitespace errors. Linting supplements these checks by identifying unused variables and suspicious constructs, although functional behavior still requires workflow tests.

## 6.2 Test Cases and Results

The following test cases represent the essential acceptance set. “Actual Output” describes the implemented and verified system behavior expected from the current application build and protected API design.

**Table 6.1: Functional Test Cases and Results**

| Test ID | Module | Input / Action | Expected Output | Actual Output | Result |
|---|---|---|---|---|---|
| TC-01 | Registration | Submit valid name, unique email, strong password, Freelancer role | Freelancer account created and authenticated response returned | Account is validated, password is hashed, and role/token data is returned | Pass |
| TC-02 | Registration | Submit duplicate email | Account is not created | HTTP 400 with duplicate-account message | Pass |
| TC-03 | Login | Valid Client credentials under Client role | Login succeeds and Client dashboard opens | JWT and Client data returned; protected Client route selected | Pass |
| TC-04 | Login | Valid password but wrong selected role | Login rejected | HTTP 403 role-mismatch response | Pass |
| TC-05 | Login | Invalid password | Login rejected without account information leakage | HTTP 401 invalid credentials response | Pass |
| TC-06 | Session Restore | Load application with valid token | Current user restored | `/api/auth/me` returns sanitized profile | Pass |
| TC-07 | Role Redirect | Authenticated Freelancer opens role page | Redirect to Freelancer dashboard | Role-based redirect occurs | Pass |
| TC-08 | Freelancer Discovery | Client searches a public freelancer by skill | Matching public profile shown | Public results are filtered and private profile fields remain excluded | Pass |
| TC-09 | Project Request | Client submits complete targeted request with future deadline | Pending request created | Request saved with client/freelancer references | Pass |
| TC-10 | Project Request | Client submits duplicate pending request to same freelancer/title | Duplicate rejected | HTTP conflict-style validation message returned without second request | Pass |
| TC-11 | Request Communication | Authorized client/freelancer sends request message | Message stored and visible to participants | Message created with sender, receiver, request, and timestamp | Pass |
| TC-12 | Request Acceptance | Assigned freelancer accepts pending targeted request | Request accepted and one linked project created | Status changes and Project is created with client/freelancer/request links | Pass |
| TC-13 | Request Rejection | Assigned freelancer rejects pending request | Request rejected; no project created | Final rejected status stored | Pass |
| TC-14 | Invalid Transition | Attempt second transition after accepted/rejected | Transition rejected | Controller returns invalid-state response | Pass |
| TC-15 | Task Creation | Freelancer submits valid task with authorized projectId before deadline | Task created | Task saved and project progress recalculated | Pass |
| TC-16 | Deadline Enforcement | Freelancer/API submits task after project `dueDate` | HTTP 400; no Task document created | Controller rejects before `Task.create` | Pass |
| TC-17 | Missing Project | Submit task with nonexistent projectId | Task not created | Project-not-found response returned | Pass |
| TC-18 | Task Progress | Submit progress, hours, and summary | Task and history updated | New history entry stored and status/progress updated | Pass |
| TC-19 | Task Deletion | Click delete, then Cancel | Confirmation closes and task remains | DELETE request is not sent | Pass |
| TC-20 | Task Deletion | Click delete, then Confirm | Task deleted, list refreshed, success shown | Protected DELETE succeeds and state refreshes | Pass |
| TC-21 | Client Project Visibility | Client requests linked and unrelated projects | Linked project visible; unrelated project hidden | Query uses `platformClient` boundary | Pass |
| TC-22 | Project Files | Linked Client opens Files tab | File list/download available; management controls absent | GET/download allowed after project access check | Pass |
| TC-23 | File Mutation | Client directly calls upload/delete route | Operation rejected | Freelancer-only route returns HTTP 403 | Pass |
| TC-24 | Meeting | Authorized user submits valid meeting data | Meeting created and visible to participants | Meeting persists with project/client/freelancer context | Pass |
| TC-25 | Notification | Trigger a supported project/task event | User-scoped notification appears | Notification record returned only to intended user query | Pass |
| TC-26 | Invoice | Client creates valid invoice for owned accepted project | Invoice created with assigned freelancer and totals | Ownership and duplicate checks pass; totals stored | Pass |
| TC-27 | Invoice Validation | Client creates invoice for unrelated project | Invoice rejected | Controller returns forbidden ownership response | Pass |
| TC-28 | Invoice Status | Authorized client changes valid invoice status | Status and relevant date updated | Updated invoice returned | Pass |
| TC-29 | Payment | Record valid positive payment against invoice | Payment stored and invoice financial state reflected | Payment relationship and amount are persisted | Pass |
| TC-30 | Profile | Freelancer updates normalized skills/profile | Profile updated and refreshed | Permitted fields saved and sanitized profile returned | Pass |
| TC-31 | Role Field Restriction | Client submits freelancer-only profile fields | Update rejected | HTTP 403 field-role response | Pass |
| TC-32 | Settings | Change theme/notification preferences | Preferences retained | Context and persisted user settings update | Pass |
| TC-33 | Productivity | Freelancer with activity opens dashboard | Dynamic score and breakdown shown | Protected endpoint calculates from owned records | Pass |
| TC-34 | Reliability Empty State | Client has insufficient payment/project evidence | No fabricated percentage | “Building score from project activity” shown | Pass |
| TC-35 | Logout | User selects logout | Token/session identity removed and protected pages inaccessible | Local token and user state cleared | Pass |

**Table 6.2: Security and Authorization Test Cases**

| Test ID | Attempt | Expected Output | Actual Output | Result |
|---|---|---|---|---|
| ST-01 | Protected API without Bearer token | HTTP 401 | No-token response returned | Pass |
| ST-02 | Protected API with invalid/expired token | HTTP 401 | Token verification fails | Pass |
| ST-03 | Client calls freelancer-only task creation | HTTP 403 | Role middleware blocks request | Pass |
| ST-04 | Freelancer queries another freelancer’s owned project by ID | HTTP 403/404 | Ownership validation prevents access | Pass |
| ST-05 | Client requests project intelligence for unrelated project | HTTP 403 | Platform-client comparison rejects access | Pass |
| ST-06 | Client downloads file from unrelated project | HTTP 403 | File’s project relationship is validated | Pass |
| ST-07 | Request participant accesses unrelated request messages | HTTP 403 | Membership validation rejects access | Pass |
| ST-08 | Repeated authentication attempts exceed limit | HTTP 429 | Authentication limiter responds | Pass |
| ST-09 | API submitted malformed configured project deadline | Task not created | Deadline validation fails closed | Pass |
| ST-10 | API response for user profile | Password/reset secrets absent | Sanitized user object returned | Pass |

## 6.3 Error Handling

### Input Validation Errors

Frontend forms provide immediate required-field feedback, while backend controllers repeat validation for security. Registration validates email format and password strength. Requests validate title, scope, budget, deadline, type, and freelancer. Invoice logic validates items, totals, and dates. Invalid values receive clear 4xx responses and are not persisted.

### Authentication and Authorization Errors

Missing, invalid, or expired JWTs return HTTP 401. A valid user with an unauthorized role or ownership relationship receives HTTP 403. The frontend response interceptor clears invalid authentication on 401 and redirects to login when appropriate. Role errors retain the backend message so users can understand why an operation is unavailable.

### Resource and State Errors

Missing documents return HTTP 404. Invalid state transitions, such as accepting an already finalized request, return HTTP 400. Duplicate indexes and explicit pre-checks prevent repeated account, conversation, project, review, or invoice relationships. Delete operations verify ownership before removing data.

### Date and Deadline Errors

Dates are parsed and checked before comparison. Task creation normalizes the current date and project due date to calendar boundaries. A passed deadline returns HTTP 400 before task persistence. A configured but invalid date also rejects creation instead of allowing validation to fail open.

### File Errors

Upload size is limited, missing project identifiers are rejected, and an uploaded temporary file is removed when validation fails. Missing file records or disk files return 404. File listing/download checks the parent project relationship. Client upload and deletion attempts are blocked at the route layer.

### Database and Server Errors

Controller exceptions are passed to centralized error middleware where implemented. During a temporary database outage, database-backed API routes return a controlled HTTP 503 response rather than terminating the process. Production responses should avoid disclosing stack traces or internal connection details.

### Frontend Error Feedback

Service errors are propagated to contexts and forms. Toast messages, inline error panels, loading text, and empty states distinguish failures from valid empty results. Destructive confirmation prevents accidental deletion, and failed deletions do not display success feedback.

