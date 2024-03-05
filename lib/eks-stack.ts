import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';
import { KubectlV29Layer } from '@aws-cdk/lambda-layer-kubectl-v29';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';


export class EksClusterStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;

  constructor(scope: Construct, id: string, vpc: ec2.Vpc, props?: cdk.StackProps) {
    super(scope, id, props);

    this.cluster = new eks.Cluster(this, 'HelloEKS', {
      vpc,
      version: eks.KubernetesVersion.V1_29,
      kubectlLayer: new KubectlV29Layer(this, 'kubectl'),
      clusterName: "cluster-dev",
      defaultCapacity: 0,
    });

    // IAMユーザが eks クラスタにアクセスできるようにする
    const existingUserArn = 'arn:aws:iam::059829778377:user/wsl-user';
    this.cluster.awsAuth.addUserMapping(iam.User.fromUserArn(this, 'ExistingUser', existingUserArn), {
        groups: ['system:masters'],
    });

    const nodeRole = new iam.Role(this, 'MyNodeRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    nodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'));
    nodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'));
    nodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'));
    nodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'));


    this.cluster.addNodegroupCapacity('NodeGroup', {
      desiredSize: 1,
      minSize: 1,
      maxSize: 3,
      diskSize: 50,
      instanceTypes: [new ec2.InstanceType('m5.xlarge')],
      nodeRole: nodeRole,
    });

    
    this.cluster.addHelmChart('AWSLoadBalancerController', {
      chart: 'aws-load-balancer-controller',
      repository: 'https://aws.github.io/eks-charts',
      namespace: 'kube-system',
      release: 'aws-load-balancer-controller',
      values: {
        clusterName: this.cluster.clusterName,
        region: this.region,
        vpcId: this.cluster.vpc.vpcId,
        serviceAccount: {
          create: true,
          name: 'aws-load-balancer-controller',
        },
      },
    });

    this.cluster.addHelmChart('NginxIngress', {
      chart: 'nginx-ingress',
      release: 'nginx-ingress',
      repository: 'https://helm.nginx.com/stable',
      namespace: 'kube-system',
      values: {
        controller:{
          service: {
            annotations: {
              "service.beta.kubernetes.io/aws-load-balancer-scheme": "internal",
              "service.beta.kubernetes.io/aws-load-balancer-type": "nlb"
            }
          }
        }
      }
    });     



  }    
}
