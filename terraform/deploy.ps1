# ============================================================================
# deploy.ps1 - Build Docker images, push to ECR, deploy with Terraform
# Usage: .\deploy.ps1
# Prerequisites: aws cli, docker, terraform
# ============================================================================
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$TfDir = $ScriptDir

$AWS_REGION = "eu-central-1"
$PROJECT_NAME = "gymrats"
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text).Trim()

$ECR_FRONTEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-frontend"
$ECR_BACKEND  = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-backend"
$IMAGE_TAG = "latest"

Write-Host "========================================"
Write-Host "  Gym-Rats AWS Fargate Deployment"
Write-Host "========================================"
Write-Host "  Region:   $AWS_REGION"
Write-Host "  Account:  $AWS_ACCOUNT_ID"
Write-Host "  Project:  $PROJECT_NAME"
Write-Host "========================================"

# ---- Step 1: Terraform init & create ECR repos ----
Write-Host ""
Write-Host "[1/5] Initializing Terraform..."
Push-Location $TfDir
terraform init -input=false

Write-Host ""
Write-Host "[2/5] Creating ECR repositories..."
terraform apply -target=aws_ecr_repository.frontend -target=aws_ecr_repository.backend -auto-approve

# ---- Step 2: Docker login to ECR ----
Write-Host ""
Write-Host "[3/5] Logging in to ECR..."
$loginPassword = aws ecr get-login-password --region $AWS_REGION
$loginPassword | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# ---- Step 3: Build & push images ----
Write-Host ""
Write-Host "[4/5] Building and pushing Docker images..."

Push-Location $ProjectRoot

Write-Host "  -> Building frontend..."
docker build -f Dockerfile.frontend -t "${ECR_FRONTEND}:${IMAGE_TAG}" .
Write-Host "  -> Pushing frontend..."
docker push "${ECR_FRONTEND}:${IMAGE_TAG}"

Write-Host "  -> Building backend..."
docker build -f Dockerfile.backend -t "${ECR_BACKEND}:${IMAGE_TAG}" .
Write-Host "  -> Pushing backend..."
docker push "${ECR_BACKEND}:${IMAGE_TAG}"

Pop-Location

# ---- Step 4: Full Terraform apply ----
Write-Host ""
Write-Host "[5/5] Deploying full infrastructure with Terraform..."
terraform apply -auto-approve

# ---- Step 5: Get public IPs ----
Write-Host ""
Write-Host "========================================"
Write-Host "  Deployment complete!"
Write-Host "========================================"
Write-Host ""

$Cluster = "${PROJECT_NAME}-cluster"

Write-Host "Waiting 30s for tasks to start..."
Start-Sleep -Seconds 30

# Frontend IP
try {
    $frontendTask = (aws ecs list-tasks --cluster $Cluster --service-name "${PROJECT_NAME}-frontend" --query "taskArns[0]" --output text).Trim()
    if ($frontendTask -and $frontendTask -ne "None") {
        $frontendENI = (aws ecs describe-tasks --cluster $Cluster --tasks $frontendTask --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text).Trim()
        if ($frontendENI) {
            $frontendIP = (aws ec2 describe-network-interfaces --network-interface-ids $frontendENI --query "NetworkInterfaces[0].Association.PublicIp" --output text).Trim()
        }
    }
} catch { $frontendIP = "pending" }

# Backend IP
try {
    $backendTask = (aws ecs list-tasks --cluster $Cluster --service-name "${PROJECT_NAME}-backend" --query "taskArns[0]" --output text).Trim()
    if ($backendTask -and $backendTask -ne "None") {
        $backendENI = (aws ecs describe-tasks --cluster $Cluster --tasks $backendTask --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text).Trim()
        if ($backendENI) {
            $backendIP = (aws ec2 describe-network-interfaces --network-interface-ids $backendENI --query "NetworkInterfaces[0].Association.PublicIp" --output text).Trim()
        }
    }
} catch { $backendIP = "pending" }

if (-not $frontendIP) { $frontendIP = "pending" }
if (-not $backendIP) { $backendIP = "pending" }

Write-Host "  Frontend: http://${frontendIP}:3000"
Write-Host "  Backend:  http://${backendIP}:8000"
Write-Host ""
Write-Host "If IPs show 'pending', wait a minute and run:"
Write-Host "  cd terraform; terraform output info"

Pop-Location
