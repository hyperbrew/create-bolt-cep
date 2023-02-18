import {
  intro,
  text,
  select,
  multiselect,
  outro,
  spinner,
  isCancel,
  cancel,
  confirm,
} from "@clack/prompts";
import { setTimeout as sleep } from "node:timers/promises";
import * as color from "picocolors";
import { frameworkOptions, installBolt } from "./bolt";
import { installDeps as _installDeps, initGit } from "./utils";

export async function prompts({ appName }: { appName: string }) {
  const cbc = color.bgGreen(` create-bolt-cep `);
  const bar = color.gray("│   ");
  const bru = bar + color.cyan(`by Hyper Brew | https://hyperbrew.co`);
  intro(`${cbc}\n${bru}`);

  // dir
  const dir = await text({
    message: "Where do you want to create your project?",
    placeholder: appName ? `./${appName}` : ".",
    initialValue: appName ? `./${appName}` : ".",
    defaultValue: appName ? `./${appName}` : ".",
    // validate(value) {
    //   if (value.charAt(0) !== ".") return `Heads up! Your path is absolute.`;
    // },
  });

  checkCancel(dir);

  // TODO: check if dir is empty or already exists

  // framework
  const framework = await select({
    message: "Which UI framework would you like to use?",
    options: frameworkOptions,
    initialValue: "react",
  });

  checkCancel(framework);
  const frameworkObject = frameworkOptions.find((x) => x.value === framework);

  // template
  const template = await select({
    message: `Which ${frameworkObject?.label} template would you like to start with?`,
    options: [
      { value: "demo", label: "Demo" },
      { value: "skeleton", label: "Skeleton" },
    ],
    initialValue: "demo",
  });

  checkCancel(template);

  // adobe apps
  let apps: symbol | string[] = [];
  if (template === "skeleton") {
    apps = await multiselect({
      message: "Which Adobe apps do you want to support?",
      options: [
        { value: "aeft", label: "After Effects" },
        { value: "anim", label: "Animate" },
        { value: "ilst", label: "Illustrator" },
        { value: "phxs", label: "Photoshop" },
        { value: "ppro", label: "Premiere Pro" },
      ],
      required: true,
    });

    checkCancel(apps);
  }

  // typescript
  // sass

  // Fn dependencies
  const recommended = color.gray("(recommended)");
  const installDeps = await confirm({
    message: `Do you want to install dependencies? ${recommended}`,
    initialValue: true,
  });

  checkCancel(installDeps);

  // git repo
  const git = await confirm({
    message: "Do you want to initialize a new git repository?",
    initialValue: true,
  });

  checkCancel(git);

  // install bolt-cep
  const s = spinner();
  s.start("Installing bolt-cep");

  if (!isString(dir)) return;
  if (!isString(framework)) return;
  if (!isString(template)) return;
  if (!isStringArray(apps)) return;
  if (!isBoolean(installDeps)) return;
  if (!isBoolean(git)) return;

  const options = { dir, framework, template, apps, installDeps, git };
  await installBolt(options);
  await sleep(3000);
  s.stop(`Installed ${color.bgGreen(` bolt-cep `)}.`);

  if (installDeps) {
    s.start("Installing dependencies via yarn");
    await _installDeps(options);
    s.stop("Installed dependencies via yarn.");
  }

  if (git) {
    s.start("Initializing git repo");
    await initGit(options);
    s.stop("Initialized git repo.");
  }

  outro(`You're all set!`);

  return options;
}

function checkCancel(value: unknown) {
  if (isCancel(value)) {
    cancel("Operation cancelled");
    return process.exit(0);
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}
