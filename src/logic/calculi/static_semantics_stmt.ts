import { calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { AppDispatchRenderer, ConstDispatchRenderer, renderNestedList } from '../syntax/renderer';

export const calculus: inf_calculus = {
  name: "StmtStaticSemantics",
  rules: [
    convertStringRule({
      name: "TAssign",
      conclusion: "stmt_typed(?Gamma, Assign(?l, ?e))",
      premises: [
        "typed(?Gamma, ?e, ?k1)",
        "typed(?Gamma, ?l, ?k2)",
        "convertible(?k1, ?k2)",
        ["is_scalar(?k1)", "side-condition"],
        ["is_scalar(?k2)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "TAbort",
      conclusion: "stmt_typed(?Gamma, Abort)",
      premises: [
      ]
    }),
    convertStringRule({
      name: "TIf",
      conclusion: "stmt_typed(?Gamma, If(?e, ?s1, ?s2))",
      premises: [
        "typed(?Gamma, ?e, ?k)",
        "stmt_typed(?Gamma, ?s1)",
        "stmt_typed(?Gamma, ?s2)",
        ["is_scalar(?k)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "TWhile",
      conclusion: "stmt_typed(?Gamma, While(?e, ?s))",
      premises: [
        "typed(?Gamma, ?e, ?k)",
        "stmt_typed(?Gamma, ?s)",
        ["is_scalar(?k)", "side-condition"],
      ]
    }),
    // Program rules
    convertStringRule({
      name: "TBlock",
      conclusion: "stmt_typed(?Gamma, Block(?p))",
      premises: [
        "prg_typed(?Gamma, ?p)",
      ]
    }),
    convertStringRule({
      name: "TSeq",
      conclusion: "prg_typed(?Gamma, Seq(?s, ?p))",
      premises: [
        "stmt_typed(?Gamma, ?s)",
        "prg_typed(?Gamma, ?p)",
      ]
    }),
    convertStringRule({
      name: "TTerm",
      conclusion: "prg_typed(?Gamma, epsilon)",
      premises: [
      ]
    }),
  ]
};

// couple with stmt renderer and convertible renderer
export const app_renderer: AppDispatchRenderer<string> = {
  "stmt_typed": (_, args) => `${args[0]} ⊢ ${args[1]}`,
  "prg_typed": (_, args) => `${args[0]} ⊢ ${args[1]}`,
  "Assign": (_, args) => `${args[0]} := ${args[1]};`,
  "If": (_, args) => `if (${args[0]}) ${args[1]} else ${args[2]}`,
  "While": (_, args) => `while (${args[0]}) ${args[1]}`,
  "Block": (_, args) => `{ ${args[0]} }`,
  "Seq": ([f, renderer], _) => renderNestedList(f, "Seq", "epsilon", renderer, " ", " ", "", "")

  // temporary
};

export const const_renderer: ConstDispatchRenderer<string> = {
  "epsilon": "",
  "Abort": "abort();",
};
