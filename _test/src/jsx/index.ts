// @include './lib/json2.js'

import { ns } from "../shared/shared";

import * as audt from "./audt/audt";
import * as idsn from "./idsn/idsn";
import * as kbrg from "./kbrg/kbrg";

//@ts-ignore
const host = typeof $ !== "undefined" ? $ : window;

switch (BridgeTalk.appName as ApplicationName) {
  case "audition":
  case "auditionbeta":
    host[ns] = audt;
    break;

  case "bridge":
  case "bridgebeta":
    host[ns] = kbrg;
    break;
  case "indesign":
  case "indesignbeta":
    host[ns] = idsn;
    break;
}

export type Scripts = typeof idsn & typeof kbrg & typeof audt

// https://extendscript.docsforadobe.dev/interapplication-communication/bridgetalk-class.html?highlight=bridgetalk#appname
type ApplicationName =
  | "aftereffects"
  | "aftereffectsbeta"
  | "ame"
  | "amebeta"
  | "audition"
  | "auditionbeta"
  | "bridge"
  | "bridgebeta"
  // | "flash"
  | "illustrator"
  | "illustratorbeta"
  | "indesign"
  | "indesignbeta"
  // | "indesignserver"
  | "photoshop"
  | "photoshopbeta"
  | "premierepro"
  | "premiereprobeta";
