
# CM Kerala Grievance Redressal Portal

A web-based grievance management demonstration prototype that enables citizens to submit and track grievances while allowing administrators and department officers to manage and process complaints.

> **Disclaimer:** This is a demonstration prototype. It is not an official Government of Kerala website.

## Features

### Citizen Portal
- Citizen registration and login
- Submit grievances with optional attachments
- Unique grievance reference number
- Track grievance status
- View submitted grievances
- Submit feedback after resolution

### CMO Administrator
- Dashboard with grievance statistics
- View submitted grievances
- Assign grievances to departments and officers
- Monitor grievance progress

### Department Officer
- View assigned grievances
- Review grievance details
- Update grievance status and remarks

### AI Assistance
- Suggested department
- Suggested grievance category
- Recommended priority
- Automatic complaint summary

AI suggestions are advisory and require human review.

## Technology Stack

- Frontend: React.js and Vite
- Backend: Python and FastAPI
- Database: MySQL
- ORM: SQLAlchemy
- Authentication: JWT
- AI Integration: Google Gemini API

## Project Structure

```text
CM-Kerala-Grievance-Portal/
├── backend/
├── frontend/
├── DOCUMENTATION/
│   ├── 01_Project_Overview.md
│   ├── 02_System_Architecture.md
│   ├── 03_Database_Design.md
│   ├── 04_API_Documentation.md
│   ├── 05_AI_Integration.md
│   ├── 06_Setup_and_Testing.md
│   └── 07_User_Guide.md
├── README.md
└── .env.example
```

## Prerequisites

- Python
- Node.js and npm
- MySQL or XAMPP
- Google Gemini API key

## Installation and Setup

### 1. Database Setup

1. Start MySQL using XAMPP.
2. Create a database named `cm_kerala_grievance`.
3. Configure the database connection in the backend environment file.

### 2. Backend Setup

Open PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder and configure:

```env
DATABASE_URL=mysql+pymysql://root:@localhost:3306/cm_kerala_grievance
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace the placeholder with your own valid API key. Never upload this file to GitHub.

Start the backend:

```powershell
python -m uvicorn app.main:app --reload
```

Backend URL: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 3. Frontend Setup

Open another PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL: http://localhost:5173

## Grievance Workflow

1. Citizen submits a grievance.
2. System generates a unique reference number.
3. CMO administrator reviews the grievance.
4. Grievance is assigned to a department and officer.
5. Officer investigates and updates the grievance.
6. Resolution details are submitted for review.
7. Citizen views updates and can provide feedback.

## Grievance Statuses

- Submitted
- Under Review
- In Progress
- Resolved
- Reopened

## API Documentation

FastAPI Swagger UI:

http://127.0.0.1:8000/docs

## Documentation

Refer to the `DOCUMENTATION` folder for project overview, architecture, database design, API details, AI integration, setup instructions, and user guide.

## Security

- Password hashing
- JWT-based authentication
- Role-based access control
- Environment-based configuration
- File upload validation

Never commit API keys, passwords, or `.env` files.

## Project Purpose

This project demonstrates a digital grievance management workflow with AI-assisted complaint analysis, citizen tracking, and administrative processing.

## Disclaimer

This application is developed as a demonstration prototype for evaluation purposes. It is not an official Government of Kerala service and does not represent government endorsement.
