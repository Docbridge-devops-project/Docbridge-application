# Container Image Build Matrix

Build context is the directory shown. Run commands from this repository root after setting `AWS_ACCOUNT_ID`, `AWS_REGION`, and immutable `IMAGE_TAG`.

| Kubernetes image / ECR repository | Application directory and Dockerfile | Build context | Container port | Deployment or Job |
| --- | --- | --- | ---: | --- |
| `frontend` | `frontend/Dockerfile` | `frontend` | 80 | `frontend` |
| `api-gateway` | `gateway/Dockerfile` | `gateway` | 3000 | `api-gateway` |
| `auth-service` | `services/auth-service/Dockerfile` | `services/auth-service` | 3001 | `auth-service` |
| `consultation-service` | `services/consultation-service/Dockerfile` | `services/consultation-service` | 3002 | `consultation-service` |
| `prescription-service` | `services/prescription-service/Dockerfile` | `services/prescription-service` | 3003 | `prescription-service` |
| `reminder-service` | `services/reminder-service/Dockerfile` | `services/reminder-service` | 3004 | `reminder-service` |
| `labreport-service` | `services/labreport-service/Dockerfile` | `services/labreport-service` | 3005 | `labreport-service` |
| `symptom-service` | `services/symptom-service/Dockerfile` | `services/symptom-service` | 3006 | `symptom-service` |
| `ai-companion-service` | `services/ai-companion-service/Dockerfile` | `services/ai-companion-service` | 3007 | `ai-companion-service` |
| `health-summary-service` | `services/health-summary-service/Dockerfile` | `services/health-summary-service` | 3008 | `health-summary-service` |
| `family-service` | `services/family-service/Dockerfile` | `services/family-service` | 3009 | `family-service` |
| `db-migrations` | `database/Dockerfile` | `database` | N/A | `db-migration` Job and `db-seeder` Job |

The database image is verified as the Jobs image: its Docker context contains the Sequelize CLI dependencies and migration/seed scripts, it defines `migrate` and `seed` package scripts, and the existing Jobs invoke those scripts. No database server image is built from `database/Dockerfile`.

The helper `scripts/build-and-push-ecr.sh` builds and pushes each matrix entry. Equivalent command template:

```bash
docker build -t "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/REPOSITORY:${IMAGE_TAG}" CONTEXT
docker push "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/REPOSITORY:${IMAGE_TAG}"
```

All Node service images use the existing `USER node` declaration. The nginx frontend image does not explicitly set a non-root user and may need a separate runtime configuration review before enforcing non-root execution.