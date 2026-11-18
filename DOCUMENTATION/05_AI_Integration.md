

\# AI Integration



\## 1. Overview



The portal integrates Google Gemini API to provide AI-assisted grievance analysis.



\## 2. Purpose



The AI service helps citizens and administrators understand and classify submitted complaints.



\## 3. Input



The service receives:

\- Grievance subject

\- Grievance description



\## 4. AI Output



The model generates:

\- Suggested department

\- Suggested grievance category

\- Recommended priority (Low, Medium, High)

\- Short grievance summary



\## 5. Implementation



The React frontend sends the grievance subject and description to the FastAPI backend.



The backend:

1\. Validates the request.

2\. Reads the Gemini API key from environment configuration.

3\. Sends the complaint text to the Gemini model.

4\. Processes the model response.

5\. Returns structured suggestions to the frontend.



\## 6. Human Review



AI output is advisory only. Citizens and administrators must review suggestions. The AI does not assign departments, determine official priority, or resolve grievances automatically.



\## 7. Configuration



Set the API key in the backend `.env` file:



`GEMINI\_API\_KEY=your\_api\_key`



Never commit the real API key to GitHub.



\## 8. Limitations



\- AI suggestions may occasionally be inaccurate.

\- Results depend on the availability of the external AI service.

\- The service requires an internet connection and a valid API key.

\- Human verification is required before administrative action.



