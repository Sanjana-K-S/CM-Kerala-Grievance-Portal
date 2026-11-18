

\# System Architecture



\## 1. Architecture Overview



The CM Kerala Grievance Redressal Portal follows a three-tier architecture.



1\. Presentation Layer – React.js frontend.

2\. Application Layer – Python FastAPI backend.

3\. Data Layer – MySQL database.



\## 2. Architecture Diagram



```mermaid

flowchart TD

&#x20;   A\[Citizen] --> F\[React Frontend]

&#x20;   B\[CMO Administrator] --> F

&#x20;   C\[Department Officer] --> F

&#x20;   F -->|REST API / JWT| D\[FastAPI Backend]

&#x20;   D --> E\[Authentication and Authorization]

&#x20;   D --> G\[Grievance Management]

&#x20;   D --> H\[AI Analysis Service]

&#x20;   H --> I\[Google Gemini API]

&#x20;   D --> J\[File Attachment Service]

&#x20;   D --> K\[MySQL Database]

```



\## 3. Frontend



The React frontend provides:

\- Public information pages

\- Citizen registration and login

\- Citizen dashboard

\- Grievance submission and tracking

\- CMO administrator dashboard

\- Officer dashboard

\- Contact and feedback interfaces



\## 4. Backend



FastAPI handles:

\- User authentication

\- Role-based access control

\- Grievance creation and tracking

\- Department assignment

\- Officer status updates

\- Feedback and contact enquiries

\- AI-powered grievance analysis

\- Database operations



\## 5. Database



MySQL stores:

\- User information

\- Department information

\- Grievance records

\- Grievance status history

\- Department assignments

\- Attachments

\- Citizen feedback

\- Contact enquiries



\## 6. AI Integration



The backend communicates with Google Gemini API to analyse complaint descriptions and return suggested department, category, priority, and summary.



\## 7. Security



\- Password hashing

\- JWT-based authentication

\- Role-based authorization

\- Protected API endpoints

\- Environment variables for configuration

\- File type and size validation



