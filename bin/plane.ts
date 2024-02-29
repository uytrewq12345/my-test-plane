#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack';
import { EksClusterStack } from '../lib/eks-stack';
import { AwsLoadBalancerControllerStack } from '../lib/aws-loadbalancer-stack';
import { NginxIngressStack } from '../lib/nginx-ingress-stack';
import { LonghornStack } from '../lib/longhorn-stack';

import { PlaneStack } from '../lib/plane-stack';

const app = new cdk.App();

// VPCスタック
const vpcStack = new VpcStack(app, 'VpcStack');

// EKSクラスタスタック
const eksClusterStack = new EksClusterStack(app, 'EksClusterStack', vpcStack.vpc);

// AWS Load Balancer Controller スタック
const awsLoadBalancerControllerStack = new AwsLoadBalancerControllerStack(app, 'AwsLoadBalancerControllerStack', eksClusterStack.cluster);

// nginx-ingress スタック
const nginxIngressStack = new NginxIngressStack(app, 'NginxIngressStack', eksClusterStack.cluster);
nginxIngressStack.addDependency(awsLoadBalancerControllerStack);

// Longhorn スタック
const longhornStack = new LonghornStack(app, 'LonghornStack', eksClusterStack.cluster); 

// Plane スタック
const planeStack = new PlaneStack(app, 'PlaneStack', eksClusterStack.cluster);

