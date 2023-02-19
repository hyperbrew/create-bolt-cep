#!/usr/bin/env node

import * as color from "picocolors";
import * as path from "path";

import { prompts } from "./lib/prompts";
import { frameworkOptions, installBolt, Options } from "./lib/bolt";
import { parseArgs } from "./lib/parse-args";
import { installDeps, initGit } from "./lib/utils";

main();

async function main() {
  const args = parseArgs();
  let options: Options = {
    framework: "",
    dir: "",
    template: "",
    apps: [],
    git: false,
    installDeps: false,
  };

  if (typeof args === "string") {
    try {
      const results = await prompts({ appName: args });
      if (results) options = results;
    } catch (error) {
      console.error(error);
    }
  } else {
    installBolt(args);

    if (args.git) {
      console.log("Initializing git repo");
      await initGit(options);
      console.log("Initialized git repo.");
    }

    if (args.installDeps) {
      console.log("Installing dependencies via yarn");
      await installDeps(options);
      console.log("Installed dependencies via yarn.");
    }

    options = args;
  }

  const framework = frameworkOptions.find((x) => x.value === options.framework); // prettier-ignore
  const yay = color.cyan(`New Bolt CEP generated with ${framework?.label}`);
  const appName = path.basename(options.dir);
  const name = color.green(color.bold(appName));

  console.log(yay, name);
  console.log();
  console.log(color.cyan(`Path :: ${options.dir}`));
  console.log();
}
