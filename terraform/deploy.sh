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

AWS_REGION=$(grep 'aws_region' "$TF_DIR/terraform.tfvars" | head -1 | sed 's/.*= *"\(.*\)"/\1/')
PROJECT_NAME=$(grep 'project_name' "$TF_DIR/terraform.tfvars" | head -1 | sed 's/.*= *"\(.*\)"/\1/')
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

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
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

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

echo "Waiting 30s for tasks to start..."
sleep 30

# Frontend IP
FRONTEND_TASK=$(aws ecs list-tasks --cluster "$CLUSTER" --service-name "${PROJECT_NAME}-frontend" --query "taskArns[0]" --output text 2>/dev/null || echo "")
if [ -n "$FRONTEND_TASK" ] && [ "$FRONTEND_TASK" != "None" ]; then
  FRONTEND_ENI=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$FRONTEND_TASK" \
    --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text 2>/dev/null || echo "")
  if [ -n "$FRONTEND_ENI" ]; then
    FRONTEND_IP=$(aws ec2 describe-network-interfaces --network-interface-ids "$FRONTEND_ENI" \
      --query "NetworkInterfaces[0].Association.PublicIp" --output text 2>/dev/null || echo "pending")
  fi
fi

# Backend IP
BACKEND_TASK=$(aws ecs list-tasks --cluster "$CLUSTER" --service-name "${PROJECT_NAME}-backend" --query "taskArns[0]" --output text 2>/dev/null || echo "")
if [ -n "$BACKEND_TASK" ] && [ "$BACKEND_TASK" != "None" ]; then
  BACKEND_ENI=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$BACKEND_TASK" \
    --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text 2>/dev/null || echo "")
  if [ -n "$BACKEND_ENI" ]; then
    BACKEND_IP=$(aws ec2 describe-network-interfaces --network-interface-ids "$BACKEND_ENI" \
      --query "NetworkInterfaces[0].Association.PublicIp" --output text 2>/dev/null || echo "pending")
  fi
fi

echo "  Frontend: http://${FRONTEND_IP:-pending}:3000"
echo "  Backend:  http://${BACKEND_IP:-pending}:8000"
echo ""
echo "If IPs show 'pending', wait a minute and run:"
echo "  cd terraform && terraform output info"
