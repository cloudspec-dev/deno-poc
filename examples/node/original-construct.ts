// A stack that would be part of a default aws-cdk app based on classic Node / Typescript and doesn't know anything about Deno

import { Construct } from 'constructs'
import { Bucket } from 'aws-cdk-lib/aws-s3'

export class MyNodeConstruct extends Construct {
  public readonly resource: Bucket

  constructor(scope: Construct, id: string, props?: Record<string, string>) {
    super(scope, id, props);

    this.resource = new Bucket(scope, 'MyBucket')
  }
}