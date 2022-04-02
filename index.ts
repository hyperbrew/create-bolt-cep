#!/usr/bin/env node

"use strict";

import * as fs from "fs-extra";
import * as path from "path";
import * as c from "colors/safe";
//@ts-ignore
// import * as cfonts from "cfonts";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
const argv = yargs(hideBin(process.argv)).argv;

const frameworks = [
  { name: "react", pretty: "React" },
  { name: "vue", pretty: "Vue" },
  { name: "svelte", pretty: "Svelte" },
];

const div = () =>
  console.info(c.grey("--------------------------------------------------"));
const space = () => console.info("");

const init = async () => {
  space();
  // cfonts.say("Bolt CEP", {
  //   font: "block", // define the font face
  //   align: "left", // define text alignment
  //   // colors: ["#f6921e", "#ff5b3b"], // define all colors
  //   background: "transparent", // define the background color, you can also use `backgroundColor` here as key
  //   letterSpacing: 1, // define letter spacing
  //   lineHeight: 1, // define the line height
  //   space: true, // define if the output text should have empty lines on top and on the bottom
  //   gradient: ["#f6921e", "#ff5b3b"],
  //   transitionGradient: true,
  //   maxLength: "0", // define how many character can be on one line
  // });
  console.log(c.green("Create Bolt CEP"));
  console.log(c.cyan("by Hyper Brew // https://hyperbrew.co"));
  space();
  div();
  space();
  const dir = process.cwd();
  //@ts-ignore
  const templateStr = argv["template"];
  //@ts-ignore
  const name = argv["_"].pop();

  const template = frameworks.find((f) => f.name === templateStr);

  if (template && name?.length > 0) {
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

    div();
    console.log(`New Bolt CEP generated with ${template.pretty}: ${name}`);
    div();
    console.log(`Path :: ${dest}`);
  } else {
    console.error(c.red("Incorrect Command"));
    space();
    console.info(c.cyan("EXAMPLES:"));
    div();
    console.info(
      c.cyan(`(e.g. "yarn create bolt-cep my-app --template react")`)
    );
    console.info(
      c.cyan(`(e.g. "yarn create bolt-cep my-cool-app --template vue")`)
    );
    div();
  }
};

init();
