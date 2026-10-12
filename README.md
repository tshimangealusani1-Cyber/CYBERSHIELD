# CYBERSHIELD
### AI-Enhanced Honeypot and Phishing Awareness System

## 1. Project Overview

CYBERSHIELD is a cybersecurity project aimed at improving phishing awareness among university students while exploring the use of artificial intelligence and honeypot technology for security monitoring.

The system is being developed as a web application that combines phishing-awareness assessments, AI-assisted evaluation, personalised educational feedback, and a honeypot monitoring dashboard.

The project is currently under development. Some components are functional, while others still need to be implemented and integrated.

## 2. Project Objectives

The main objectives are to:

- Help students recognise phishing emails, suspicious links, fraudulent messages, and other phishing indicators.
- Assess students' decisions and written reasoning when analysing suspicious communications.
- Use AI to assist with evaluating reasoning and generating personalised educational feedback.
- Explore honeypot technology for recording and monitoring suspicious activity.
- Display security events and statistics through a central web dashboard.
- Strengthen the system through authentication, database integration, security controls, testing, and deployment.

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development server and build tool |
| JavaScript | Frontend functionality and application logic |
| HTML and CSS | Website structure and styling |
| Python | Backend development |
| Flask | Backend API |
| Flask-CORS | Cross-origin communication between frontend and backend |
| Ollama | Local AI model runtime |
| Qwen3:8B | AI model used for assessment evaluation |
| PowerShell | Testing backend endpoints and submitting simulated security events |
| Git and GitHub | Version control and group collaboration |

**Planned technologies:** PostgreSQL or another agreed database may be introduced for persistent storage. Hosting and deployment will be decided as the project develops.

## 4. Current Project Structure

The project contains a frontend and a backend.

```text
CYBERSHIELD/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
├── backend/
│   ├── app.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

This is the intended high-level structure. If the actual repository contains additional files or folders, retain them as needed.

## 5. Features Already Implemented

### 5.1 Website frontend

- Dark-themed CYBERSHIELD interface.
- Navigation between the home page, phishing assessment, results, and honeypot monitoring pages.
- Interactive phishing-awareness scenarios.
- Student decision-making and written reasoning.
- Assessment scoring and results presentation.

### 5.2 AI-assisted assessment

- The frontend sends assessment information to the Flask backend.
- The backend communicates with the locally running Ollama service.
- The configured model is `qwen3:8b`.
- The AI assists with evaluating written reasoning and generating educational feedback.
- The evaluation response can include a decision assessment, reasoning quality, risk level, score, summary, identified indicators, missing indicators, and recommendations.

The AI evaluation depends on the local Ollama service being available.

### 5.3 Honeypot monitoring dashboard

- Flask endpoints provide honeypot status and event information.
- The React dashboard retrieves and displays recorded events.
- Events include a timestamp, source IP address, event type, details, severity, and status.
- Dashboard statistics include threats detected, attack attempts, suspicious sources, and critical events.
- A POST endpoint accepts new honeypot event records.

### 5.4 Simulated security events

The current backend contains example events such as:

- SSH login attempts.
- Brute-force attempts.
- Port scans.
- Suspicious commands.
- Unauthorised access attempts.

A simulated event was successfully submitted using PowerShell and subsequently appeared on the website, with the dashboard statistics updating.

**Important:** The current event records are simulated. The system does not yet automatically detect real network attacks through a fully implemented honeypot service.

## 6. How the Application Works

### Assessment workflow

1. A student opens the website.
2. The student selects a phishing-awareness scenario.
3. The student decides whether the communication is suspicious or legitimate.
4. The student provides reasoning.
5. The application evaluates the response and requests AI-assisted feedback from the backend.
6. The student receives assessment results and recommendations.

### Honeypot monitoring workflow

1. A simulated security event is submitted to the Flask backend.
2. Flask records the event in the current in-memory event list.
3. The frontend requests the recorded events through the API.
4. The monitoring dashboard displays the events and updated statistics.

The current workflow requires events to be submitted or already present in the backend. Automatic event collection from a real honeypot has not yet been implemented.

## 7. Requirements

Before running the application, install the following:

- Git.
- Node.js and npm.
- Python 3.
- Visual Studio Code or another code editor.
- Ollama, with the `qwen3:8b` model downloaded.

Check that Node.js and npm are installed:

```bash
node --version
npm --version
```

Check Python:

```bash
python --version
```

Check Ollama:

```bash
ollama --version
```

## 8. How to Run the Project Locally

You must run the frontend and backend separately.

### Step 1: Clone the repository

Clone the repository URL shared by the project owner.

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd CYBERSHIELD
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual GitHub repository URL. The folder name may differ depending on the repository name.

### Step 2: Set up the frontend

Open a terminal in VS Code and run:

```bash
cd frontend
npm install
npm run dev
```

Vite will display a local development URL, usually:

```text
http://localhost:5173
```

Open the URL in your browser.

Keep this terminal running.

### Step 3: Set up the Python backend

Open a second terminal in VS Code.

From the project root, run:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, consult the Python virtual-environment documentation or use Command Prompt activation instead.

Install the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

Start Flask:

```bash
python app.py
```

The backend is expected to run at:

```text
http://127.0.0.1:5000
```

Keep this terminal running too.

If the dependencies or commands differ in the repository, follow the actual `requirements.txt` and `app.py` configuration.

### Step 4: Start Ollama

Open a third terminal.

Ensure the model is installed:

```bash
ollama pull qwen3:8b
```

Start Ollama if it is not already running:

```bash
ollama serve
```

If Ollama is already running as a background service, do not start a second instance. Confirm the model is available:

```bash
ollama list
```

The backend must be configured to use the same model name.

### Step 5: Test the application

1. Open the frontend URL in your browser.
2. Navigate through the available assessment pages.
3. Test AI evaluation while Flask and Ollama are running.
4. Open the honeypot monitoring dashboard.
5. Submit a test event using the instructions below.
6. Confirm that the event appears on the dashboard.

If a service fails to start, check the corresponding terminal for error messages.

## 9. Testing a Simulated Honeypot Event

With the Flask backend running, open PowerShell and execute:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:5000/api/honeypot/events" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "event": "SSH Login Attempt",
    "source_ip": "192.168.1.200",
    "severity": "Critical",
    "details": "Simulated failed SSH authentication attempt",
    "status": "Blocked"
  }'
```

This sends a simulated event to the backend.

Open or refresh the honeypot monitoring page to check whether the event appears.

The source IP address and event details above are test data; this command does not perform an actual SSH attack.

## 10. Backend API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Checks backend availability |
| `/api/evaluate` | POST | Requests assessment evaluation |
| `/api/honeypot/status` | GET | Retrieves honeypot monitoring statistics |
| `/api/honeypot/events` | GET | Retrieves recorded security events |
| `/api/honeypot/events` | POST | Submits a security event record |

The exact request and response formats should be confirmed from `backend/app.py` before other group members build additional integrations.

## 11. Current Limitations

The following items still require work or confirmation:

- A fully implemented interactive honeypot simulation accessible through the website.
- Automatic collection of events from an actual honeypot service.
- Secure user authentication and authorisation.
- Database integration for persistent user, assessment, and event records.
- Agreed access-control rules for students and administrators.
- Improved input validation, API protection, and security testing.
- Verification of the AI evaluation process and its consistency.
- Deployment to an agreed server or hosting environment.
- Pilot testing and documentation of actual results.

The current honeypot event list is stored in memory. Event records may be lost when the backend restarts, and this is not a substitute for persistent database storage.

## 12. Security and Privacy

- Do not commit passwords, API keys, tokens, or private configuration files to GitHub.
- Do not use real student credentials or collect real passwords in phishing simulations.
- Use fictional accounts, test data, and controlled scenarios.
- Keep any future honeypot isolated from personal devices and production systems.
- Restrict access to monitoring data and protect collected information.
- Obtain the necessary institutional approval and informed consent before conducting participant testing.
- Follow applicable privacy and data-protection requirements, including POPIA where applicable.

## 13. Group Collaboration

This repository is intended to be the shared codebase for the CYBERSHIELD group project.

Group members should:

1. Clone the repository to their own computers.
2. Follow the setup instructions before making changes.
3. Pull the latest changes before starting work.
4. Work on separate branches when practical.
5. Test their changes before submitting them.
6. Use pull requests or agree on another review process before merging changes.
7. Avoid overwriting another member's work or committing local configuration files.

Coordinate changes to shared files such as `App.jsx` and `app.py` before editing them simultaneously.

## 14. Recommended Next Steps

1. Agree on the final architecture based on the lecturer's requirements.
2. Confirm the hosting and deployment expectations.
3. Implement secure login and role-based access.
4. Decide on and integrate the database.
5. Build the interactive honeypot simulation and connect it to the monitoring dashboard.
6. Implement automatic event collection from the honeypot service.
7. Strengthen security controls and apply the CIA triad.
8. Test the integrated system and conduct the approved pilot study.
9. Document actual results only after testing has been completed.

## 15. Project Status

**Current status:** Working development prototype with an interactive frontend, Flask backend, local Ollama-based AI evaluation, and a honeypot monitoring dashboard that displays simulated events.

The application is currently intended for local development. Public deployment, secure authentication, database persistence, and automatic collection of real honeypot events remain outstanding work.

---

**CYBERSHIELD — Building phishing awareness through AI-assisted assessment and honeypot-based security monitoring.**