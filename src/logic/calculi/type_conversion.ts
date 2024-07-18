
// Definition 6.6.5: Implicit Type Conversion 
// https://compilers.cs.uni-saarland.de/prog2pretext/main/webapp/sec-c0-type.html#def-c0-autocast

import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { parseWhitespace } from '../syntax/parser';
import { AppDispatchRenderer } from "../syntax/renderer";
import { Expr, mkApp, mkConst } from '../syntax/syntactic_logic';

export const calculus: inf_calculus = {
  name: "TypeConversion",
  rules: [
    convertStringRule({
      name: "int",
      conclusion: "convertible(?i1, ?i2)",
      premises: [
        ["is_int(?i1)", "side-condition"],
        ["is_int(?i2)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "ptr_eq",
      conclusion: "convertible(Ptr(?t), Ptr(?t))",
      premises: []
    }),
    convertStringRule({
      name: "void_right",
      conclusion: "convertible(Ptr(?t), Ptr(void))",
      premises: []
    }),
    convertStringRule({
      name: "void_left",
      conclusion: "convertible(Ptr(void), Ptr(?t))",
      premises: []
    }),
  ]
};

export const renderer: AppDispatchRenderer<string> = {
  "convertible": (_, args) => `${args[0]} <-> ${args[1]}`,
  "Ptr": (_, args) => `${args[0]}*`,
};

/*
  type := int | void | type* | ( type )
*/
export function parseType(s: string): [Expr, string] {
  let str = s;
  str = parseWhitespace(str);

  let type = null;

  const primitive = ["int", "void"];
  for (const p of primitive) {
    if (str.startsWith(p)) {
      type = mkConst(p);
      str = str.slice(p.length);
      break;
    }
  }

  if (type === null) {
    if (str.startsWith("(")) {
      str = str.slice(1);
      str = parseWhitespace(str);
      const [t, rest] = parseType(str);
      str = parseWhitespace(rest);
      if (str.startsWith(")")) {
        str = str.slice(1);
        type = t;
      }
    }
  }

  if (type === null) {
    throw new Error("Expected type, got '" + s + "'");
  }

  str = parseWhitespace(str);
  while (str.startsWith("*")) {
    type = mkApp(mkConst("Ptr"), [type]);
    str = str.slice(1);
    str = parseWhitespace(str);
  }

  return [type, str];
}

export const parsers = {
  "Type": parseType,
};