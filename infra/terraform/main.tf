
resource "aws_service_discovery_private_dns_namespace" "sentinelops" {
  name        = var.namespace_name
  description = "Private service discovery for SentinelOps ECS services"

  # Reuse the VPC already hosting your ECS services.
  vpc = "vpc-01e5879ac7a7e14c9"

  tags = {
    Project     = "SentinelOps"
    Environment = "development"
    ManagedBy   = "Terraform"
  }
}

resource "aws_service_discovery_service" "ml_service" {
  name = var.ml_service_name

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.sentinelops.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = {
    Project   = "SentinelOps"
    ManagedBy = "Terraform"
  }
}
