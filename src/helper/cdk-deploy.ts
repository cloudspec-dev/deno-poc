import { TestAppConfig } from '../cloudspec.ts'
import {
  readableStreamFromReader,
} from "https://deno.land/std@0.165.0/streams/conversion.ts";
import { mergeReadableStreams } from "https://deno.land/std@0.165.0/streams/merge.ts";

export const cdkDeploy = async (cdkApp: TestAppConfig, force: boolean, verbose: boolean) => {
  const args = [
    'cdk',
    'deploy',
    '--app',
    cdkApp.outDir,
    '--json',
    '--require-approval',
    'never',
    '--method',
    'direct',
    '--outputs-file',
    './outputs.json',
  ]
  if (force) {
    args.push('--force')
  } else {
    args.push('--hotswap')
  }

  if (verbose) {
    args.push('--verbose')
    args.push('--verbose')
  }

  try {
    const p = await Deno.run(
      {
        cmd: args,
        cwd: cdkApp.testDir,
        stdout: 'piped',
        stderr: 'piped',
        env: Deno.env.toObject(),
      },
    )

    // create the file to attach the process to
    const file = await Deno.open("./process_output.txt", {
      read: true,
      write: true,
      create: true,
    });

    // example of combining stdout and stderr while sending to a file
    const stdout = readableStreamFromReader(p.stdout);
    const stderr = readableStreamFromReader(p.stderr);
    const joined = mergeReadableStreams(stdout, stderr);
    // pipe the "joined" stream into console.log
    // and the fileWriter
    await joined.pipeTo(new WritableStream({
      write(chunk) {
        const str = new TextDecoder().decode(chunk);
        console.log(str);
        file.write(chunk)
      }
    }))

    const outputs = await Deno.readTextFileSync(`${cdkApp.testDir}/outputs.json`)
    await p.close();
    await file.close();
    return JSON.parse(outputs)
  } catch (err) {
    console.error(err)
  }
}

export const cdkDestroy = async (cdkApp: string, workDir: string, verbose: boolean) => {
  const args = ['destroy', '--force', '--app', cdkApp, '--json']
  if (verbose) {
    args.push('--verbose')
    args.push('--verbose')
  }
  try {
      const p = await Deno.run(
      {
        cmd: args,
        cwd: workDir,
        stdout: 'piped',
        stderr: 'piped',
      },
    )

    const [status, stdout, stderr] = await Promise.all([
      p.status(),
      p.output(),
      p.stderrOutput()
    ]);
    p.close();

    if (!status.success) {
      throw new Error(`Failed to deploy: ${new TextDecoder().decode(stderr)}`)
    }

  } catch (err) {
    console.error(err)
  }
}
