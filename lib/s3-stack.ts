import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3'

export class S3Stack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket
    this.bucket = new s3.Bucket(this, 'MyBucket', {
      bucketName: `plane-bucket-${this.account}-${this.region}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change as needed
    });

    // アクセスポイントを設定
    const accessPoint = new s3.CfnAccessPoint(this, 'MyAccessPoint', {
      bucket: this.bucket.bucketName,
    });
  

  }
}
