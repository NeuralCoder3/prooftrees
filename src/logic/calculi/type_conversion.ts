
// Definition 6.6.5: Implicit Type Conversion 
// https://compilers.cs.uni-saarland.de/prog2pretext/main/webapp/sec-c0-type.html#def-c0-autocast

import { calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { AppDispatchRenderer } from "../syntax/renderer";

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
