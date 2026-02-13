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

output "frontend_service_name" {
  description = "Frontend ECS service name"
  value       = aws_ecs_service.frontend.name
}

output "backend_service_name" {
  description = "Backend ECS service name"
  value       = aws_ecs_service.backend.name
}

output "info" {
  description = "How to get the public IPs of running tasks"
  value       = <<-EOT
    ---------------------------------------------------------------
    Tasks are running on AWS Fargate with public IPs.

    To get the FRONTEND public IP run:
      aws ecs list-tasks --cluster ${aws_ecs_cluster.main.name} --service-name ${aws_ecs_service.frontend.name} --query "taskArns[0]" --output text | xargs -I {} aws ecs describe-tasks --cluster ${aws_ecs_cluster.main.name} --tasks {} --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text | xargs -I {} aws ec2 describe-network-interfaces --network-interface-ids {} --query "NetworkInterfaces[0].Association.PublicIp" --output text

    To get the BACKEND public IP run:
      aws ecs list-tasks --cluster ${aws_ecs_cluster.main.name} --service-name ${aws_ecs_service.backend.name} --query "taskArns[0]" --output text | xargs -I {} aws ecs describe-tasks --cluster ${aws_ecs_cluster.main.name} --tasks {} --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text | xargs -I {} aws ec2 describe-network-interfaces --network-interface-ids {} --query "NetworkInterfaces[0].Association.PublicIp" --output text

    Frontend: http://<FRONTEND_IP>:3000
    Backend:  http://<BACKEND_IP>:8000
    ---------------------------------------------------------------
  EOT
}
