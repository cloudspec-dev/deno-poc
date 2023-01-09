import { CloudSpec } from '../../src/cloudspec.ts'
import { assertMatch, it, describe } from '../../src/testing.ts'
import { Bucket } from 'npm:aws-cdk-lib@2/aws-s3'

const cloudspec = new CloudSpec('deno-inline', import.meta.url);

const testApp = await cloudspec.testApp((stack) => {
  const component = new Bucket(stack, 'MyBucket')
  stack.outputs({
    BucketName: component.bucketName,
  })
})

describe('Repository', () => {
  it('should have a bucket', async () => {
    const outputs = await cloudspec.deploy(testApp)
    assertMatch(outputs.BucketName,  /MyBucket/i)
  })
})