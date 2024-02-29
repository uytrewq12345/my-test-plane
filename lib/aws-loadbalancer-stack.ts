import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';

export class AwsLoadBalancerControllerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, cluster: eks.Cluster, props?: cdk.StackProps) {
    super(scope, id, props);

    cluster.addHelmChart('AWSLoadBalancerController', {
      chart: 'aws-load-balancer-controller',
      repository: 'https://aws.github.io/eks-charts',
      namespace: 'kube-system',
      release: 'aws-load-balancer-controller',
      values: {
        clusterName: cluster.clusterName,
        region: this.region,
        vpcId: cluster.vpc.vpcId,
        serviceAccount: {
          create: true,
          name: 'aws-load-balancer-controller',
        },
      },
    });
  }

  

}
