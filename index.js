#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs-extra");
var path = require("path");
var c = require("colors/safe");
//@ts-ignore
// import * as cfonts from "cfonts";
var yargs_1 = require("yargs");
var helpers_1 = require("yargs/helpers");
var argv = (0, yargs_1["default"])((0, helpers_1.hideBin)(process.argv)).argv;
var frameworks = [
    { name: "react", pretty: "React" },
    { name: "vue", pretty: "Vue" },
    { name: "svelte", pretty: "Svelte" },
];
var div = function () {
    return console.info(c.grey("--------------------------------------------------"));
};
var space = function () { return console.info(""); };
var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var dir, templateStr, name, template, dest_1, localBolt, globalBolt, bolt_1, isSymlink, ignoreItems_1, jsFolder_1, tempMain, templateFolder, newName;
    return __generator(this, function (_a) {
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
        console.log(c.green("Create Bolt: CEP"));
        console.log(c.cyan("by Hyper Brew | https://hyperbrew.co"));
        space();
        div();
        space();
        dir = process.cwd();
        templateStr = argv["template"];
        name = argv["_"].pop();
        template = frameworks.find(function (f) { return f.name === templateStr; });
        if (template && (name === null || name === void 0 ? void 0 : name.length) > 0) {
            dest_1 = path.join(dir, name);
            localBolt = path.join(__dirname, "node_modules", "bolt-cep");
            globalBolt = path.join(__dirname, "..", "bolt-cep");
            bolt_1 = fs.existsSync(localBolt) ? localBolt : globalBolt;
            isSymlink = fs.lstatSync(bolt_1).isSymbolicLink();
            bolt_1 = isSymlink ? fs.realpathSync(bolt_1) : bolt_1;
            fs.mkdirSync(dest_1);
            ignoreItems_1 = [".git", "node_modules", "dist"];
            fs.readdirSync(bolt_1).map(function (item) {
                if (!ignoreItems_1.includes(item)) {
                    var srcItem = path.join(bolt_1, item);
                    var dstItem = path.join(dest_1, item);
                    fs.copySync(srcItem, dstItem);
                }
            });
            jsFolder_1 = path.join(dest_1, "src", "js");
            tempMain = path.join(jsFolder_1, "main");
            if (fs.existsSync(tempMain)) {
                fs.rmSync(tempMain, { recursive: true });
            }
            else {
                console.error("TEMP MAIN doesn't exist");
            }
            templateFolder = path.join(jsFolder_1, "template-".concat(template.name));
            newName = path.join(jsFolder_1, "main");
            if (fs.existsSync(templateFolder)) {
                fs.renameSync(templateFolder, newName);
            }
            // Delete Extra Templates
            fs.readdirSync(jsFolder_1).map(function (extraTemplate) {
                if (extraTemplate.indexOf("template-") === 0) {
                    fs.rmSync(path.join(jsFolder_1, extraTemplate), { recursive: true });
                }
            });
            div();
            console.log(c.cyan("New Bolt CEP generated with ".concat(template.pretty)), c.green(name));
            div();
            console.log(c.cyan("Path :: ".concat(dest_1)));
            div();
            div();
        }
        else {
            console.error(c.red("Incorrect Command"));
            space();
            console.info(c.cyan("EXAMPLES:"));
            div();
            console.info(c.cyan("(e.g. \"yarn create bolt-cep my-app --template react\")"));
            console.info(c.cyan("(e.g. \"yarn create bolt-cep my-cool-app --template vue\")"));
            div();
        }
        return [2 /*return*/];
    });
}); };
init();
