import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';

export class NginxIngressStack extends cdk.Stack {
  constructor(scope: Construct, id: string, cluster: eks.Cluster, props?: cdk.StackProps) {
    super(scope, id, props);

    cluster.addHelmChart('NginxIngress', {
      chart: 'nginx-ingress',
      release: 'nginx-ingress',
      repository: 'https://helm.nginx.com/stable',
      namespace: 'kube-system',
    });
  }
}
