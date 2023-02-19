import * as fs from "fs-extra";
import * as path from "path";
import { parsePath } from "./parse-path";
import { replaceInFile } from "./replace";

export type Options = {
  dir: ReturnType<typeof parsePath>;
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

  fs.mkdirSync(dir.path, { recursive: true });

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
        fs.copySync(srcItem, path.join(dir.path, `vite.config.ts`));
      } else if (item === `package.${framework}.json`) {
        fs.copySync(srcItem, path.join(dir.path, `package.json`));
      } else if (item === `tsconfig.${framework}.json`) {
        fs.copySync(srcItem, path.join(dir.path, `tsconfig.json`));
      } else {
        fs.copySync(srcItem, path.join(dir.path, item));
      }
    }
  });
  const jsFolder = path.join(dir.path, "src", "js");

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
  replaceInFile(path.join(dir.path, "cep.config.ts"), [
    [/.*(\/\/ BOLT-CEP-DEBUG-ONLY).*/g, ""],
  ]);

  // Add .gitignore
  fs.writeFileSync(
    path.join(dir.path, ".gitignore"),
    ["node_modules", "dist", ".DS_Store"].join("\r"),
    { encoding: "utf-8" }
  );

  // Handle template
  if (template === "skeleton") {
    // remove files/folders
    // src/js/assets
    // src/js/main/main.scss
    // src/js/favicon.svg
    // src/js/index.scss
    // src/js/variables.scss
    //
    // replace imports/boilerplate
    // cep.config.ts > config.iconDarkNormal: "./src/assets/light-icon.png",
    // cep.config.ts > config.iconNormal: "./src/assets/dark-icon.png",
    // cep.config.ts > config.iconDarkNormalRollOver: "./src/assets/light-icon.png",
    // cep.config.ts > config.iconNormalRollOver: "./src/assets/dark-icon.png",
    // src/js/main/index.tsx > import "../index.scss";
  }

  // Handle Adobe apps
  if (template === "skeleton" && Array.isArray(apps)) {
    apps.forEach((app) => {
      // remove files/folders
      // cep.config.ts > config.hosts
      // src/jsx/[app]
      //
      // replace imports/types
      // src/jsx/index.ts
    });
  }

  // Replace "Bolt-CEP", "bolt-cep", "com.bolt.cep" (or w/e)
  // cep.config.ts > config.id: "com.bolt.cep",
  // cep.config.ts > config.displayName: "Bolt CEP",
  // cep.config.ts > config.panels.panelDisplayName: "Bolt CEP",
  // src/js/index.html > <title>Bolt CEP React</title>

  // set jsxbin to "off" for M1 macs
  // cep.config.ts > config.build.jsxBin: "off",
  // cep.config.ts > config.zxp.jsxBin: "off",
}
