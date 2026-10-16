# 🛡️ AI-Powered Smart Cloud Security & DevOps Intelligence Platform

**SentinelOps** is an intelligent cloud security and DevOps monitoring platform designed to monitor system metrics, identify suspicious activity, visualize security alerts, analyze application logs, and support secure software delivery through DevOps practices.

The platform combines a centralized security dashboard with user authentication, backend APIs, MongoDB persistence, machine-learning-based anomaly detection, and DevOps workflow visualization.

---

## 📌 Project Overview

The **AI-Powered Smart Cloud Security & DevOps Intelligence Platform** provides a unified interface for monitoring cloud infrastructure, reviewing security events, analyzing application logs, and investigating unusual system behavior.

The application includes a React-based frontend, a Node.js and Express backend, a MongoDB database, and a Python FastAPI service for anomaly detection.

User authentication provides a sign-in and sign-up workflow before users access the dashboard.

## 🎯 Objectives

- Monitor CPU utilization, memory usage, request counts, and other system metrics.
- Authenticate users before granting access to the dashboard.
- Provide secure user registration and sign-in.
- Display security alerts and support alert resolution.
- Collect and review application logs.
- Integrate an anomaly-detection service for identifying unusual metric patterns.
- Visualize DevOps pipeline stages and security scanning activities.
- Support containerization and cloud deployment.
- Provide a responsive, centralized cloud security dashboard.

## ✨ Key Features

### 1. User Authentication

- User registration through a sign-up page.
- User sign-in using registered credentials.
- Password hashing before database storage.
- JSON Web Token (JWT)-based authentication.
- Authentication-aware dashboard access.
- User account information display.
- Sign-out functionality.

**Authentication security:** Password hashing, JWT verification, protected backend endpoints, token expiration, and secure token handling must be configured and tested according to the implementation. Adding a login interface alone does not secure every API endpoint.

### 2. Security Dashboard

- Dashboard overview of reported system metrics.
- CPU and memory utilization cards.
- Request count and anomaly summaries.
- CPU utilization history chart.
- Security alerts overview.
- Navigation to monitoring and security modules.

### 3. Security Alerts

- View security events returned by the backend.
- Filter alerts by severity and status.
- Search alerts by title, message, or source.
- Update alert status to acknowledged or resolved when supported by the backend.
- Review alert details for investigation.

### 4. System Metrics

- CPU utilization.
- Memory usage.
- Requests processed.
- Failed login counts.
- Network traffic.
- Error counts.

The metrics displayed depend on the data collected and returned by the backend.

### 5. Application Logs

- View application events.
- Search logs by message, source, or event.
- Review event status and timestamps.
- Identify failed events for further investigation.

### 6. ML Anomaly Detection

- Submit system metrics to the anomaly-detection service.
- Receive predictions through the backend API.
- Display prediction labels and anomaly status.
- Show severity scores and recommendations when returned by the service.

The actual detection capability depends on the configured model and the successful connection between the backend and ML service.

### 7. DevOps Pipeline

The dashboard can visualize a CI/CD workflow containing:

1. Clone Repository
2. Compile and Build
3. Run Tests
4. Package Application
5. File Security Scan
6. SonarQube Analysis
7. Quality Gate
8. Build and Scan Docker Image
9. Push Image and Deploy to AWS

Pipeline visualization represents planned or configured stages. A stage should only be described as automatically executed when the corresponding CI/CD integration is implemented and verified.

### 8. Help and User Interface

- Sidebar navigation.
- Responsive dashboard layout.
- Notification interface.
- Help and support panel.
- User account menu.
- Sign-in and sign-up pages.

---

## 🏗️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas or MongoDB |
| Authentication | JWT, bcryptjs |
| ML Service | Python, FastAPI, Uvicorn |
| API Communication | Axios, REST APIs |
| Containerization | Docker, Docker Compose |
| Version Control | Git, GitHub |
| CI/CD | Jenkins or AWS CI/CD services, depending on configuration |
| Security and Code Quality | Trivy, SonarQube |
| Cloud Infrastructure | AWS services, according to deployment configuration |

---

## 📁 Project Structure

The following is a representative project structure. Your actual repository may contain additional components or differently named files.

```text
cloud-security-devops/
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Alert.js
│   │   ├── Log.js
│   │   └── Metric.js
│   │
│   ├── routes/
│   │   └── auth.js
│   │
│   ├── services/
│   │   └── eventProcessor.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── AuthGate.jsx
│   │   │   ├── AuthPages.jsx
│   │   │   └── Auth.css
│   │   │
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── .env
│
├── ml-service/
│   ├── main.py
│   └── requirements.txt
│
├── docker-compose.yml
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

**Note:** The authentication filenames shown above assume the authentication starter files have been added to the project. Adjust the structure to match your actual files.

---

## ⚙️ Prerequisites

Install the following tools before running the project:

- Node.js and npm.
- Python 3.10 or another version compatible with your ML dependencies.
- MongoDB or a configured MongoDB Atlas database.
- Git.
- Docker Desktop, if using containerized execution.

A GitHub account is required to clone the repository and collaborate on development.

---

## 🚀 Getting Started

### Step 1: Clone the Repository

```bash
git clone https://github.com/vanshikashar/Final-Year-Project.git
cd Final-Year-Project/cloud-security-devops
```

Use the repository's actual project directory if its structure differs.

### Step 2: Configure the Frontend

Open a terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173
```

### Step 3: Configure the Backend

Open a second terminal:

```bash
cd backend
npm install
```

Install the authentication dependencies if they are not already present:

```bash
npm install bcryptjs jsonwebtoken
```

Create or update `backend/.env` using the variables required by your backend.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_generated_jwt_secret
FRONTEND_URL=http://localhost:5173
ML_SERVICE_URL=http://127.0.0.1:8000
INGEST_API_KEY=your_ingestion_api_key
```

Generate a JWT secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Replace the example values with your actual configuration. Do not use the example strings as production credentials.

Start the backend using the script defined in `backend/package.json`. For example:

```bash
npm start
```

If your project uses a development script instead, run:

```bash
npm run dev
```

### Step 4: Configure the ML Service

Open a third terminal:

```bash
cd ml-service
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies from your ML service requirements file:

```powershell
python -m pip install -r requirements.txt
```

Start FastAPI:

```powershell
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

This command assumes `main.py` exposes a FastAPI instance named `app` and the requirements file contains the necessary dependencies.

---

## 🔐 Authentication Setup

### 1. Install Authentication Dependencies

From the backend directory:

```bash
npm install bcryptjs jsonwebtoken
```

Ensure `express` and `mongoose` are also installed as required by your existing backend.

### 2. Create the User Model

The user model should store the information required for authentication, such as:

- Full name.
- Email address.
- Hashed password.
- Account creation timestamp.

Passwords must never be stored as plaintext.

### 3. Configure Authentication Routes

Mount the authentication router in `backend/server.js` after the JSON parsing middleware:

```javascript
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);
```

This assumes the route file exports a valid Express router.

Typical authentication endpoints are:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Authenticate an existing user |
| GET | `/api/auth/me` | Retrieve the authenticated user's account information |

These endpoints must be implemented in the backend before they can be used.

### 4. Integrate the Authentication Pages

Add the authentication components to the frontend:

```text
frontend/src/auth/
├── AuthGate.jsx
├── AuthPages.jsx
└── Auth.css
```

Import the authentication gate into your existing `App.jsx`:

```jsx
import AuthGate from "./auth/AuthGate";
```

Wrap the existing dashboard layout with the gate, preserving the current sidebar, navbar, charts, alerts, and other components.

The gate should display the sign-in page to unauthenticated users and allow authenticated users to access the dashboard.

The exact integration depends on your existing component structure.

### 5. Authentication Flow

1. A new user opens the application.
2. The application displays the sign-in page.
3. The user selects the sign-up option to create an account.
4. The backend validates the submitted details and hashes the password.
5. The user signs in with the registered credentials.
6. The backend verifies the credentials and issues an authentication token.
7. The frontend uses the authenticated session to access the dashboard.
8. The user can sign out to end the session.

The backend must independently verify authentication on protected API requests. Hiding dashboard components in React is not sufficient to secure the data.

### 6. Test Authentication

Verify the following cases:

- Register a new account successfully.
- Reject duplicate email addresses.
- Reject invalid registration details.
- Reject incorrect sign-in credentials.
- Prevent unauthenticated access to protected endpoints.
- Verify token expiration and invalid-token handling.
- Display the correct account information.
- Sign out and confirm that the previous session cannot access protected endpoints.

---

## 🔌 API Endpoints

The frontend and backend are expected to communicate through REST APIs.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/metrics` | Retrieve system metrics |
| GET | `/api/alerts` | Retrieve security alerts |
| GET | `/api/logs` | Retrieve application logs |
| POST | `/api/detect` | Submit metrics for anomaly detection |
| PATCH | `/api/alerts/:id/status` | Update alert status |
| POST | `/api/auth/signup` | Register a user |
| POST | `/api/auth/signin` | Sign in a user |
| GET | `/api/auth/me` | Retrieve the current user's account |

The authentication endpoints are expected routes and must exist in your implementation. Apply authentication and authorization to the endpoints that require a logged-in user.

---

## 🧠 Anomaly Detection Workflow

1. Collect or retrieve system metrics.
2. Submit the selected metrics to the detection endpoint.
3. Forward the request to the Python ML service.
4. Process the metrics using the configured detection logic.
5. Return the prediction to the backend.
6. Display the result in the dashboard.
7. Persist and display alerts if the backend implements alert storage.

The application should report a service error when the ML service is unavailable rather than presenting an unverified prediction as a successful detection.

---

## 🐳 Docker Deployment

If Docker Compose is configured for the services, run the following command from the project root:

```bash
docker compose up --build
```

To stop the containers:

```bash
docker compose down
```

Verify that the Docker configuration includes the required services, ports, environment variables, and network configuration.

Do not include secrets directly in the Docker Compose file or commit them to the repository.

---

## ☁️ AWS Deployment and CI/CD

The platform can be deployed using AWS services according to the current infrastructure configuration.

Potential deployment components include:

- AWS Elastic Beanstalk for the Node.js backend.
- Amazon ECS with AWS Fargate for containerized services.
- Amazon ECR for Docker image storage.
- AWS CodePipeline and AWS CodeBuild for automated builds and deployments.
- Amazon CloudWatch for logs and monitoring.
- MongoDB Atlas for database hosting.

These are possible deployment components, not a claim that all of them are currently configured.

### Deployment Checklist

1. Configure production environment variables.
2. Ensure the backend can connect to MongoDB Atlas.
3. Configure the production ML service URL.
4. Verify security groups, network access, and service connectivity.
5. Build and test the frontend.
6. Build and publish backend and ML service images if using ECS.
7. Configure the deployment pipeline.
8. Verify application health after deployment.
9. Test authentication, dashboard APIs, and anomaly detection against the deployed services.

Never configure a production backend to call `localhost` when the ML service is running in another container or on another server. Use the correct reachable service URL.

---

## 🔒 Security Considerations

- Keep credentials in environment variables.
- Exclude `.env` files from Git.
- Hash passwords with a suitable password-hashing algorithm.
- Protect JWT secrets and configure token expiration.
- Validate and sanitize API inputs.
- Apply authentication and authorization middleware to protected endpoints.
- Restrict CORS to trusted frontend origins.
- Use HTTPS for production traffic.
- Apply rate limits to sensitive endpoints.
- Restrict database access and use appropriate database credentials.
- Review security scan results before deployment.
- Verify alerts against actual logs and infrastructure telemetry.
- Avoid logging passwords, JWTs, or other sensitive credentials.

For production authentication, consider Secure, HttpOnly cookies with appropriate CSRF protection, or another carefully designed session strategy. Browser storage of bearer tokens has additional exposure to cross-site scripting.

---

## 🧪 Testing and Troubleshooting

### Backend Health Check

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

### ML Service Health Check

```powershell
Invoke-RestMethod http://localhost:8000/health
```

The ML health route must be implemented in the FastAPI application.

### Test Anomaly Detection

```powershell
$body = @{
  cpu = 100
  memory = 100
  request_count = 0
  failed_logins = 0
  network_traffic = 0
  error_count = 0
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5000/api/detect" `
  -ContentType "application/json" `
  -Body $body
```

### Common Issues

**MongoDB authentication failure:** Verify the connection string, database user credentials, network access rules, and URL encoding of special characters.

**ML service unavailable:** Confirm that FastAPI is running, its health endpoint responds, and `ML_SERVICE_URL` points to the correct service address.

**Sign-in fails:** Verify that the authentication routes are mounted, the frontend API URL is correct, and the backend is using the expected JWT secret.

**Dashboard is accessible without signing in:** Check the frontend authentication gate and ensure protected backend endpoints also validate the user's authentication.

**AWS deployment fails:** Review deployment logs, environment variables, health checks, networking, and container startup commands.

---

## 🔮 Future Enhancements

- Integrate AWS CloudWatch metrics and alerts.
- Introduce role-based access control.
- Add audit logging for account and security events.
- Automate CI/CD with security scanning and quality gates.
- Improve anomaly detection using a trained ML model.
- Add historical analytics and configurable alert thresholds.
- Introduce password reset and email verification workflows.
- Add stronger account security and session management.
- Add automated integration and end-to-end tests.

---

## 👩‍💻 Development

This project focuses on integrating cloud monitoring, security analytics, user authentication, anomaly detection, and DevOps practices into a unified application.

Contributions and improvements should be tested locally before being merged into the development or production branch.

## 📄 License

A license has not yet been specified. Add a `LICENSE` file if you intend to distribute or reuse this project publicly.
