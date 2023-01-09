// A stack that would be part of a default aws-cdk app based on classic Node / Typescript and doesn't know anything about Deno
// The import_map.json file maps this into Deno land and could be auto generated based on package.json

import { Construct } from 'constructs'
import { Bucket } from 'aws-cdk-lib/aws-s3'

export class MyNodeConstruct extends Construct {
  public readonly resource: Bucket

  constructor(scope: Construct, id: string, props?: Record<string, string>) {
    super(scope, id, props);

    this.resource = new Bucket(scope, 'MyBucket')
  }
}