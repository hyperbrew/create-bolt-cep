#!/usr/bin/env node

import * as color from "picocolors";
import { boltIntro, prompts } from "./lib/prompts";
import { installBolt } from "./lib/bolt";
import { appOptions, frameworkOptions, templateOptions } from "./lib/options";
import { parseArgs, throwError } from "./lib/parse-args";
import { installDeps, initGit, buildBolt } from "./lib/utils";
import { note, outro, spinner } from "@clack/prompts";

main();

async function main() {
  let options = await parseArgs();
  let pretty;

  boltIntro();

  if (typeof options === "string") {
    try {
      options = await prompts({ destination: options });
      // prettier-ignore
      pretty = { // @ts-ignore
        framework: frameworkOptions.find((a) => a.value === options.framework)?.label, // @ts-ignore
        template: templateOptions.find((a) => a.value === options.template)?.label,
        apps: options.apps.map((x) => appOptions.find((a) => a.value === x)?.label).join(", ")
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    if (options.dir.exists && !options.dir.isEmpty)
      throwError("<appname>", `path is not empty.`, options.dir.path);

    // prettier-ignore
    pretty = { // @ts-ignore
      framework: frameworkOptions.find((a) => a.value === options.framework)?.label, // @ts-ignore
      template: templateOptions.find((a) => a.value === options.template)?.label,
      apps: options.apps.map((x) => appOptions.find((a) => a.value === x)?.label).join(", ")
    }

    note(
      [
        `panel      ${options.dir.name} (${options.displayName})`,
        `id         ${options.id}`,
        `framework  ${pretty.framework}`,
        `template   ${pretty.template}`,
        `apps       ${pretty.apps}`,
      ].join("\n"),
      "Inputs"
    );

    const s = spinner();
    s.start("Installing bolt-cep");
    await installBolt(options);
    s.stop(`Installed ${color.bgGreen(` bolt-cep `)}.`);

    if (options.installDeps) {
      s.start("Installing dependencies via yarn");
      await installDeps(options);
      s.stop("Installed dependencies via yarn.");

      s.start("Running initial build");
      await buildBolt(options);
      s.stop("Built!");
    }

    // if (options.git) {
    //   s.start("Initializing git repo");
    //   await initGit(options);
    //   s.stop("Initialized git repo.");
    // }
  }

  // just for type checking, we should never return here, given that the return of prompts() sets options to an Options object
  if (typeof options === "string") return;

  note(
    [
      `${pretty?.template} Bolt CEP generated with ${pretty?.framework}` +
        `: ${color.green(color.bold(options.dir.name))}`,
      options.dir.path,
    ].join("\n"),
    "Summary"
  );

  outro(
    `Problems? ${color.cyan(
      color.underline(`https://github.com/hyperbrew/bolt-cep`)
    )}`
  );
}
