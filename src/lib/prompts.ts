import {
  intro,
  text,
  select,
  multiselect,
  spinner,
  isCancel,
  cancel,
  confirm,
} from "@clack/prompts";
import { formatTitle } from "./format-title";
import * as color from "picocolors";
import { installBolt } from "./bolt";
import {
  appOptions,
  frameworkOptions,
  isAppStringArray,
  isBoolean,
  isFrameworkString,
  isString,
  isTemplateString,
  Options,
  templateOptions,
} from "./options";
import { parsePath } from "./parse-path";
import { installDeps as _installDeps, initGit, buildBolt } from "./utils";

export async function prompts({
  destination,
}: {
  destination: string;
}): Promise<Options> {
  // dir
  const placeholder = destination ? destination : "./";
  let dir: symbol | string | ReturnType<typeof parsePath> = await text({
    message: "Where do you want to create your project?",
    placeholder: placeholder,
    initialValue: placeholder,
    defaultValue: placeholder,
    validate(value) {
      const dir = parsePath(value);
      if (dir.exists) return `Heads up! ${dir.path} already exists.`;
      if (!dir.isEmpty) return `Heads up! ${dir.path} is not empty.`;
    },
  });

  handleCancel(dir);
  if (!isString(dir)) throw new Error("");
  dir = parsePath(dir);

  // framework
  const framework = await select({
    message: "Which UI framework would you like to use?",
    options: frameworkOptions,
    initialValue: "react",
  });

  handleCancel(framework);
  const frameworkObject = frameworkOptions.find((x) => x.value === framework);

  // template
  const template = await select({
    message: `Which ${frameworkObject?.label} template would you like to start with?`,
    options: templateOptions,
    initialValue: "demo",
  });

  handleCancel(template);

  // adobe apps
  let apps: symbol | string[] = [];
  let displayName: symbol | string = "";
  let id: symbol | string = "";
  if (template === "skeleton") {
    apps = await multiselect({
      message: "Which Adobe apps do you want to support?",
      options: appOptions,
      required: true,
    });

    handleCancel(apps);
    const placeholder = formatTitle(dir.name);
    displayName = await text({
      message: "What do you want to use as your panel's display name?",
      placeholder: placeholder,
      initialValue: placeholder,
      defaultValue: placeholder,
    });

    handleCancel(displayName);

    id = await text({
      message: "What do you want to use as your panel's id?",
      placeholder: `com.${dir.name}.cep`,
      initialValue: `com.${dir.name}.cep`,
      defaultValue: `com.${dir.name}.cep`,
    });

    handleCancel(id);
  }

  // install dependencies
  const recommended = color.gray("(recommended)");
  const installDeps = await confirm({
    message: `Do you want to install dependencies? ${recommended}`,
    initialValue: true,
  });

  handleCancel(installDeps);

  // git repo
  // const git = await confirm({
  //   message: "Do you want to initialize a new git repository?",
  //   initialValue: true,
  // });

  // handleCancel(git);

  // install bolt-cep
  const s = spinner();
  s.start("Installing bolt-cep");

  if (!isFrameworkString(framework)) throw new Error("");
  if (!isTemplateString(template)) throw new Error("");
  if (!isAppStringArray(apps)) throw new Error("");
  if (!isString(displayName)) throw new Error("");
  if (!isString(id)) throw new Error("");
  if (!isBoolean(installDeps)) throw new Error("");
  // if (!isBoolean(git)) return;

  const options = { dir, framework, template, apps, displayName, id, installDeps, git: false }; // prettier-ignore
  await installBolt(options);

  s.stop(`Installed ${color.bgGreen(` bolt-cep `)}.`);

  if (installDeps) {
    s.start("Installing dependencies via yarn");
    await _installDeps(options);
    s.stop("Installed dependencies via yarn.");

    s.start("Running initial build");
    await buildBolt(options);
    s.stop("Built!");
  }

  // if (git) {
  //   s.start("Initializing git repo");
  //   await initGit(options);
  //   s.stop("Initialized git repo.");
  // }

  // outro(`You're all set!`);

  return options;
}

export function boltIntro() {
  console.log();
  const cbc = color.bgGreen(` create-bolt-cep `);
  const bar = color.gray("│   ");
  const bru =
    bar +
    color.cyan(`by Hyper Brew | ${color.underline("https://hyperbrew.co")}`);
  intro(`${cbc}\n${bru}`);
}

function handleCancel(value: unknown) {
  if (isCancel(value)) {
    cancel("Operation cancelled");
    return process.exit(0);
  }
}
