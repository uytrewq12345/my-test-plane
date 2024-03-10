import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as rds from 'aws-cdk-lib/aws-rds';
import { convertYamlToJson, getDBConnectionURL } from './util';
import { planeNameSpace } from '../config/config';
import { CfnJson } from 'aws-cdk-lib';

const planeValueYaml = 'manifest/plane-values.yaml'

export class PlaneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, cluster: eks.Cluster, auroraDB: rds.DatabaseCluster, bucket: s3.Bucket,  props?: cdk.StackProps) {
    super(scope, id, props);

    // values.yaml に DB への接続情報を追加
    const values = convertYamlToJson(planeValueYaml)
    values.postgres.local_setup = false
    values.env.pgdb_remote_url = getDBConnectionURL(auroraDB)
    values.env.pgdb_remote_url = 'postgres://postgres:WbUdx3^,,d85cIR^-kV7aHCKMyDnM=@aurorastack-databaseb269d8bb-7c0wbkmqoidd.cluster-c3bvsexjatwr.ap-northeast-1.rds.amazonaws.com:5432/planeDB';
    values.minio.local_setup	= false
    console.log(values)
    
    new eks.HelmChart(this, 'MyPlaneChart', {
      cluster: cluster,
      chart: 'plane-ce',
      release: 'my-plane',
      repository: 'https://helm.plane.so',
      namespace: planeNameSpace,
      createNamespace: true,
      values: values,
    });


  }
}
