
variable "aws_region" {
  description = "AWS region for SentinelOps"
  type        = string
  default     = "ap-south-1"
}

variable "namespace_name" {
  description = "Private DNS namespace for SentinelOps"
  type        = string
  default     = "sentinelops.local"
}

variable "ml_service_name" {
  description = "Cloud Map service name for the ML API"
  type        = string
  default     = "ml-service"
}
