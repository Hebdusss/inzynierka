#!/usr/bin/env bash
# ============================================================================
# deploy.sh - Build Docker images, push to ECR, deploy with Terraform
# Usage: ./deploy.sh
# Prerequisites: aws cli, docker, terraform
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TF_DIR="$SCRIPT_DIR"

AWS_REGION=$(grep 'aws_region' "$TF_DIR/terraform.tfvars" | head -1 | sed 's/.*= *"\(.*\)"/\1/' | tr -d '\r')
PROJECT_NAME=$(grep 'project_name' "$TF_DIR/terraform.tfvars" | head -1 | sed 's/.*= *"\(.*\)"/\1/' | tr -d '\r')
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text | tr -d '\r')

ECR_FRONTEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-frontend"
ECR_BACKEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-backend"

IMAGE_TAG="latest"

echo "========================================"
echo "  Gym-Rats AWS Fargate Deployment"
echo "========================================"
echo "  Region:   $AWS_REGION"
echo "  Account:  $AWS_ACCOUNT_ID"
echo "  Project:  $PROJECT_NAME"
echo "========================================"

# ---- Step 1: Terraform init & create ECR repos ----
echo ""
echo "[1/5] Initializing Terraform..."
cd "$TF_DIR"
terraform init -input=false

echo ""
echo "[2/5] Creating ECR repositories (terraform apply -target)..."
terraform apply -target=aws_ecr_repository.frontend -target=aws_ecr_repository.backend -auto-approve

# ---- Step 2: Docker login to ECR ----
echo ""
echo "[3/5] Logging in to ECR..."
ECR_PASSWORD=$(aws ecr get-login-password --region "$AWS_REGION" | tr -d '\r\n')
echo "$ECR_PASSWORD" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# ---- Step 3: Build & push images ----
echo ""
echo "[4/5] Building and pushing Docker images..."

cd "$PROJECT_ROOT"

echo "  -> Building frontend..."
docker build -f Dockerfile.frontend -t "${ECR_FRONTEND}:${IMAGE_TAG}" .
echo "  -> Pushing frontend..."
docker push "${ECR_FRONTEND}:${IMAGE_TAG}"

echo "  -> Building backend..."
docker build -f Dockerfile.backend -t "${ECR_BACKEND}:${IMAGE_TAG}" .
echo "  -> Pushing backend..."
docker push "${ECR_BACKEND}:${IMAGE_TAG}"

# ---- Step 4: Full Terraform apply ----
echo ""
echo "[5/5] Deploying full infrastructure with Terraform..."
cd "$TF_DIR"
terraform apply -auto-approve

# ---- Step 5: Get public IPs ----
echo ""
echo "========================================"
echo "  Deployment complete!"
echo "========================================"
echo ""

CLUSTER="${PROJECT_NAME}-cluster"
SERVICE="${PROJECT_NAME}-app"

echo "Waiting 30s for tasks to start..."
sleep 30

# Get public IP (both containers share the same task/ENI)
TASK_ARN=$(aws ecs list-tasks --cluster "$CLUSTER" --service-name "$SERVICE" --query "taskArns[0]" --output text 2>/dev/null || echo "")
if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
  ENI=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" \
    --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text 2>/dev/null || echo "")
  if [ -n "$ENI" ]; then
    PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids "$ENI" \
      --query "NetworkInterfaces[0].Association.PublicIp" --output text 2>/dev/null || echo "pending")
  fi
fi

echo "  Frontend: http://${PUBLIC_IP:-pending}"
echo "  Backend:  http://${PUBLIC_IP:-pending}:8000"
echo ""
echo "If IP shows 'pending', wait a minute and run:"
echo "  cd terraform && terraform output info"
