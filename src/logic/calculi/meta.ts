import { calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { AppDispatchRenderer, ConstDispatchRenderer } from '../syntax/renderer';
import { renderer as type_app_renderer } from './type_conversion';

export const calculus: inf_calculus = {
  name: "Meta",
  rules: [
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
  ]
};
