# CHAPTER 4

# SYSTEM DESIGN

## 4.1 System Architecture

FreelancePro follows a layered MERN architecture. The React frontend renders role-specific pages and reusable components. Context providers coordinate authenticated user state and domain data such as projects, tasks, clients, meetings, invoices, notifications, and analytics. Service modules send HTTP requests through a shared Axios instance.

Axios targets the Express REST API and attaches the JWT from browser storage to protected requests. Express routes first apply cross-cutting middleware such as JSON parsing, security headers, CORS, rate limiting, authentication, and role authorization. Controllers validate input and ownership before invoking Mongoose models or reusable services. Mongoose maps JavaScript objects to MongoDB collections and resolves document references. MongoDB Atlas provides centralized persistence.

The principal request path is:

**React Frontend → Axios / REST API → Node.js and Express Backend → Authentication and Business Logic → Mongoose ODM → MongoDB Atlas**

Responses travel back through the same layers. The shared Axios interceptor unwraps response bodies and propagates backend error messages to contexts and UI components.

### Figure 4.1 System Architecture

The architecture diagram should show both user roles accessing the React application, the protected REST API, middleware and controller layers, Mongoose, MongoDB Atlas, and supporting services such as file storage and email delivery.

<!-- Insert System Architecture Diagram here -->

## 4.2 Database Design

MongoDB stores application data as related documents. Mongoose schemas define field types, required values, enums, defaults, timestamps, and indexes. References retain normalization for major relationships while embedded structures are used where history naturally belongs to its parent, such as task progress history and invoice items.

### 4.2.1 Entity–Relationship Diagram

The ER diagram should represent the authenticated User as either Freelancer or Client, freelancer-owned CRM Client records, requests connecting platform clients and freelancers, accepted Projects, project Tasks, communication, meetings, files, notifications, invoices, and payments.

<!-- Insert ER Diagram here -->

### 4.2.2 Schema and Principal Entities

**Table 4.1: Principal Database Entities**

| Entity / Collection | Important Attributes | Purpose |
|---|---|---|
| User | `_id`, `fullName`, `email`, `password`, `role`, profile fields, preferences | Stores authentication identity and role-specific profile information |
| Freelancer Profile | User profile fields such as `skills`, `services`, `title`, `portfolio`, availability | Conceptual profile represented within the User document rather than a duplicate collection |
| Client | `_id`, `fullName`, company, contact fields, status, `createdBy` | Stores freelancer-owned CRM client records |
| ProjectRequest | client, freelancer, title, description, skills, budget, deadline, type, status | Represents targeted or marketplace work requests |
| ProjectProposal | request and proposal-related references and status | Represents freelancer proposals for marketplace requests where applicable |
| Project | name, client, `platformClient`, `projectRequest`, dates, progress, status, `createdBy` | Central accepted or manually managed project record |
| Task | title, `projectId`, status, priority, deadline, progress, history, `createdBy` | Tracks project work and progress |
| Meeting | freelancer, client display fields, `clientUser`, project, provider, date, time, status | Stores scheduled project communication events |
| Conversation | client, freelancer, last message information | Maintains a unique direct conversation relationship |
| Message | conversation, sender, receiver, request/type, text, read state | Stores authenticated direct and request-specific communication |
| Note | ownership and note content fields | Stores freelancer notes according to protected note routes |
| File | original/stored names, MIME type, size, URL, `projectId`, `taskId`, `uploadedBy` | Stores metadata for project and task files |
| Notification | type, title, message, user, read state | Provides user-scoped event information |
| Activity | action, task/project label, type, user reference, timestamp | Supports activity feeds and audit-oriented summaries |
| Invoice | client, freelancer, project, items, dates, totals, paid amount, status | Connects financial documents with an accepted project |
| Payment | invoice, client, project, amount, date, method, `createdBy` | Records payment transactions against invoices |
| TimerSession | user/task/project references, start/end, duration, status | Stores time-tracking sessions |
| FreelancerReview | freelancer, client, project, rating fields, review text | Stores verified feedback for a completed relationship |

### 4.2.3 Important Relationships

**Table 4.2: Important Entity Relationships**

| Relationship | Cardinality | Description |
|---|---|---|
| User (Freelancer) → Client | One-to-many | A freelancer owns multiple CRM client records through `Client.createdBy` |
| User (Client) → ProjectRequest | One-to-many | A platform client may submit multiple project requests |
| User (Freelancer) → ProjectRequest | One-to-many | A freelancer may receive multiple targeted requests |
| ProjectRequest → Project | One-to-zero/one | Acceptance of a targeted request creates at most one linked project |
| User (Freelancer) → Project | One-to-many | `Project.createdBy` defines freelancer ownership |
| User (Client) → Project | One-to-many | `Project.platformClient` defines client visibility |
| Client → Project | One-to-many | A CRM client may be associated with freelancer-managed projects |
| Project → Task | One-to-many | Tasks reference their parent project through `projectId` |
| Conversation → Message | One-to-many | Messages belong to an authorized direct conversation |
| ProjectRequest → Message | One-to-many | Request-specific messages preserve negotiation context |
| Project → File | One-to-many | Project file metadata references the authorized project |
| Project → Invoice | One-to-many conceptually | Invoices reference the client, freelancer, and project; current uniqueness rules prevent duplicate project documents for the same parties |
| Invoice → Payment | One-to-many | Payments refer to their invoice and related project/client |
| Project → FreelancerReview | One-to-zero/one per client/freelancer/project | Unique index prevents duplicate reviews for the same relationship |

## 4.3 UML Diagrams

### 4.3.1 Use Case Diagram

The Use Case Diagram should show Visitor, Freelancer, and Client actors. Visitor actions include role selection, registration, login, forgot password, and reset password. Freelancer use cases include dashboard viewing, CRM client management, request review, messaging, project/task management, meeting and file management, time tracking, analytics, notifications, invoice viewing, profile, and settings. Client use cases include freelancer discovery, project-request submission, messaging, accepted-project monitoring, task viewing, meetings, notifications, invoice and payment management, profile, and settings.

<!-- Insert Use Case Diagram here -->

### 4.3.2 Class Diagram

The Class Diagram should model principal Mongoose entities and their references. It should include User, Client, ProjectRequest, Project, Task, Conversation, Message, Meeting, File, Note, Notification, Invoice, Payment, TimerSession, and FreelancerReview. Service/controller classes may be shown separately to clarify that REST controllers operate on models and return structured responses.

<!-- Insert Class Diagram here -->

### 4.3.3 Sequence Diagram

The recommended sequence is the targeted project-request acceptance flow. The Client submits a request through React. Axios sends it to the protected request API. The backend validates the client and freelancer, saves the request, and returns the result. The Freelancer later sends an `accepted` transition. The controller verifies the request is pending and assigned to that freelancer, saves the new state, checks for an existing linked project, creates the project once, and returns both request and project information.

<!-- Insert Sequence Diagram here -->

### 4.3.4 Activity Diagram

The Activity Diagram should begin with Role Selection. After registration or login, the user enters the role-specific dashboard. A client may find a freelancer, submit a request, and communicate. The freelancer reviews the request and chooses Accept or Reject. Rejection closes that branch. Acceptance creates the project, after which tasks, progress, meetings, communication, invoicing, payments, and completion occur under authorization checks.

<!-- Insert Activity Diagram here -->

## 4.4 Data Flow Diagrams (DFD)

### 4.4.1 Level 0 Data Flow Diagram

The Level 0 DFD should represent FreelancePro as one process interacting with two external entities: Freelancer and Client. Both provide authentication and profile data. The Client provides project requests, messages, invoice/payment inputs, and monitoring requests. The Freelancer provides project, task, time, meeting, note, file, and request-decision inputs. FreelancePro returns role-appropriate dashboards, project information, notifications, analytics, and financial status. Persistent data is stored in MongoDB.

<!-- Insert Level 0 DFD here -->

### 4.4.2 Level 1 Data Flow Diagram

The Level 1 DFD should decompose the platform into Authentication, Freelancer Discovery and Requests, Project and Task Management, Communication and Meetings, Files and Notes, Time and Analytics, Notifications, and Invoice and Payment processes. It should show each process reading or writing only the relevant data stores and returning filtered information to the authorized role.

<!-- Insert Level 1 DFD here -->

## 4.5 User Interface Design

The interface uses the project’s existing design system across both roles. Shared theme variables provide light and dark modes. Reusable cards, buttons, inputs, badges, drawers, modals, tables, icons, and toast notifications preserve visual consistency. Layout containers apply responsive breakpoints, mobile navigation, horizontal table scrolling, and overflow control.

Role Selection presents two clear onboarding choices without altering routes. Freelancer pages prioritize operational summaries, task boards, projects, clients, time, and analytics. Client pages prioritize freelancer discovery, requests, accepted work, invoices, meetings, messages, and monitoring. Drawers provide detailed project, task, client, and meeting information without forcing a full-page navigation change. Destructive operations require confirmation where implemented, and client-only read restrictions remove unauthorized management controls while backend authorization remains decisive.

### Figure 4.9 Role Selection and Authentication Interface

<!-- Insert Role Selection / Login screenshot here -->

### Figure 4.10 Freelancer Dashboard Interface

<!-- Insert Freelancer Dashboard screenshot here -->

### Figure 4.11 Client Dashboard Interface

<!-- Insert Client Dashboard screenshot here -->

### Figure 4.12 Project Details Interface

<!-- Insert Project Details screenshot here -->

