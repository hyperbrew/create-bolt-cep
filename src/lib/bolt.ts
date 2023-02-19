import * as fs from "fs-extra";
import * as path from "path";
import { replaceInFile } from "./replace";

export type Options = {
  dir: string;
  framework: string;
  template: string;
  apps: string[];
  git: boolean;
  installDeps: boolean;
};

export const frameworkOptions = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

export async function installBolt({ dir, framework, template, apps }: Options) {
  const root = path.join(__dirname, "..", "..");
  const localBolt = path.join(root, "node_modules", "bolt-cep");
  const globalBolt = path.join(root, "..", "bolt-cep");

  let bolt = fs.existsSync(localBolt) ? localBolt : globalBolt;
  const isSymlink = fs.lstatSync(bolt).isSymbolicLink();
  bolt = isSymlink ? fs.realpathSync(bolt) : bolt;

  fs.mkdirSync(dir);

  // Get Unused Packages
  const unused = frameworkOptions
    .filter((item) => item.value !== framework)
    .map((i) => i.value);

  const ignoreItems = [
    ".git",
    "node_modules",
    "dist",
    "cep.config.debug.ts",
    "tsconfig.json",
    "vite.config.ts",
    "package.json",
  ];

  unused.map((item) => {
    ignoreItems.push(`vite.config.${item}.ts`);
    ignoreItems.push(`package.${item}.json`);
    ignoreItems.push(`tsconfig.${item}.json`);
  });

  fs.readdirSync(bolt).map((item) => {
    if (!ignoreItems.includes(item)) {
      const srcItem = path.join(bolt, item);
      if (item === `vite.config.${framework}.ts`) {
        fs.copySync(srcItem, path.join(dir, `vite.config.ts`));
      } else if (item === `package.${framework}.json`) {
        fs.copySync(srcItem, path.join(dir, `package.json`));
      } else if (item === `tsconfig.${framework}.json`) {
        fs.copySync(srcItem, path.join(dir, `tsconfig.json`));
      } else {
        fs.copySync(srcItem, path.join(dir, item));
      }
    }
  });
  const jsFolder = path.join(dir, "src", "js");

  // Remove Placeholder
  const tempMain = path.join(jsFolder, "main");
  if (fs.existsSync(tempMain)) {
    fs.rmSync(tempMain, { recursive: true });
  } else {
    console.error("TEMP MAIN doesn't exist");
  }

  // Move Template
  const templateFolder = path.join(jsFolder, `template-${framework}`);
  const newName = path.join(jsFolder, `main`);
  if (fs.existsSync(templateFolder)) {
    fs.renameSync(templateFolder, newName);
  }

  // Delete Extra Templates
  fs.readdirSync(jsFolder).map((extraTemplate) => {
    if (extraTemplate.indexOf("template-") === 0) {
      fs.rmSync(path.join(jsFolder, extraTemplate), { recursive: true });
    }
  });

  // Remove Debug Lines from config
  replaceInFile(path.join(dir, "cep.config.ts"), [
    [/.*(\/\/ BOLT-CEP-DEBUG-ONLY).*/g, ""],
  ]);

  // Add .gitignore
  fs.writeFileSync(
    path.join(dir, ".gitignore"),
    ["node_modules", "dist", ".DS_Store"].join("\r"),
    { encoding: "utf-8" }
  );

  // Handle template
  if (template === "skeleton") {
    // remove files/folders
    // replace imports/boilerplate
  }

  // Handle Adobe apps
  if (template === "skeleton" && Array.isArray(apps)) {
    apps.forEach((app) => {
      // remove files/folders
      // replace imports/types
    });
  }

  // Replace "Bolt-CEP", "bolt-cep", "com.bolt.cep" (or w/e)
}
