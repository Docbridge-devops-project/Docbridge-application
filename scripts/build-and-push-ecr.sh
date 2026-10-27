#!/usr/bin/env bash
set -euo pipefail

: "${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID}"
: "${AWS_REGION:?Set AWS_REGION}"
: "${IMAGE_TAG:?Set IMAGE_TAG to an immutable version tag}"

if [[ "$IMAGE_TAG" == "latest" ]]; then
  echo "IMAGE_TAG must be an immutable version tag, not latest." >&2
  exit 2
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
DRY_RUN="${DRY_RUN:-false}"
PUSH_LATEST="${PUSH_LATEST:-false}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

images=(
  "frontend|frontend"
  "api-gateway|gateway"
  "auth-service|services/auth-service"
  "consultation-service|services/consultation-service"
  "prescription-service|services/prescription-service"
  "reminder-service|services/reminder-service"
  "labreport-service|services/labreport-service"
  "symptom-service|services/symptom-service"
  "ai-companion-service|services/ai-companion-service"
  "health-summary-service|services/health-summary-service"
  "family-service|services/family-service"
  "db-migrations|database"
)

if [[ "$DRY_RUN" != "true" ]]; then
  command -v aws >/dev/null || { echo "aws CLI is required." >&2; exit 1; }
  command -v docker >/dev/null || { echo "docker is required." >&2; exit 1; }
  for entry in "${images[@]}"; do
    repository="${entry%%|*}"
    aws ecr describe-repositories --registry-id "$AWS_ACCOUNT_ID" --repository-names "$repository" --region "$AWS_REGION" >/dev/null
  done
  aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
else
  echo "DRY_RUN=true: AWS calls, Docker login, builds, tags, and pushes are skipped; repository existence is not verified."
fi

for entry in "${images[@]}"; do
  repository="${entry%%|*}"
  context="${entry#*|}"
  image="${ECR_REGISTRY}/${repository}:${IMAGE_TAG}"
  if [[ "$DRY_RUN" == "true" ]]; then
    printf 'Would build and push %s from %s\n' "$image" "$context"
    continue
  fi
  docker build -t "$image" "$ROOT_DIR/$context"
  if [[ "$PUSH_LATEST" == "true" ]]; then
    docker tag "$image" "${ECR_REGISTRY}/${repository}:latest"
  fi
  docker push "$image"
  if [[ "$PUSH_LATEST" == "true" ]]; then
    docker push "${ECR_REGISTRY}/${repository}:latest"
  fi
  printf 'Pushed %s\n' "$image"
done

echo "Image operation complete for ${#images[@]} repositories (tag ${IMAGE_TAG})."