#!/usr/bin/env node

import * as color from "picocolors";
import { prompts } from "./lib/prompts";
import { installBolt } from "./lib/bolt";
import { frameworkOptions } from "./lib/options";
import { parseArgs, throwError } from "./lib/parse-args";
import { installDeps, initGit } from "./lib/utils";

main();

async function main() {
  let options = await parseArgs();

  if (typeof options === "string") {
    try {
      options = await prompts({ destination: options });
    } catch (error) {
      console.error(error);
    }
  } else {
    if (options.dir.exists && !options.dir.isEmpty)
      throwError("<appname>", `path is not empty.`, options.dir.path);

    installBolt(options);

    if (options.installDeps) {
      console.log("Installing dependencies via yarn...");
      await installDeps(options);
      console.log("Installed dependencies via yarn.");
    }

    if (options.git) {
      console.log("Initializing git repo...");
      await initGit(options);
      console.log("Initialized git repo.");
    }
  }

  // just for type checking, we should never return here, given that the return of prompts() sets options to an Options object
  if (typeof options === "string") return;

  const { framework } = options;
  const { label } = frameworkOptions.find((x) => x.value === framework)!;

  const yay = color.cyan(`New Bolt CEP generated with ${label}`);
  const name = color.green(color.bold(options.dir.name));

  console.log(yay, name);
  console.log();
  console.log(color.cyan(`Path :: ${options.dir.path}`));
  console.log();
}
