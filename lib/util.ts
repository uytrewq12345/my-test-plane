import * as fs from 'fs';
import * as yaml from 'js-yaml';

export function convertYamlToJson(yamlFilePath: string): any {
  const yamlFile = fs.readFileSync(yamlFilePath, 'utf8');
  const jsonObject = yaml.load(yamlFile);
  return jsonObject;
}


import { DatabaseCluster, } from 'aws-cdk-lib/aws-rds';

export function getDBConnectionURL(database: DatabaseCluster): string {
  const username = database.secret?.secretValueFromJson('username').unsafeUnwrap();
  const password = database.secret?.secretValueFromJson('password').unsafeUnwrap();
  const hostname = database.secret?.secretValueFromJson('hostname').unsafeUnwrap();
  const dbname = database.secret?.secretValueFromJson('dbname').unsafeUnwrap();
  const port = database.secret?.secretValueFromJson('port').unsafeUnwrap();
  const engine = database.secret?.secretValueFromJson('engine').unsafeUnwrap();
  
  return `postgres://${username}:${password}@${hostname}:${port}/${dbname}`;
}
