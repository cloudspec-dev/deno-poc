import { IConstruct } from 'npm:constructs@10'
import { IAspect, RemovalPolicy, Annotations } from 'npm:aws-cdk-lib@2'
import { Bucket } from 'npm:aws-cdk-lib@2/aws-s3'
import { Table } from 'npm:aws-cdk-lib@2/aws-dynamodb'
import { UserPool } from 'npm:aws-cdk-lib@2/aws-cognito'
import { Topic } from 'npm:aws-cdk-lib@2/aws-sns'

export class ForceEphemeralResources implements IAspect {
  visit(node: IConstruct) {
    if (node instanceof Bucket) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY)
      node['enableAutoDeleteObjects']()
      Annotations.of(node).addInfo('Changed removal policy to DESTROY')
    } else if (node instanceof Table) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY)
      Annotations.of(node).addInfo('Changed removal policy to DESTROY')
    } else if (node instanceof UserPool) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY)
      Annotations.of(node).addInfo('Changed removal policy to DESTROY')
    } else if (node instanceof Topic) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY)
      Annotations.of(node).addInfo('Changed removal policy to DESTROY')
    }
  }
}
