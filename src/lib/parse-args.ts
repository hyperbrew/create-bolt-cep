import * as color from "picocolors";
import { titleCase } from "title-case";
import * as yargs from "yargs";
import {
  App,
  apps,
  Framework,
  frameworks,
  isAppStringArray,
  isFrameworkString,
  isTemplateString,
  Options,
  Template,
  templates,
} from "./options";
import { parsePath } from "./parse-path";

export async function parseArgs(): Promise<string | Options> {
  const argv = await yargs
    .usage("Usage: $0 <appname> [options]")
    .positional("appname", {
      describe: "Name of the new bolt-cep application",
      type: "string",
    })
    .option("framework", {
      alias: "f",
      choices: frameworks,
      type: "string",
    })
    .option("template", {
      alias: "t",
      choices: templates,
      type: "string",
    })
    .option("apps", {
      alias: "a",
      choices: apps,
      // coerce: (arg: string | string[]) =>
      //   Array.isArray(arg) ? arg : arg ? [arg] : [],
      type: "array",
    })
    .option("id", {
      alias: "id",
      describe: "Panel's id (com.bolt.cep)",
      type: "string",
    })
    .option("display-name", {
      alias: "n",
      describe: "Panel's display name (Bolt CEP)",
      type: "string",
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
    .check(({ framework, template, apps: _apps }) => {
      if (framework && !frameworks.includes(framework as Framework)) {
        throwError(
          "--framework",
          `needs to be one of: ${frameworks.map((x) => `'${x}'`).join(", ")}`,
          framework
        );
      }

      if (template && !templates.includes(template as Template)) {
        throwError(
          "--template",
          "needs to be one of: 'demo', or 'skeleton'",
          template
        );
      }

      if (_apps?.length && !_apps.every((app) => apps.includes(app as App))) {
        throwError(
          "--apps",
          `values need to be of supported apps: ${apps.map((x) => `'${x}'`).join(", ")}`, // prettier-ignore
          apps.join(",")
        );
      }

      return true;
    })
    .help().argv;

  // if we only got an app name, return the name (prompts() will take over from there!)
  // otherwise, use the args passed to construct an Options object, falling back on defaults where necessary
  const appName = argv.appname ? String(argv.appname) : "";
  const appDir = parsePath(appName);
  if (
    !argv.framework &&
    !argv.template &&
    !argv.apps?.length &&
    !argv.displayName &&
    !argv.id &&
    !argv.initializeGit &&
    !argv.installDependencies
  ) {
    return appName;
  } else {
    return {
      dir: appDir,
      framework: isFrameworkString(argv.framework) ? argv.framework : "react",
      template: isTemplateString(argv.template) ? argv.template : "demo",
      apps: isAppStringArray(argv.apps)
        ? argv.apps
        : ["aeft", "anim", "ilst", "phxs", "ppro"],
      git: argv.initializeGit ?? false,
      installDeps: argv.installDependencies ?? false,
      displayName: argv.displayName ?? titleCase(appDir.name),
      id: argv.id ?? `com.${appDir.name}.cep`,
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
