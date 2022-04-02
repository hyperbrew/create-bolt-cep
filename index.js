#!/usr/bin/env node

// @ts-check
"use strict";

const fs = require("fs-extra");
const path = require("path");

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const frameworks = [
  { name: "react", pretty: "React" },
  { name: "vue", pretty: "Vue" },
  { name: "svelte", pretty: "Svelte" },
];

const init = async () => {
  console.log("Create Bolt CEP");
  console.log("by Hyper Brew");
  console.log("hyperbrew.co");
  console.info("--------------");
  const dir = process.cwd();
  const templateStr = argv["template"];
  const name = argv["_"].pop();

  const template = frameworks.find((f) => f.name === templateStr);

  if (frameworks.map((f) => f.name).includes(templateStr) && name?.length > 0) {
    const dest = path.join(dir, name);
    let localBolt = path.join(__dirname, "node_modules", "bolt-cep");
    let globalBolt = path.join(__dirname, "..", "bolt-cep");
    let bolt = fs.existsSync(localBolt) ? localBolt : globalBolt;
    const isSymlink = fs.lstatSync(bolt).isSymbolicLink();
    bolt = isSymlink ? fs.realpathSync(bolt) : bolt;
    fs.mkdirSync(dest);
    const ignoreItems = [".git", "node_modules", "dist"];
    fs.readdirSync(bolt).map((item) => {
      if (!ignoreItems.includes(item)) {
        const srcItem = path.join(bolt, item);
        const dstItem = path.join(dest, item);
        fs.copySync(srcItem, dstItem);
      }
    });
    const jsFolder = path.join(dest, "src", "js");

    // Remove Placeholder
    const tempMain = path.join(jsFolder, "main");
    if (fs.existsSync(tempMain)) {
      fs.rmSync(tempMain, { recursive: true });
    } else {
      console.error("TEMP MAIN doesn't exist");
    }

    // Move Template
    const templateFolder = path.join(jsFolder, `template-${template.name}`);
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

    console.info("--------------");
    console.log(`New Bolt CEP generated with ${template.pretty}: ${name}`);
    console.info("--------------");
    console.log(`Path :: ${dest}`);
  } else {
    console.error("Command Incorrect");
    console.info("");
    console.info("EXAMPLES:");
    console.info("--------------");
    console.info(`(e.g. "yarn create bolt-cep my-app --template react")`);
    console.info(`(e.g. "yarn create bolt-cep my-cool-app --template vue")`);
    console.info("--------------");
  }
};

init();
