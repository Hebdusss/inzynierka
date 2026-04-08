# -----------------------------------------------
# Gym-Rats Terraform variables
# -----------------------------------------------

aws_region   = "eu-central-1"
project_name = "gymrats"

frontend_image_tag = "latest"
backend_image_tag  = "latest"

<<<<<<< HEAD
# Single Fargate task runs both containers
task_cpu    = 512
task_memory = 1024
=======
frontend_cpu    = 256
frontend_memory = 512
backend_cpu     = 256
backend_memory  = 512
>>>>>>> c80a8855a3f6e2e096ac7af8546ff9f4b360ed57

# CHANGE THIS to a secure random string
nextauth_secret = "CHANGE-ME-super-secret-key-123"

az_count = 2
