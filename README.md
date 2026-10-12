# 🛡️ AI-Powered Smart Cloud Security & DevOps Intelligence Platform

An intelligent cloud security and DevOps monitoring platform designed to monitor system metrics, identify suspicious activity, visualize security alerts, and support secure software delivery through DevOps practices.

## 📌 Project Overview

The **AI-Powered Smart Cloud Security & DevOps Intelligence Platform** combines cloud monitoring, security event management, anomaly detection, and DevOps workflow visualization in a unified dashboard.

The platform provides a centralized interface to review system performance, investigate security events, analyze application logs, and understand the status of planned CI/CD pipeline stages.

## 🎯 Objectives

- Monitor CPU utilization, memory usage, request counts, and other system metrics.
- Display security alerts and support alert resolution.
- Collect and review application logs.
- Integrate an anomaly-detection service for identifying unusual metric patterns.
- Visualize DevOps pipeline stages and security scanning activities.
- Provide a responsive, centralized cloud security dashboard.

## ✨ Key Features

### 1. Security Dashboard
- Real-time-style dashboard interface.
- CPU and memory utilization cards.
- Request count and anomaly summaries.
- CPU utilization history chart.
- Security alerts overview.

### 2. Security Alerts
- View security events returned by the backend.
- Filter alerts by severity and status.
- Search alerts by title, message, or source.
- Update alert status to resolved.

### 3. System Metrics
- CPU utilization.
- Memory usage.
- Requests processed.
- Failed login counts.
- Network traffic.
- Error counts.

### 4. Application Logs
- View application events.
- Search logs by message, source, or event.
- Review event status and timestamps.
- Identify failed events for further investigation.

### 5. ML Anomaly Detection
- Submit system metrics to the anomaly-detection service.
- Display the prediction returned by the service.
- Show relevant anomaly details, severity, and recommendations when provided by the service.

### 6. DevOps Pipeline
The dashboard represents a planned CI/CD workflow that includes:

1. Clone Repository
2. Compile and Build
3. Run Tests
4. Package Application
5. File Security Scan
6. SonarQube Analysis
7. Quality Gate
8. Build and Scan Docker Image
9. Push Image and Deploy to AWS EKS

*Note: Pipeline stages are planned workflow stages unless an actual CI/CD integration is configured and connected.*

## 🏗️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ML Service | Python, FastAPI, Uvicorn |
| API Communication | Axios, REST APIs |
| Containerization | Docker, Docker Compose |
| DevOps | Git, GitHub, Jenkins |
| Security and Code Quality | Trivy, SonarQube |
| Cloud Infrastructure | AWS services, with deployment integrations planned |

The exact technologies enabled in each service depend on the current implementation and configuration.

## 📁 Project Structure

```text
cloud-security-devops/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AlertsTable.jsx
│   │   │   ├── CpuChart.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── Logs.jsx
│   │   │   └── Pipeline.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
├── ml-service/
│   └── main.py
│
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

*Folder contents may vary depending on your current implementation.*

## ⚙️ Prerequisites

Install the following tools before running the project:

- Node.js and npm
- Python 3.10 or another version compatible with your ML dependencies
- MongoDB or a configured MongoDB Atlas connection
- Git
- Docker Desktop (optional, for containerized execution)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd cloud-security-devops
```

Replace the placeholder with your actual GitHub repository URL.

### 2. Start the frontend

Open a terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually `http://localhost:5173`.

### 3. Start the Node.js backend

Open a second terminal:

```bash
cd backend
npm install
```

Configure your backend environment variables, then use the start command defined in `backend/package.json`. For example, if a `dev` script exists:

```bash
npm run dev
```

If your project uses a different script, run the corresponding command instead.

### 4. Start the Python ML service

Open a third terminal:

```bash
cd ml-service
python -m venv .venv
```

Activate the environment on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies listed in your ML service requirements file. If you have not created one yet, install the required packages for your implementation, including FastAPI and Uvicorn.

Start the service:

```powershell
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

This command assumes `ml-service/main.py` exposes a FastAPI application named `app`.

### 5. Configure environment variables

Create the required local environment files based on your project's configuration.

Example frontend `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Example backend `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Use the actual variable names expected by your backend. Configure any additional ML-service settings required by your implementation.

**Security:** Never commit real credentials, passwords, database connection strings, or API keys to GitHub.

## 🔌 API Endpoints

The frontend API client is configured to communicate with the following endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/metrics` | Retrieve system metrics |
| GET | `/api/alerts` | Retrieve security alerts |
| GET | `/api/logs` | Retrieve application logs |
| POST | `/api/detect` | Submit metrics for anomaly detection |
| PATCH | `/api/alerts/:alertId/status` | Update an alert's status |

These are the frontend's expected API routes. Each route must be implemented and available in the relevant service for its corresponding functionality to work.

## 🧠 Anomaly Detection Workflow

1. Collect or retrieve system metrics.
2. Submit the selected metrics to the detection endpoint.
3. Process the metrics using the configured detection logic.
4. Return the detection result to the frontend.
5. Display the returned result for investigation.
6. Persist and display alerts if the backend implements alert storage.

The dashboard displays actual service responses; the presence of a detection interface alone does not establish that a machine-learning model is trained or running.

## 🐳 Docker Deployment

If Docker Compose is configured for your services, start the containers from the repository root:

```bash
docker compose up --build
```

To stop the containers:

```bash
docker compose down
```

Ensure that environment variables, ports, service names, and database settings in `docker-compose.yml` match your project configuration.

## 🔒 Security Considerations

- Keep credentials in environment variables.
- Exclude `.env` files and sensitive configuration from version control.
- Validate and sanitize API inputs.
- Protect sensitive endpoints with appropriate authentication and authorization.
- Review security scan results before deployment.
- Verify alerts against actual logs and infrastructure telemetry.

## 🔮 Future Enhancements

- Integrate AWS CloudWatch metrics and alerts.
- Deploy the application using Docker and AWS infrastructure.
- Automate CI/CD using Jenkins or GitHub Actions.
- Add Trivy image scanning and SonarQube quality gates.
- Improve anomaly detection using a trained ML model.
- Introduce role-based access control and audit logging.
- Add historical analytics and configurable alert thresholds.

## 👩‍💻 Development

This project is being developed as a cloud security and DevOps intelligence platform, with a focus on integrating monitoring, security analytics, and software delivery workflows.

## 📄 License

A license has not yet been specified. Add a license file if you intend to distribute or reuse this project publicly.
