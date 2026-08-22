# CHAPTER 3

# SYSTEM ANALYSIS

## 3.1 Requirement Analysis

Requirement analysis identifies what FreelancePro must provide to each user role and the environment required to operate it. Requirements were derived from the end-to-end workflow beginning at role selection and continuing through authentication, project acquisition, execution, monitoring, billing, and completion.

### 3.1.1 User Requirements

**Table 3.1: User Requirement Analysis**

| User | Requirement | Expected System Response |
|---|---|---|
| Visitor | Select Freelancer or Client role | Preserve selected role and open the corresponding login flow |
| New user | Register securely | Validate fields, hash password, create role-specific account, and return authentication data |
| Freelancer | View own operational summary | Show freelancer-scoped clients, projects, tasks, meetings, activities, analytics, and productivity data |
| Freelancer | Manage projects and tasks | Permit create/update/delete actions only within freelancer ownership boundaries |
| Freelancer | Review project requests | Show assigned or marketplace requests and permit valid status transitions |
| Freelancer | Track work | Start, stop, and summarize time sessions against authorized tasks/projects |
| Freelancer | Manage resources | Maintain notes, files, comments, meetings, notifications, profile, and settings |
| Client | Discover freelancers | Search and filter public freelancer profiles without exposing private fields |
| Client | Send project request | Validate scope, deadline, budget, target freelancer, and duplicate pending requests |
| Client and Freelancer | Communicate | Exchange authenticated direct or request-specific messages |
| Client | Monitor accepted project | View only projects linked through the platform-client relationship |
| Client | View project files | List and download authorized files but not upload or delete them |
| Client | Manage invoices/payments | Create project-linked payment documents and update permitted financial states |
| Both roles | Receive feedback | Display clear success, validation, authorization, empty, and loading states |

### 3.1.2 System Requirements

#### Software Requirements

**Table 3.2: Software Requirements**

| Category | Requirement |
|---|---|
| Client environment | Modern standards-compliant web browser |
| Frontend runtime/build | Node.js and npm; Vite build system |
| Frontend framework | React with React Router and Context API |
| Styling | Tailwind CSS with project theme variables |
| HTTP communication | Axios with JWT-bearing requests |
| Backend runtime | Node.js |
| Backend framework | Express.js |
| Database | MongoDB Atlas or compatible MongoDB instance |
| Data modelling | Mongoose ODM |
| Security packages | JSON Web Token, bcrypt, Helmet, CORS, and express-rate-limit |
| Development environment | Source-code editor, Git, terminal, and supported operating system |

#### Hardware Requirements

**Table 3.3: Hardware Requirements**

| Component | Minimum Practical Requirement | Recommended Development Requirement |
|---|---|---|
| Processor | Dual-core 64-bit processor | Modern quad-core processor or higher |
| Memory | 4 GB RAM | 8 GB RAM or higher |
| Storage | 1 GB free for source and dependencies | 5 GB or higher for dependencies, builds, and uploads |
| Network | Internet access for MongoDB Atlas and package installation | Stable broadband connection |
| Display | 1280 × 720 | Full HD or higher |

### 3.1.3 Data Requirements

The system requires persistent records for users, freelancer profile fields, CRM clients, project requests, project proposals, accepted projects, tasks, progress history, meetings, conversations, messages, notes, files, comments, notifications, activities, timer sessions, invoices, payments, and freelancer reviews. Object identifiers provide references between related MongoDB documents. Dates are required for deadlines, meetings, invoices, payments, activity ordering, and analytics.

Sensitive fields such as password hashes and reset tokens must not be returned as public profile information. Queries must be scoped by `createdBy`, `platformClient`, `client`, `freelancer`, conversation membership, or another explicit ownership relationship.

## 3.2 Feasibility Study

### 3.2.1 Technical Feasibility

The project is technically feasible because each layer uses established JavaScript technologies. React provides component-based interface construction, Vite provides development and production builds, and Tailwind CSS supports responsive styling without requiring a separate design framework. Express supports modular REST routes and middleware, while Mongoose defines schemas and relationships for MongoDB documents.

The architecture is compatible with role-based authorization because JWT middleware can attach the authenticated user before controllers execute. MongoDB queries can enforce access using ownership fields. Existing libraries support password hashing, request security headers, CORS, rate limiting, file upload, charts, date handling, PDF generation, spreadsheet export, toast feedback, and icons. The current communication module uses persisted REST endpoints, avoiding a dependency on an unconfigured real-time server.

### 3.2.2 Economic Feasibility

The principal technologies are open source. Development does not require proprietary IDEs or commercial application servers. MongoDB Atlas provides deployment options suitable for development and small-scale academic demonstration, and the frontend can be built as static assets. Operational cost therefore depends mainly on hosting scale, storage, email delivery, and database usage rather than software licence fees.

Centralizing functions can also reduce the indirect cost of maintaining subscriptions and duplicated data across separate client, task, note, time, and invoice tools. The project is economically appropriate for an academic implementation and can be scaled gradually if adopted beyond demonstration use.

### 3.2.3 Operational Feasibility

The workflow follows familiar concepts: role selection, login, dashboard, projects, tasks, meetings, messages, and invoices. Freelancer and Client navigation is separated so users are not presented with operations they cannot perform. Responsive pages support desktop, tablet, and mobile layouts. Reusable form controls, confirmations, loading states, empty states, and toast messages reduce ambiguity.

Operational acceptance also depends on data visibility. Freelancers retain control over their records, clients see linked project information, and sensitive modification operations remain restricted. These boundaries make the system practical for collaborative use without requiring a client to receive general access to the freelancer’s workspace.

## 3.3 Functional & Non-Functional Requirements

### 3.3.1 Functional Requirements

**Table 3.4: Functional Requirements**

| ID | Functional Requirement |
|---|---|
| FR-01 | The system shall allow role selection without changing authentication routes. |
| FR-02 | The system shall register users as Freelancer or Client after validating name, email, password strength, and role. |
| FR-03 | The system shall authenticate credentials and reject a login attempted under the wrong role. |
| FR-04 | The system shall restore an authenticated session through `/api/auth/me`. |
| FR-05 | The system shall enforce protected frontend routes and backend role authorization. |
| FR-06 | The system shall allow freelancers to manage authorized CRM clients. |
| FR-07 | The system shall allow clients to find public freelancers and view approved profile fields. |
| FR-08 | The system shall allow clients to create valid project requests and prevent duplicate pending targeted requests. |
| FR-09 | The system shall allow authorized parties to exchange direct and project-request messages. |
| FR-10 | The system shall allow a freelancer to accept or reject a pending targeted request. |
| FR-11 | The system shall create one project for an accepted targeted request and prevent duplicate creation. |
| FR-12 | The system shall allow freelancers to manage projects and allow linked clients to view their projects. |
| FR-13 | The system shall allow task creation only for an owned project whose configured deadline has not passed. |
| FR-14 | The system shall support task status, progress, work history, comments, and attachments. |
| FR-15 | The system shall support meetings, notes, notifications, activities, files, and time sessions. |
| FR-16 | The system shall permit both linked roles to view project files, while upload and deletion remain freelancer-only. |
| FR-17 | The system shall allow clients to create project-linked invoices and record permitted payment information. |
| FR-18 | The system shall allow freelancers to view invoices associated with their work. |
| FR-19 | The system shall provide dashboards, filtering, search, analytics, and exports where implemented. |
| FR-20 | The system shall calculate productivity, project health, rule-based insights, reliability, and portfolio information from existing data. |
| FR-21 | The system shall allow profile and settings updates within role-specific field restrictions. |
| FR-22 | The system shall log out by clearing the client token and authenticated user state. |

### 3.3.2 Non-Functional Requirements

**Table 3.5: Non-Functional Requirements**

| Category | Requirement |
|---|---|
| Security | Passwords shall be hashed; protected endpoints shall validate JWTs; roles and ownership shall be checked server-side. |
| Privacy | APIs shall not expose passwords, reset tokens, unrelated client records, or unrelated project intelligence. |
| Performance | List APIs shall use filtering, sorting, pagination where applicable, selected fields, and database indexes for frequent relationships. |
| Reliability | Invalid input and unavailable database conditions shall return controlled HTTP responses rather than silently corrupting data. |
| Usability | Forms shall provide labels, validation, loading feedback, responsive controls, and confirmation before destructive operations. |
| Compatibility | The interface shall operate on current desktop and mobile browsers and preserve light/dark theme variables. |
| Maintainability | Frontend services, contexts, reusable components, backend routes, controllers, models, and calculation services shall remain modular. |
| Scalability | Stateless JWT-protected REST APIs and MongoDB Atlas shall permit independent frontend/backend deployment and horizontal growth. |
| Data integrity | Required fields, enums, unique indexes, ownership queries, and controlled state transitions shall protect important records. |
| Accessibility | Interactive elements shall expose labels, keyboard focus, readable contrast through the existing theme, and reduced-motion behavior where applicable. |

