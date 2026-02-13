variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Project name used as prefix for resources"
  type        = string
  default     = "gymrats"
}

variable "frontend_image_tag" {
  description = "Docker image tag for frontend"
  type        = string
  default     = "latest"
}

variable "backend_image_tag" {
  description = "Docker image tag for backend"
  type        = string
  default     = "latest"
}

variable "frontend_cpu" {
  description = "CPU units for frontend task (1 vCPU = 1024)"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory (MiB) for frontend task"
  type        = number
  default     = 512
}

variable "backend_cpu" {
  description = "CPU units for backend task"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Memory (MiB) for backend task"
  type        = number
  default     = 512
}

variable "nextauth_secret" {
  description = "NextAuth secret for JWT signing"
  type        = string
  sensitive   = true
}

variable "az_count" {
  description = "Number of availability zones"
  type        = number
  default     = 2
}
