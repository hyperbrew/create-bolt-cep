import * as execa from "execa";
import { Options } from "./bolt";

export async function installDeps(options: Options) {
  await runCommandInDirectory(options.dir, [{ command: "yarn" }]);
}

export async function initGit(options: Options) {
  await runCommandInDirectory(options.dir, [
    { command: "git", args: ["init"] },
    // { command: "git", args: ["rm", "-r", "--cached", "."] },
    { command: "git", args: ["add", "."] },
    { command: "git", args: ["commit", "-m", "init commit"] },
  ]);
}

async function runCommandInDirectory(
  directoryPath: string,
  commands: { command: string; args?: string[] }[]
): Promise<void> {
  const originalDirectory = process.cwd();
  process.chdir(directoryPath);

  for (const command of commands) {
    await execa(command.command, command.args);
  }

  process.chdir(originalDirectory);
}
