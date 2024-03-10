import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

const userPoolName = 'plane-user-pool'
const userPoolClientName= 'plane'
const callbackUrl = 'http://localhost:8888/'
const domainPrefix = 'plane-domain-prefix'

export class CognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, 'CognitoUserPool', {
      userPoolName: userPoolName,
      selfSignUpEnabled: true,        // 自己サインアップを有効化
      signInAliases: { email: true }, // メールでのサインインを許可
      autoVerify: { email: true },    // メール確認を自動で行う
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'CognitoUserPoolClient', {
      userPool: userPool,
      userPoolClientName: userPoolClientName,
      generateSecret: true,
      authFlows: { userPassword: true },  // ユーザー名とパスワードでの認証を許可
      oAuth: {
        callbackUrls: [callbackUrl],
        scopes: [cognito.OAuthScope.EMAIL, // 何を指定すれば良いかよくわからない。 
                 cognito.OAuthScope.OPENID,
                 cognito.OAuthScope.PROFILE,],
      }
      
    });

    const userPoolDomain = userPool.addDomain('UserPoolDomain', {
      cognitoDomain: {
        domainPrefix: domainPrefix, 
      },
    });


  }
}