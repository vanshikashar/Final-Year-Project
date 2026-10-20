
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();

const region = (config.get("awsRegion") ?? "ap-south-1") as aws.Region;
const namespaceName =
    config.get("namespaceName") ?? "sentinelops.local";
const mlServiceName =
    config.get("mlServiceName") ?? "ml-service";

const provider = new aws.Provider("sentinelops-provider", {
    region,
});

const namespace = new aws.servicediscovery.PrivateDnsNamespace(
    "sentinelops-namespace",
    {
        name: namespaceName,
        description: "Private service discovery for SentinelOps",
        vpc: "vpc-01e5879ac7a7e14c9",
        tags: {
            Project: "SentinelOps",
            Environment: "development",
            ManagedBy: "Pulumi",
        },
    },
    { provider },
);

const mlService = new aws.servicediscovery.Service(
    "sentinelops-ml-service",
    {
        name: mlServiceName,
        dnsConfig: {
            namespaceId: namespace.id,
            dnsRecords: [
                {
                    ttl: 10,
                    type: "A",
                },
            ],
            routingPolicy: "MULTIVALUE",
        },
        healthCheckCustomConfig: {
            failureThreshold: 1,
        },
        tags: {
            Project: "SentinelOps",
            ManagedBy: "Pulumi",
        },
    },
    { provider },
);

export const privateNamespaceId = namespace.id;
export const mlServiceDiscoveryArn = mlService.arn;
export const mlServiceDnsName = pulumi.interpolate`${mlServiceName}.${namespaceName}`;
