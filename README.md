# DocBridge - Application Repository

This repository contains the application source code and CI/CD pipelines for the DocBridge system, a production-grade microservice-based healthcare application.

- Infrastructure Code: [DocBridge-terraform](../DocBridge-terraform)
- Kubernetes Config & Charts: [DocBridge-kubernetes](../DocBridge-kubernetes)

## Overview & Architecture

DocBridge is built using a microservice architecture to support high scalability, modular deployment, and robust cloud integrations. The core services communicate asynchronously via Azure Service Bus (Event-Driven) and share an API Gateway which handles client routing, rate limiting, and CORS configuration.

```
                  +------------------+
                  |    React SPA     |
                  +--------+---------+
                           |
                           v
                  +--------+---------+
                  |   API Gateway    |
                  +--------+---------+
                           |
      +--------------------+--------------------+
      |                    |                    |
+-----+------+       +-----+------+       +-----+------+
| Auth Serv. |       | Patient S. |       | AI Companion|
+------------+       +------------+       +------------+
```

### Services List

| Service Name | Port | Description |
|---|---|---|
| `api-gateway` | 3000 | Reverse proxy routing client requests, rate-limiting, and managing CORS. |
| `auth-service` | 3001 | Handles JWT token issuance, verification, and user registration. |
| `consultation-service` | 3002 | Manages clinical consultations and logs patient interactions. |
| `prescription-service` | 3003 | Manages doctor prescriptions. |
| `reminder-service` | 3004 | Handles notification schedules. |
| `labreport-service` | 3005 | Manages laboratory results. |
| `symptom-service` | 3006 | Records patient symptoms. |
| `ai-companion-service`| 3007 | Integrates with Azure OpenAI to provide health summaries and companion chat. |
| `health-summary-service`| 3008| Generates medical timelines and metrics. |
| `family-service` | 3009 | Handles familial relations and permission settings. |
| `frontend` | 80/443| React single-page application served via Nginx. |

## Tech Stack & Justifications

- **Frontend**: React SPA for a dynamic, responsive user interface.
- **Backend Services**: Node.js and Express for lightweight and high-throughput asynchronous execution.
- **API Gateway**: Express-Gateway/Custom Proxy setup for low-overhead routing and flexible middleware configuration.
- **Database**: PostgreSQL Flexible Server for secure relational data storage.
- **Message Bus**: Azure Service Bus for enterprise event-driven communication.
- **Caching & Session State**: Redis for sub-millisecond data retrieval.
- **AI Integration**: Azure OpenAI (GPT-4) for AI-driven clinical context mapping.

## Local Development Setup

To run the application locally, you can spin up the entire stack using Docker Compose.

### Running with Docker Compose

1. Clone this repository.
2. Create `.env` files in each service directory (you can copy `.env.example`).
3. Run the following command from the root directory:
   ```bash
   docker-compose up --build
   ```

### Key Environment Variables

Each service expects a set of environment variables:
- `PORT`: Service port
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database credentials
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Base64 secrets for token signing
- `REDIS_URL`: Connection string for Redis cache
- `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`: Open AI config

## CI/CD Pipeline

We use GitHub Actions to manage builds, scans, and deployments.

### Workflows

1. **Build Pipeline (`build.yml`)**:
   - Triggers on push to `main` or `develop`, and PR to `main`.
   - Runs SonarCloud SAST and Snyk SCA scan for changed services.
   - Builds Docker image locally and executes a **Trivy Image Security Scan** with a hard gate (`exit-code: 1` on CRITICAL or HIGH findings, ignoring unfixed base image issues).
   - Uploads Trivy SARIF results to the GitHub Security tab.
   - Pushes successfully scanned images to Azure Container Registry (ACR) with tags for `latest` and `short-sha`.

2. **Deploy Pipeline (`deploy.yml`)**:
   - Triggers automatically upon successful run of the Build Pipeline.
   - Pulls Terraform outputs from the state store to get resource names and endpoints.
   - Halts for manual approval gate targeting the `production` environment.
   - Runs Helm upgrade to deploy configurations to the `production` namespace.
   - Conducts rollout verification and smoke tests hitting `/healthz`, `/ready`, and `/api/v1/health`.

### Required GitHub Secrets

The pipeline requires several secrets to authenticate to Azure via OIDC and run third-party security scans.

> [!TIP]
> Use Organization-level secrets in your GitHub organization (`Docbridge-devops-project`) to avoid duplicating credentials between repositories.

| Secret Name | Description | Source / How to Generate |
|---|---|---|
| `AZURE_CLIENT_ID` | Service Principal Client ID | Azure Active Directory App Registration |
| `AZURE_TENANT_ID` | Azure Tenant ID | Azure Active Directory Properties |
| `AZURE_SUBSCRIPTION_ID`| Azure Subscription ID | Azure Subscriptions Overview |
| `TF_STORAGE_ACCOUNT_NAME`| Remote state storage account name | Azure Storage Account |
| `TF_CONTAINER_NAME` | Blob container name for tfstate | Azure Blob Container |
| `DB_PASSWORD` | PostgreSQL flexible server password | Custom secure string |
| `JWT_ACCESS_SECRET` | Secret for access token sign | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Secret for refresh token sign | `openssl rand -base64 32` |
| `AZURE_OPENAI_KEY` | API Key for Azure OpenAI Resource | Azure Cognitive Services OpenAI Key |
| `ALERT_EMAIL` | DevOps email target for failure alerts| Email Address |
| `SMTP_USERNAME` | Gmail address used to send alerts | Gmail account name |
| `SMTP_PASSWORD` | App Password for sending alert emails | Google App Passwords settings |
| `SONAR_TOKEN` | Token for SonarCloud analysis | [sonarcloud.io](https://sonarcloud.io) account settings |
| `SONAR_ORGANIZATION` | SonarCloud organization name | SonarCloud Account Org Key |
| `SNYK_TOKEN` | Token for Snyk SCA scans | [app.snyk.io](https://app.snyk.io) user settings |
| `KUBERNETES_REPO_PAT` | GitHub PAT with read access to K8s repo | GitHub Settings > Developer Settings > PATs |

## Security & Workload Identity

This application utilizes **Azure Workload Identity** for passwordless communication with Azure Key Vault. 
- Pods run under a `ServiceAccount` annotated with the Client ID of a User-Assigned Managed Identity.
- The AKS cluster's OIDC issuer exchange is used to fetch Azure AD tokens, which allows pods to retrieve database and API credentials from Key Vault dynamically via the Secret Store CSI Driver.
- Container images run as non-root users to limit privilege escalation.

## Branching Strategy & Protection Rules

### Branches

- `main`: Reflects current production state. Protected branch. No direct pushes.
- `develop`: Integration branch for features. Protected branch.
- `feature/*`: Development of new features, branch off `develop`.
- `fix/*` & `hotfix/*`: Bug fixes.

### Branch Protection Rules for main

1. Require pull request before merging (Direct push disabled).
2. Require at least 1 approving review.
3. Dismiss stale pull request approvals on new commits.
4. Require status checks to pass before merging (`build` job in `build.yml`).
5. Require branches to be up to date before merging.
6. Restrict force pushes and branch deletions.
