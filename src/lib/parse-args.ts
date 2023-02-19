import * as color from "picocolors";
import * as yargs from "yargs";
import { Options } from "./bolt";
import { parsePath } from "./parse-path";

export function parseArgs(): string | Options {
  const yargs = require("yargs");

  type Args = Omit<Options, "dir"> & { appname: string };
  const argv: yargs.Arguments<Args> = yargs
    .usage("Usage: $0 <appname> [options]")
    .positional("appname", {
      describe: "Name of the new bolt-cep application",
      type: "string",
    })
    .option("framework", {
      alias: "f",
      describe: "'react', 'vue', or 'svelte'",
      type: "string",
    })
    .option("template", {
      alias: "t",
      describe: "'demo', or 'skeleton'",
      type: "string",
    })
    .option("apps", {
      alias: "a",
      describe: "'aeft', 'anim', 'ilst', 'phxs', or 'ppro'",
      coerce: (arg: string | string[]) =>
        Array.isArray(arg) ? arg : arg ? [arg] : [],
      type: "array",
    })
    .option("install-dependencies", {
      alias: "i",
      describe: "Install dependencies",
      type: "boolean",
    })
    .option("initialize-git", {
      alias: "g",
      describe: "Initialize a new git repository",
      type: "boolean",
    })
    .check(({ framework, template, apps }: Args) => {
      if (framework && !["react", "vue", "svelte"].includes(framework)) {
        throwError(
          "--framework",
          "needs to be one of: 'react', 'vue', or 'svelte'",
          framework
        );
      }

      if (template && !["demo", "skeleton"].includes(template)) {
        throwError(
          "--template",
          "needs to be one of: 'demo', or 'skeleton'",
          template
        );
      }

      const validApps = ["aeft", "anim", "ilst", "phxs", "ppro"];
      if (apps.length && !apps.every((app) => validApps.includes(app))) {
        throwError(
          "--apps",
          "values need to be of supported apps: 'aeft', 'anim', 'ilst', 'phxs', or 'ppro'",
          apps.join(",")
        );
      }

      // TODO: check if path.join(process.cwd(), appName) is empty or already exists

      return true;
    })
    .help().argv;

  // if we only got an app name, return the name (prompts() will take over from there!)
  // otherwise, use the args passed to construct an Options object, falling back on defaults where necessary
  if (
    !argv.framework &&
    !argv.template &&
    !argv.apps.length &&
    !argv.git &&
    !argv.installDeps
  ) {
    return argv["_"][0] ? String(argv["_"][0]) : "";
  } else {
    return {
      dir: parsePath(String(argv["_"][0])),
      framework: argv.framework ?? "react",
      template: argv.template ?? "demo",
      apps: argv.apps ?? ["aeft", "anim", "ilst", "phxs", "ppro"],
      git: argv.git ?? false,
      installDeps: argv.installDeps ?? false,
    };
  }
}

export function throwError(arg: string, message: string, value: string) {
  const label = color.bgRed(` error `);
  const _arg = color.yellow(arg);
  const valueLabel = color.bgYellow(` value `);
  throw new Error(
    `\n${label} ${_arg} ${message}\n${valueLabel} ${_arg} was '${value}'\n`
  );
}
