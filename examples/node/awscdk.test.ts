import { CloudSpec } from '../../src/cloudspec.ts'
import { assertMatch, it, describe } from '../../src/testing.ts'
import { MyNodeConstruct } from './original-construct.ts'

const cloudspec = new CloudSpec('node-construct', import.meta.url);

const testApp = await cloudspec.testApp((stack) => {
  const component = new MyNodeConstruct(stack, 'MyConstruct')
  stack.outputs({
    BucketName: component.resource.bucketName,
  })
})

describe('original node stack', () => {
  it('should have a bucket', async () => {
    const outputs = await cloudspec.deploy(testApp)
    assertMatch(outputs.BucketName,  /MyBucket/i)
  })
})