output "ecr_frontend_url" {
  description = "ECR repository URL for frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "app_service_name" {
  description = "ECS service name (frontend + backend in one task)"
  value       = aws_ecs_service.app.name
}

output "info" {
  description = "How to get the public IP of the running task"
  value       = <<-EOT
    ---------------------------------------------------------------
    Both frontend and backend run in a SINGLE Fargate task.
    They share the same public IP (communicate via localhost).

    To get the public IP run:
      aws ecs list-tasks --cluster ${aws_ecs_cluster.main.name} --service-name ${aws_ecs_service.app.name} --query "taskArns[0]" --output text | xargs -I {} aws ecs describe-tasks --cluster ${aws_ecs_cluster.main.name} --tasks {} --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text | xargs -I {} aws ec2 describe-network-interfaces --network-interface-ids {} --query "NetworkInterfaces[0].Association.PublicIp" --output text

    Frontend: http://<PUBLIC_IP>  (port 80)
    Backend:  http://<PUBLIC_IP>:8000
    ---------------------------------------------------------------
  EOT
}
