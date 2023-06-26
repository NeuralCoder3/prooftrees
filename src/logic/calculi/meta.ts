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
      conclusion: "?P",
      premises: []
    }),
    convertStringRule({
      name: "Admit",
      conclusion: "?P",
      premises: []
    }),
    convertStringRule({
      name: "LookupExtend",
      conclusion: "maps(Extend(?t, ?x, ?Gamma), ?x, ?t)",
      premises: [
      ]
    }),
    convertStringRule({
      name: "LookupSkip",
      conclusion: "maps(Extend(?t2, ?y, ?Gamma), ?x, ?t1)",
      premises: [
        "maps(?Gamma, ?x, ?t1)",
      ]
    }),
  ]
};
