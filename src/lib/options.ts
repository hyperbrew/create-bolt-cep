import { parsePath } from "./parse-path";
import { SelectOptions } from "@clack/prompts";

export type Options = {
  dir: ReturnType<typeof parsePath>;
  framework: Framework;
  template: Template;
  apps: App[];
  displayName: string;
  id: string;
  installDeps: boolean;
  git: boolean;
};

export type Framework = typeof frameworks[number];
export const frameworks = ["react", "vue", "svelte"] as const;
export const frameworkOptions: OptionsArray<Framework> = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

export type App = typeof apps[number];
export const apps = ["aeft", "anim", "ilst", "phxs", "ppro"] as const;
export const appOptions: OptionsArray<App> = [
  { value: "aeft", label: "After Effects" },
  { value: "anim", label: "Animate" },
  { value: "ilst", label: "Illustrator" },
  { value: "phxs", label: "Photoshop" },
  { value: "ppro", label: "Premiere Pro" },
];

export type Template = typeof templates[number];
export const templates = ["demo", "skeleton"] as const;
export const templateOptions: OptionsArray<Template> = [
  { value: "demo", label: "Demo" },
  { value: "skeleton", label: "Skeleton" },
];

// annoying types to satisfy @clack/prompts and to be explicit in the above Options type
type Option<T extends string> = { value: T; label: string };
export type OptionsArray<T extends string> = SelectOptions<
  Option<T>[],
  string
>["options"];

// predicates
export function isAppStringArray(value: unknown): value is App[] {
  return Array.isArray(value) && value.every((x) => isAppString(x));
}

export function isAppString(value: unknown): value is App {
  return apps.includes(value as App);
}

export function isFrameworkString(value: unknown): value is Framework {
  return frameworks.includes(value as Framework);
}

export function isTemplateString(value: unknown): value is Template {
  return templates.includes(value as Template);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}
