

\# Setup and Testing



\## 1. Prerequisites



\- Python

\- Node.js and npm

\- MySQL Server or XAMPP

\- Google Gemini API key



\## 2. Database Setup



1\. Start MySQL using XAMPP.

2\. Create a database named `cm\_kerala\_grievance`.

3\. Configure the database connection in the backend `.env` file.



\## 3. Backend Setup



Open a terminal:



```powershell

cd backend

python -m venv .venv

.\\.venv\\Scripts\\Activate.ps1

pip install -r requirements.txt

```



Configure `.env` with the database URL and Gemini API key.



Start the backend:



```powershell

python -m uvicorn app.main:app --reload

```



Backend URL: `http://127.0.0.1:8000`



API documentation: `http://127.0.0.1:8000/docs`



\## 4. Frontend Setup



Open another terminal:



```powershell

cd frontend

npm install

npm run dev

```



Frontend URL: `http://localhost:5173`



\## 5. Testing Checklist



\- \[ ] Citizen registration and login

\- \[ ] Citizen logout

\- \[ ] Grievance submission

\- \[ ] Unique reference number generation

\- \[ ] Grievance tracking

\- \[ ] Attachment upload

\- \[ ] Administrator dashboard

\- \[ ] Department and officer assignment

\- \[ ] Officer grievance updates

\- \[ ] AI grievance analysis

\- \[ ] Citizen feedback

\- \[ ] Contact enquiry submission

\- \[ ] Role-based access restrictions



\## 6. Testing Notes



Use fictional information and test accounts only.



Verify the application using the frontend and FastAPI Swagger documentation before submission.



