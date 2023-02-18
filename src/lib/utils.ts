import * as path from "path";
import { ChildProcess, spawn } from "child_process";
import { promisify } from "util";
import { Options } from "./bolt";

export async function installDeps(options: Options) {
  runCommandsInDirectory(options.dir, ["yarn"]);
}

export async function initGit(options: Options) {
  runCommandsInDirectory(options.dir, ["git init"]);
}

async function runCommandsInDirectory(
  directoryPath: string,
  commands: string[]
): Promise<void> {
  const originalDirectory = process.cwd();

  process.chdir(directoryPath);

  const promisifiedSpawn = promisify(spawn) as (
    command: string,
    args?: string[],
    options?: any
  ) => Promise<ChildProcess>;
  try {
    for (const command of commands) {
      const child: ChildProcess = await promisifiedSpawn(command, [], {
        shell: true,
        cwd: path.resolve(directoryPath),
      });

      child?.stdout?.on("data", (data: Buffer) => {
        console.log(`stdout: ${data}`);
      });

      child?.stderr?.on("data", (data: Buffer) => {
        console.error(`stderr: ${data}`);
      });

      child.on("error", (error: Error) => {
        console.error(`error: ${error.message}`);
      });

      await new Promise<void>((resolve) => {
        child.on("close", (code: number) => {
          console.log(`child process exited with code ${code}`);
          resolve();
        });
      });
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  } finally {
    process.chdir(originalDirectory);
  }
}
