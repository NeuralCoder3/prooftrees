import { calculus as inf_calculus, convertStringRule } from '../lib/inference_rules';
import { AppDispatchRenderer, ConstDispatchRenderer } from '../lib/logic/renderer';

export const calculus: inf_calculus = [
  convertStringRule({
    name: "Abort",
    conclusion: "stmt_hoare(False, Abort, ?Q)",
    premises: []
  }),
  convertStringRule({
    name: "Assign",
    conclusion: "stmt_hoare(And(defined(?e), ?Q'), Assign(?x, ?e), ?Q)",
    premises: [
      // or inline
      "Define(?Q', Subst(?Q, ?x, ?e))",
      "is_var(?x)",
    ]
  }),
  convertStringRule({
    name: "If",
    conclusion: "stmt_hoare(?P, If(?e, ?s1, ?s2), ?Q)",
    premises: [
      "stmt_hoare(And(?e, ?P), ?s1, ?Q)",
      "stmt_hoare(And(Not(?e), ?P), ?s2, ?Q)",
    ]
  }),
  convertStringRule({
    name: "While",
    conclusion: "stmt_hoare(?I, While(?e, ?s), And(?I, Not(?e)))",
    premises: [
      "stmt_hoare(And(?I, ?e), ?s, ?I)",
    ]
  }),
  // Program rules
  convertStringRule({
    name: "Block",
    conclusion: "stmt_hoare(?P, Block(?p), ?Q)",
    premises: [
      "prg_hoare(?P, ?p, ?Q)",
    ]
  }),
  convertStringRule({
    name: "Seq",
    conclusion: "prg_hoare(?P, Seq(?s, ?p), ?Q)",
    premises: [
      "stmt_hoare(?P, ?s, ?Q')",
      "prg_hoare(?Q', ?p, ?Q)",
    ]
  }),
  convertStringRule({
    name: "Term",
    conclusion: "prg_hoare(?P, epsilon, ?P)",
    premises: [
    ]
  }),
  // meta rules
  convertStringRule({
    name: "ConsequenceStmt",
    conclusion: "stmt_hoare(?P', ?s, ?Q')",
    premises: [
      "Implies(?P, ?P')",
      "stmt_hoare(?P, ?s, ?Q)",
      "Implies(?Q', ?Q)",
    ]
  }),
  convertStringRule({
    name: "ConsequencePrg",
    conclusion: "prg_hoare(?P', ?p, ?Q')",
    premises: [
      "Implies(?P, ?P')",
      "prg_hoare(?P, ?p, ?Q)",
      "Implies(?Q', ?Q)",
    ]
  }),
];

// expects program renderer
export const app_renderer: AppDispatchRenderer<string> = {
  "stmt_hoare": (_, args) => `⊢ { ${args[0]} } ${args[1]} { ${args[2]} }`,
  "prg_hoare": (_, args) => `⊢ { ${args[0]} } ${args[1]} { ${args[2]} }`,
  "Implies": (_, args) => `${args[0]} => ${args[1]}`,
  "And": (_, args) => `${args[0]} /\\ ${args[1]}`,
  "Define": (_, args) => `${args[0]} := ${args[1]}`,
  "defined": (_, args) => `def(${args[0]})`,
  "Not": (_, args) => `¬${args[0]}`,
  "Subst": (_, args) => `${args[0]} [${args[2]} / ${args[1]}]`,
};

export const const_renderer: ConstDispatchRenderer<string> = {
  "False": "⊥",
};
