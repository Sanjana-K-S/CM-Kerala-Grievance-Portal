

\# Database Design



\## 1. Database



Database name: `cm\_kerala\_grievance`



Database system: MySQL



\## 2. Main Tables



| Table | Purpose |

|---|---|

| departments | Stores department information |

| users | Stores citizen, administrator, and officer accounts |

| grievances | Stores submitted grievances |

| grievance\_history | Records grievance status changes |

| department\_assignments | Stores department and officer assignments |

| attachments | Stores grievance attachment details |

| citizen\_feedback | Stores citizen feedback |

| contact\_enquiries | Stores contact form enquiries |

| contact\_email\_otps | Stores contact verification records, if enabled |



\## 3. Table Relationships



\- A department can have multiple officers.

\- A citizen can submit multiple grievances.

\- A grievance can have multiple status history records.

\- A grievance can have attachment records.

\- A grievance can have department assignment records.

\- A resolved grievance can receive citizen feedback.



\## 4. Entity Relationship Diagram



```mermaid

erDiagram

&#x20;   USERS ||--o{ GRIEVANCES : submits

&#x20;   DEPARTMENTS ||--o{ USERS : contains

&#x20;   DEPARTMENTS ||--o{ GRIEVANCES : receives

&#x20;   GRIEVANCES ||--o{ GRIEVANCE\_HISTORY : records

&#x20;   GRIEVANCES ||--o{ ATTACHMENTS : contains

&#x20;   GRIEVANCES ||--o{ DEPARTMENT\_ASSIGNMENTS : assigned

&#x20;   USERS ||--o{ DEPARTMENT\_ASSIGNMENTS : handles

&#x20;   GRIEVANCES ||--o{ CITIZEN\_FEEDBACK : receives

```



\## 5. Important Data



\### Users

Stores name, email, mobile number, password hash, role, and department association.



\### Grievances

Stores reference number, citizen, district, category, subject, description, priority, and current status.



\### Grievance History

Stores status changes, remarks, responsible user, and timestamps.



\### Attachments

Stores uploaded file names and storage paths.



\### Department Assignments

Stores the department and officer assigned to a grievance.



\### Citizen Feedback

Stores feedback submitted by citizens after resolution.



\## 6. Data Integrity



\- Primary keys uniquely identify records.

\- Foreign keys maintain relationships.

\- Unique reference numbers identify grievances.

\- Passwords are stored as hashes rather than plain text.



