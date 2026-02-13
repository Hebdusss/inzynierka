# -----------------------------------------------
# Gym-Rats Terraform variables
# -----------------------------------------------

aws_region   = "eu-central-1"
project_name = "gymrats"

frontend_image_tag = "latest"
backend_image_tag  = "latest"

frontend_cpu    = 256
frontend_memory = 512
backend_cpu     = 256
backend_memory  = 512

# CHANGE THIS to a secure random string
nextauth_secret = "CHANGE-ME-super-secret-key-123"

az_count = 2
