import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export class LonghornStack extends cdk.Stack {
  constructor(scope: Construct, id: string, cluster: eks.Cluster, props?: cdk.StackProps) {
    super(scope, id, props);

    // longhorn に必要なマニフェストをデプロイ
    const manifestDirectory = './manifest/longhorn/';
    fs.readdirSync(manifestDirectory).forEach(file => {
      const manifestPath = path.join(manifestDirectory, file);
      const manifestString = fs.readFileSync(manifestPath, 'utf8'); 
      const manifestContent = yaml.loadAll(manifestString); 

      manifestContent.forEach((manifest, index) => {
        cluster.addManifest(`longhorn-${path.basename(file, '.yaml')}-${index}`, manifest as Record<string, any>);
      });
    });

    // longhorn をデプロイ
    cluster.addHelmChart('MyLonghornChart', {
        chart: 'longhorn',
        repository: 'https://charts.longhorn.io',
        release: 'longhorn', 
        namespace: 'longhorn-system',
        createNamespace: true,
        version: '1.6.0',
    });    

  }
}
