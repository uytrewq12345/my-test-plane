import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';

export class ExternalSecretStack extends cdk.Stack {
  constructor(scope: Construct, id: string, eksCluster: eks.Cluster, props?: cdk.StackProps) {
    super(scope, id, props);

    eksCluster.addHelmChart('ExternalSecret', {
      chart: 'external-secrets',
      repository: 'https://charts.external-secrets.io',
      release: 'external-secrets',
      namespace: 'external-secrets',
      createNamespace: true,
      values: {
        installCRDs: true,
      },
    });
    
  }
}
