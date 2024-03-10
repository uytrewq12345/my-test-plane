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

    // auroraDB の secret を参照できるサービスアカウントを作成する
    const serviceAccount = new eks.ServiceAccount(this, 'planeAuroraServiceAccount', {
      cluster: cluster,
      name: planeDBServiceAccount,
      namespace: planeNameSpace,
    })
    this.auroraDB.secret?.grantRead(serviceAccount)

    // SecretStore をデプロイ
    const secretStoreManifest = convertYamlToJson(planeDBSecretStoreYaml)
    secretStoreManifest.metadata.namespace = planeNameSpace
    secretStoreManifest.spec.provider.aws.region = this.region
    secretStoreManifest.spec.provider.aws.auth.jwt.serviceAccountRef.name = planeDBServiceAccount
    new eks.KubernetesManifest(this, 'secretStore', {
      cluster: cluster,
      manifest: [secretStoreManifest]
    })

    // ExternalSecret をデプロイ

    // secret manager から取得する secret の key
    const secretKeys = [
      'username',
      'hostname',
      'dbname',
      'port',
    ]

    let secretObjects = [];
    for (const key of secretKeys) {
      // 指定された形式のオブジェクトを作成
      const secretObject = {
        secretKey: `plane-db-${key}`, 
        remoteRef: {
          key: this.auroraDB.secret?.secretName, // AWS Secrets Manager secret name
          property: key, // AWS Secrets Manager secret key
        },
      };    
      // 作成したオブジェクトを配列に追加
      secretObjects.push(secretObject);
    }
    const externalSecretManifest = convertYamlToJson(planeDBExternalSecretYaml)
    externalSecretManifest.spec.data = secretObjects
    externalSecretManifest.metadata.namespace = planeNameSpace
    new eks.KubernetesManifest(this, 'externalSecret', {
      cluster: cluster,
      manifest: [externalSecretManifest]
    })

  }
}
