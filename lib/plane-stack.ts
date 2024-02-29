import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';

export class PlaneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, cluster: eks.Cluster, props?: cdk.StackProps) {
    super(scope, id, props);

    cluster.addHelmChart('MyPlaneChart', {
      chart: 'plane-ce',
      release: 'my-plane',
      repository: 'https://helm.plane.so',
      namespace: 'plane-ns',
      createNamespace: true,
      values: {
        ingress: {
          host: 'plane.example.com',
        },
      },
    });
  }
}
