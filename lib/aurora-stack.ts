import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { planeDBSecretStoreYaml, planeDBExternalSecretYaml, planeDBServiceAccount, planeNameSpace } from '../config/config';
import { convertYamlToJson } from './util';

export class AuroraStack extends cdk.Stack {
  public readonly auroraDB: rds.DatabaseCluster;

  constructor(scope: Construct, id: string, cluster: eks.Cluster, props?: cdk.StackProps) {
    super(scope, id, props);

    // Aurora用の新しいセキュリティグループを作成
    // EKSノードからのアクセスを許可するルールを追加
    const auroraSg = new ec2.SecurityGroup(this, 'AuroraSecurityGroup', { vpc: cluster.vpc });
    auroraSg.addIngressRule(cluster.clusterSecurityGroup, ec2.Port.tcp(5432), 'Allow access from EKS Nodes');

    // Aurora Serverless Cluster
    this.auroraDB = new rds.DatabaseCluster(this, 'Database', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_5,
      }),
      vpc: cluster.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 2.0,
      defaultDatabaseName: 'planeDB',
      securityGroups:[ auroraSg ],
      writer: rds.ClusterInstance.serverlessV2('AuroraWriter', {}),
      readers: [
        rds.ClusterInstance.serverlessV2('AuroraReader', {
            scaleWithWriter: true,
        })
      ]
    });

  }
}
