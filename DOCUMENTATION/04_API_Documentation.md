

\# API Documentation



\## Base URL



Local backend: `http://127.0.0.1:8000`



API prefix: `/api`



Interactive API documentation: `/docs`



\## Authentication



| Method | Endpoint | Purpose |

|---|---|---|

| POST | `/api/auth/register` | Register a citizen |

| POST | `/api/auth/login` | Log in |

| GET | `/api/auth/me` | Get current user |



Protected endpoints use JWT Bearer authentication.



\## Departments



| Method | Endpoint | Purpose |

|---|---|---|

| GET | `/api/departments/` | List departments |



\## Grievances



| Method | Endpoint | Purpose |

|---|---|---|

| POST | `/api/grievances/` | Submit a grievance |

| GET | `/api/grievances/my` | View citizen grievances |

| GET | `/api/grievances/track/{reference\_number}` | Track a grievance |



\## AI Analysis



| Method | Endpoint | Purpose |

|---|---|---|

| POST | `/api/ai/analyze` | Analyse grievance text and suggest department, category, priority, and summary |



\## Administrator



| Method | Endpoint | Purpose |

|---|---|---|

| GET | `/api/admin/dashboard` | View dashboard statistics |

| GET | `/api/admin/grievances` | View grievances |

| GET | `/api/admin/officers` | View officers |

| POST | `/api/assignments/` | Assign a grievance |



\## Officer



| Method | Endpoint | Purpose |

|---|---|---|

| GET | `/api/officer/grievances` | View assigned grievances |

| PATCH | `/api/officer/grievances/{grievance\_id}/status` | Update grievance status |



\## Feedback and Contact



| Method | Endpoint | Purpose |

|---|---|---|

| POST | `/api/feedback/{grievance\_id}` | Submit citizen feedback |

| GET | `/api/feedback/my` | View citizen feedback |

| POST | `/api/contact/` | Submit contact enquiry |



\## API Testing



Use FastAPI Swagger UI at `/docs` to inspect endpoints and test requests.



Note: Endpoint availability and request fields should be verified against the running application.





