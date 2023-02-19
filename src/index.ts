#!/usr/bin/env node

import * as color from "picocolors";
import { prompts } from "./lib/prompts";
import { frameworkOptions, installBolt, Options } from "./lib/bolt";
import { parseArgs, throwError } from "./lib/parse-args";
import { installDeps, initGit } from "./lib/utils";
import { parsePath } from "./lib/parse-path";

main();

async function main() {
  const args = parseArgs();
  let options: Options = {
    framework: "",
    dir: parsePath(""),
    template: "",
    apps: [],
    git: false,
    installDeps: false,
  };

  if (typeof args === "string") {
    try {
      const results = await prompts({ destination: args });
      if (results) options = results;
    } catch (error) {
      console.error(error);
    }
  } else {
    if (args.dir.exists)
      throwError("<appname>", `path already exists.`, args.dir.path);
    if (!args.dir.isEmpty)
      throwError("<appname>", `path is not empty.`, args.dir.path);

    installBolt(args);

    if (args.installDeps) {
      console.log("Installing dependencies via yarn");
      await installDeps(options);
      console.log("Installed dependencies via yarn.");
    }

    if (args.git) {
      console.log("Initializing git repo");
      await initGit(options);
      console.log("Initialized git repo.");
    }

    options = args;
  }

  const framework = frameworkOptions.find((x) => x.value === options.framework); // prettier-ignore
  const yay = color.cyan(`New Bolt CEP generated with ${framework?.label}`);
  const name = color.green(color.bold(options.dir.name));

  console.log(yay, name);
  console.log();
  console.log(color.cyan(`Path :: ${options.dir.path}`));
  console.log();
}
