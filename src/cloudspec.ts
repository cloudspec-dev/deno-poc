import * as cdk from 'npm:aws-cdk-lib@2'
import { Construct } from 'npm:constructs@10'
import { cdkDeploy, cdkDestroy } from './helper/cdk-deploy.ts'
import { Aspects, IAspect } from 'npm:aws-cdk-lib@2'
import { ForceEphemeralResources } from './helper/ephemeral.ts'
import * as path from "https://deno.land/std/path/mod.ts";
import { createHash } from "https://deno.land/std/node/crypto.ts";

export type StackOutputs = Record<string, any>

export class TestStack extends cdk.Stack {
  public stackOutputs: StackOutputs = {}

  public static generateName(id: string): string {
    const digest = createHash('sha256').update(id).digest('hex').toString().substr(0, 8)
    const name = `${id}-${Deno.env.get('GITHUB_REF_NAME') || Deno.env.get('USER')}-${digest}`
    return name.replace(/[^a-zA-Z0-9]/g, '-')
  }

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, TestStack.generateName(id), props)
  }

  public outputs(o: StackOutputs): void {
    for (const [key, value] of Object.entries(o)) {
      new cdk.CfnOutput(this, key, { value })
    }

    this.stackOutputs = o;
  }

  public ephemeral(): void {
    Aspects.of(this).add(this.ephemeralAspect())
  }

  public ephemeralAspect(): IAspect {
    return new ForceEphemeralResources()
  }
}


export interface TestAppConfig {
  readonly stackName: string
  readonly outDir: string
  readonly testDir: string
  readonly stack: TestStack,
  readonly outputs: StackOutputs,
  readonly workDir: string
}

export interface ITestStackCreator {
  produce(app: TestStack): void
}

export class CloudSpec {
  constructor(public readonly projectName: string, readonly cwd: string) {
    this.cwd = path.dirname(path.fromFileUrl(cwd));
  }

  public async deploy(app: TestAppConfig): Promise<any> {
    const force = false
    const verbose = false
    const result = await cdkDeploy(app, force, verbose)
    return result[app.stackName]
  }

  public async destroy(app: TestAppConfig) {
    const verbose = false
    await cdkDestroy(app.outDir, app.workDir, verbose)
  }

  public async testApp(creator: (stack: TestStack) => void): Promise<TestAppConfig>  {
    const projectName = this.projectName
    // create tmp dir
    const workDir = await Deno.makeTempDir({prefix: 'cloudspec'})
    const outdir =  path.join(this.cwd, 'cdk.out')

    const app = new cdk.App({ outdir })
    const stack = new TestStack(app, 'cloudspec', {})

    creator(stack)

    const excludeResourceTypes = ['AWS::Lambda::Function']

    cdk.Tags.of(stack).add('Test', 'true', {
      excludeResourceTypes,
    })
    cdk.Tags.of(stack).add('TestPath', this.cwd, {
      excludeResourceTypes,
    })
    cdk.Tags.of(stack).add('CloudSpecProjectName', projectName, {
      excludeResourceTypes,
    })

    const refName = Deno.env.get('GITHUB_REF_NAME')
    if (refName) {
      cdk.Tags.of(stack).add('GitRefName', refName, {
        excludeResourceTypes,
      })
    }

    stack.ephemeral()
    app.synth()

    return {
      outDir: outdir,
      workDir,
      stackName: stack.stackName,
      testDir: this.cwd,
      outputs: stack.stackOutputs,
      stack
    }
  }
}