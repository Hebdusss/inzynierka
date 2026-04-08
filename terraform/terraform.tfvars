# -----------------------------------------------
# Gym-Rats Terraform variables
# -----------------------------------------------

aws_region   = "eu-central-1"
project_name = "gymrats"

frontend_image_tag = "latest"
backend_image_tag  = "latest"

# Single Fargate task runs both containers
task_cpu    = 512
task_memory = 1024

# CHANGE THIS to a secure random string
nextauth_secret = "CHANGE-ME-super-secret-key-123"

az_count = 2
