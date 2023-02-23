import * as execa from "execa";
import { Options } from "./options";

export async function installDeps({ dir }: Options) {
  await runCommandInDirectory(dir.path, [{ command: "yarn" }]);
}

export async function buildBolt({ dir, template }: Options) {
  if (template === "skeleton") return; // TODO: just for now! need to make sure skeleton's are not missing any references after removing files etc
  await runCommandInDirectory(dir.path, [{ command: "yarn", args: ["build"] }]);
}

export async function initGit({ dir }: Options) {
  return;
  // TODO: this isn't working
  await runCommandInDirectory(dir.path, [
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
