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

  let engine = 'Unknown';
  if (database.engine?.engineFamily === 'MYSQL') {
    engine = 'mysql' 
  } else if (database.engine?.engineFamily === 'POSTGRESQL') {
    engine = 'postgres' 
  } else {
    console.log(database.engine)
    throw new Error('Unsupported database engine at getDBConnectionURL');
  }
  return `${engine}://${username}:${password}@${hostname}/${dbname}`;
}
