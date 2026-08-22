# CHAPTER 2

# LITERATURE REVIEW

## 2.1 Existing Systems

### General Project-Management Systems

General project-management systems commonly provide boards, lists, assignments, due dates, comments, and progress views. Their strength is flexible work organization across many industries. However, a freelancer often has to configure a generic workspace manually for every client. Freelancer discovery, request acceptance, role-specific access, payment documents, portfolio evidence, and client reliability are normally outside the primary workflow.

### Freelancer Marketplaces

Freelancer marketplaces support profile discovery, proposals, hiring, and platform-mediated transactions. They are effective at connecting buyers and service providers. Their project-management facilities are generally linked to work obtained within that marketplace, and users may have limited control over internal CRM records, custom analytics, notes, or independent client engagements. Platform fees and marketplace-specific policies can also make them unsuitable as a freelancer’s complete operational workspace.

### Customer Relationship Management Systems

CRM systems manage contacts, sales stages, communication notes, and customer history. They are valuable for maintaining client information but are usually optimized for sales teams. Task execution, project-request conversion, freelancer portfolio presentation, and detailed work-hour tracking may require additional products or customization.

### Invoicing and Payment Applications

Invoicing tools produce professional payment documents, maintain due dates, and record payment status. They solve an important financial requirement but frequently lack a direct link to granular task progress, accepted project requests, meetings, files, and client-visible project health. Consequently, a freelancer must reconcile operational and financial information manually.

### Communication and Meeting Tools

Messaging and meeting platforms provide fast interaction, call links, and conversation history. Their weakness in this context is that communication is not necessarily constrained by project ownership or associated with a formal request state. Important decisions can remain isolated from task, project, and invoice records.

## 2.2 Comparative Study / Related Work

**Table 2.1: Comparative Study of Existing Approaches**

| Capability | Generic Project Tool | Freelancer Marketplace | CRM / Invoicing Combination | FreelancePro |
|---|---:|---:|---:|---:|
| Freelancer and Client roles | Partial | Yes | Partial | Yes |
| Public freelancer discovery | No | Yes | No | Yes |
| Project request workflow | Usually no | Yes | Usually no | Yes |
| Request-specific communication | Partial | Yes | No | Yes |
| Accepted request creates project | No | Platform dependent | No | Yes |
| Freelancer CRM clients | Partial | No | Yes | Yes |
| Task and deadline management | Yes | Partial | Partial | Yes |
| Server-enforced deadline rule | Product dependent | Product dependent | No | Yes |
| Client progress visibility | Yes | Partial | Limited | Yes, access scoped |
| Files with view/manage separation | Partial | Partial | Limited | Yes |
| Meetings and notifications | Integration dependent | Partial | Integration dependent | Yes |
| Invoices and payments | Integration dependent | Platform dependent | Yes | Yes |
| Time tracking and analytics | Product dependent | Partial | Integration dependent | Yes |
| Derived project health and productivity | Product dependent | Limited | Limited | Yes |
| Evidence-based empty states | Product dependent | Product dependent | Product dependent | Yes |

The comparison shows that each existing category is strong in a specific area. Project tools organize work, marketplaces discover talent, CRM systems maintain relationships, and invoicing tools manage finance. The central distinction of FreelancePro is not an isolated new function; it is the preservation of one role-aware data relationship across the entire engagement lifecycle. The accepted request identifies the platform client and assigned freelancer, and that project identity is subsequently used for task visibility, file authorization, invoices, and project intelligence.

## 2.3 Research Gap

The main gap is the absence of a compact freelancer operating system that connects acquisition, execution, communication, and financial follow-up while remaining suitable for an individual freelancer. Existing solutions often require several integrations, causing duplicated client names, inconsistent project identifiers, and manual progress reporting.

A second gap concerns authorization. Hiding a control in the interface is not sufficient because an API can be invoked directly. A role-aware freelancer system must validate ownership in the backend: a freelancer may access records created by that freelancer, while a platform client may access only explicitly linked projects. Different actions on the same resource may require different privileges; for example, a client may view and download project files but may not upload or delete them.

A third gap concerns meaningful analytics without fabricated data. Scores can be misleading when they are stored as arbitrary profile values or displayed without evidence. FreelancePro calculates productivity, project health, and reliability from current tasks, projects, dated deliveries, invoices, payments, meetings, and verified reviews. When the available evidence is insufficient, the system communicates that the score is still being built rather than presenting a false rating.

These gaps justify a centralized MERN application that combines role-aware workflow management with evidence-based productivity information and preserves backward-compatible project operations.

