
output "private_namespace_id" {
  value = aws_service_discovery_private_dns_namespace.sentinelops.id
}

output "ml_service_discovery_arn" {
  value = aws_service_discovery_service.ml_service.arn
}

output "ml_service_dns_name" {
  value = "${var.ml_service_name}.${var.namespace_name}"
}
