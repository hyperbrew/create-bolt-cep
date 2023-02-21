import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";
import { parsePath } from "./parse-path";
import { replaceInFile } from "./replace";
import { updateObjectProperty, updateSwitchStatement } from "./ts-morph";
import { SelectOptions } from "@clack/prompts";

export type Options = {
  dir: ReturnType<typeof parsePath>;
  framework: string;
  template: string;
  apps: string[];
  git: boolean;
  installDeps: boolean;
  displayName: string;
  id: string;
};

type Option = { value: string; label: string };
export type OptionsArray = SelectOptions<Option[], string>["options"];

export const frameworkOptions: OptionsArray = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

export const hostAppOptions: OptionsArray = [
  { value: "aeft", label: "After Effects" },
  { value: "anim", label: "Animate" },
  { value: "ilst", label: "Illustrator" },
  { value: "phxs", label: "Photoshop" },
  { value: "ppro", label: "Premiere Pro" },
];

export const templateOptions: OptionsArray = [
  { value: "demo", label: "Demo" },
  { value: "skeleton", label: "Skeleton" },
];

export async function installBolt({
  dir,
  framework,
  template,
  apps,
  displayName,
  id,
}: Options) {
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
  const jsxFolder = path.join(dir.path, "src", "jsx");

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
  const cepConfig = path.join(dir.path, "cep.config.ts");
  replaceInFile(cepConfig, [[/.*(\/\/ BOLT-CEP-DEBUG-ONLY).*/g, ""]]);

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
    // src/js/favicon.svg
    // src/js/main/main.scss
    // src/js/index.scss
    // src/js/variables.scss
    //
    // remove references
    // cep.config.ts > config.iconDarkNormal: "./src/assets/light-icon.png",
    // cep.config.ts > config.iconNormal: "./src/assets/dark-icon.png",
    // cep.config.ts > config.iconDarkNormalRollOver: "./src/assets/light-icon.png",
    // cep.config.ts > config.iconNormalRollOver: "./src/assets/dark-icon.png",
    //
    // src/js/main/index.tsx > import "../index.scss";
    // src/js/main/index.ts > import "../index.scss";
    //
    // replace files
    // src/js/main/main.tsx > import "../index.scss";
    // src/js/main/main.svelte > import "../index.scss";
    // src/js/main/main.vue > import "../index.scss";
  }

  // Handle Adobe apps
  if (template === "skeleton" && Array.isArray(apps)) {
    const index = path.join(jsxFolder, "index.ts");
    const selectedApps = hostAppOptions.filter((x) => apps.includes(x.value));
    updateSwitchStatement(index, selectedApps);
    const hostAppStrings = apps.map((x) => {
      const name = x === "anim" ? "FLPR" : x.toUpperCase();
      return `{ name: "${name}", version: "[0.0,99.9]" }`;
    });
    updateObjectProperty(
      cepConfig,
      "config",
      "hosts",
      `[\n${hostAppStrings.join(",\n")}\n]`
    );

    const rejectedApps = hostAppOptions.filter((x) => !apps.includes(x.value));
    rejectedApps.forEach(({ value }) => fs.removeSync(path.join(jsxFolder, value))); // prettier-ignore
    fs.removeSync(path.join(jsxFolder, "utils"));
  }

  // Replace "Bolt-CEP", "bolt-cep", "com.bolt.cep"
  if (template === "skeleton") {
    const label = frameworkOptions.find((x) => x.value === framework)?.label!;
    const index = path.join(jsFolder, "main", "index.html");
    replaceInFile(index, [[`Bolt CEP ${label}`, displayName]]);
    replaceInFile(cepConfig, [
      ["Bolt CEP", displayName],
      ["com.bolt.cep", id],
    ]);
  }

  // set jsxbin to "off" for Apple Silicon
  const isAppleSilicon = os.cpus().some((cpu) => cpu.model.includes("Apple"));
  if (isAppleSilicon) {
    const replaceWithOff = `jsxBin: "off", // Not supported on Apple Silicon (yet)`;
    replaceInFile(cepConfig, [
      [`jsxBin: "copy",`, replaceWithOff],
      [`jsxBin: "replace",`, replaceWithOff],
    ]);
  }
}
