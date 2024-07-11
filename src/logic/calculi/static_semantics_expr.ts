import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { AppDispatchRenderer, AppRenderer, ConstDispatchRenderer } from '../syntax/renderer';
import { renderer as type_app_renderer } from './type_conversion';

export const calculus: inf_calculus = {
  name: "ExprStaticSemantics",
  rules: [
    convertStringRule({
      name: "TVar",
      conclusion: "typed(?Gamma, ?x, ?k)",
      premises: [
        "maps(?Gamma, ?x, ?k)",
        ["is_var(?x)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "TConst",
      conclusion: "typed(?Gamma, ?c, int)",
      premises: ["is_bound(?c)"]
    }),
    convertStringRule({
      name: "TArith",
      conclusion: "typed(?Gamma, BinOp(?r, ?e1, ?e2), int)",
      premises: [
        "typed(?Gamma, ?e1, ?i1)",
        "typed(?Gamma, ?e2, ?i2)",
        ["is_int(?i1)", "side-condition"],
        ["is_int(?i2)", "side-condition"],
        ["is_arith_op(?r)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "TCmp",
      conclusion: "typed(?Gamma, BinOp(?m, ?e1, ?e2), int)",
      premises: [
        "typed(?Gamma, ?e1, ?k1)",
        "typed(?Gamma, ?e2, ?k2)",
        ["is_cmp_op(?m)", "side-condition"],
        "convertible(?k1, ?k2)"
      ]
    }),
    // TPtrArith, TPtrDiff, TPtrCmp, TPtrCmpN
    convertStringRule({
      name: "TIndir",
      conclusion: "typed(?Gamma, Indir(?e), ?k)",
      premises: [
        "typed(?Gamma, ?e, Ptr(?k))",
        ["is_scalar(?k)", "side-condition"]
      ]
    }),
    convertStringRule({
      name: "TAddr",
      conclusion: "typed(?Gamma, Addr(?l), Ptr(?t))",
      premises: [
        "typed(?Gamma, ?l, ?t)"
      ]
    }),
  ]
};

const binopRenderer : AppRenderer<string> = ([f,renderer], args) => {
  let [op_str, e1_str, e2_str] = args;
  // if mul operation
  if(f.args[0].kind === "const" &&
    (f.args[0].value === "Mul" || f.args[0].value === "Div")
  ) {
    // if e1 is a binop with a plus operation
    const e1 = f.args[1];
    if(e1.kind === "app" &&
      e1.callee.kind === "const" &&
      e1.callee.value === "BinOp" &&
      e1.args[0].kind === "const" &&
      (e1.args[0].value === "Add" || e1.args[0].value === "Sub")) {
      e1_str = `(${e1_str})`;
    }
    // same for e2
    const e2 = f.args[2];
    if(e2.kind === "app" &&
      e2.callee.kind === "const" &&
      e2.callee.value === "BinOp" &&
      e2.args[0].kind === "const" &&
      (e2.args[0].value === "Add" || e2.args[0].value === "Sub")) {
      e2_str = `(${e2_str})`;
    }
  }
  return `${e1_str} ${op_str} ${e2_str}`;
};

export const app_renderer: AppDispatchRenderer<string> = {
  ...type_app_renderer,
  "typed": (_, args) => `${args[0]} ⊢ ${args[1]} : ${args[2]}`,
  "maps": (_, args) => `${args[0]} ${args[1]} = ${args[2]}`,
  "is_bound": (_, args) => `-2³¹ ≤ ${args[0]} < 2³¹`,
  // "BinOp": (_, args) => `${args[1]} ${args[0]} ${args[2]}`,
  "BinOp": binopRenderer,
  "UnOp": (_, args) => `${args[0]} ${args[1]}`,
  "UnaryOp": (_, args) => `${args[0]} ${args[1]}`, // for completeness
  "Indir": (_, args) => `*${args[0]}`,
  "Addr": (_, args) => `&${args[0]}`,

  // temporary
  "is_arith_op": (_, args) => `${args[0]} ∈ {+, -, *, /}`,
  "is_cmp_op": (_, args) => `${args[0]} ∈ {<, ≤, >, ≥, ==, !=}`,
  "is_int": (_, args) => `${args[0]} ∈ {int, char}`,
};

export const const_renderer: ConstDispatchRenderer<string> = {
  "Plus": "+",
  "Minus": "-",
  
  "UnEqual": "!=",
  // "Unequal": "!=",
  "Equal": "==",
  "Less": "<",
  "LessEqual": "≤",
  "Greater": ">",
  "GreaterEqual": "≥",
  "Div": "/",
  "Mul": "*",
  "Add": "+",
  "Sub": "-",

  "Addr": "&",
  "Indir": "*",
};
