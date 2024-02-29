import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export class NodeGroupStack extends cdk.Stack {
  constructor(scope: Construct, id: string, cluster: eks.Cluster, props?: cdk.StackProps) {
    super(scope, id, props);

    const nodeRole = new iam.Role(this, 'MyNodeRole', {
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });
  
    nodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKSWorkerNodePolicy'));
    nodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEKS_CNI_Policy'));
    nodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'));
    nodeRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'));
  

    cluster.addNodegroupCapacity('NodeGroup', {
      desiredSize: 1,
      minSize: 1,
      maxSize: 3,
      diskSize: 50,
      instanceTypes: [new ec2.InstanceType('m5.xlarge')],
      nodeRole: nodeRole,
    });
  }

}
