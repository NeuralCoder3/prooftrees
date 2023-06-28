import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { AppDispatchRenderer, ConstDispatchRenderer } from '../syntax/renderer';
import { renderer as type_app_renderer } from './type_conversion';

export const calculus: inf_calculus = {
  name: "Meta",
  rules: [
    convertStringRule({
      name: "Auto",
      conclusion: "?P",
      premises: []
    }),
    convertStringRule({
      name: "SMT",
      conclusion: "smt_guard(?P)",
      premises: []
    }),
    convertStringRule({
      name: "Admit",
      conclusion: "?P",
      premises: []
    }),
    convertStringRule({
      name: "LookupFirst",
      conclusion: "maps(Extend(?t, ?x, ?Gamma), ?x, ?t)",
      premises: [
      ]
    }),
    convertStringRule({
      name: "LookupSkip",
      conclusion: "maps(Extend(?t2, ?y, ?Gamma), ?x, ?t1)",
      premises: [
        "maps(?Gamma, ?x, ?t1)",
        "not(equal(?x, ?y))",
      ]
    }),
    convertStringRule({
      name: "Test",
      // apply on ?A = 42
      // conclusion: "equal(?x, ?x)",
      conclusion: "equal(add(?x,0), ?x)",
      premises: []
    }),
  ]
};

export const app_renderer: AppDispatchRenderer<string> = {
  "not": (_, args) => `¬ (${args[0]})`,
  "equal": (_, args) => `${args[0]} = ${args[1]}`,
};

export const const_renderer: ConstDispatchRenderer<string> = {
};
