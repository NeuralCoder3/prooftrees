import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { AppDispatchRenderer, ConstDispatchRenderer } from '../syntax/renderer';
import { App, Expr, Normalizers } from '../syntax/syntactic_logic';
import { Subst, applySubst } from '../unification/unification';

export const calculus: inf_calculus = {
  name: "Hoare",
  rules: [
    convertStringRule({
      name: "HAbort",
      conclusion: "stmt_hoare(False, Abort, ?Q)",
      premises: []
    }),
    convertStringRule({
      name: "HAssign",
      conclusion: "stmt_hoare(and(defined(?e), subst(?Q, ?x, ?e)), Assign(?x, ?e), ?Q)",
      // conclusion: "stmt_hoare(and(defined(?e), ?Q'), Assign(?x, ?e), ?Q)",
      premises: [
        // or inline
        // "Define(?Q', subst(?Q, ?x, ?e))",
        ["is_var(?x)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "HIf",
      conclusion: "stmt_hoare(?P, If(?e, ?s1, ?s2), ?Q)",
      premises: [
        "stmt_hoare(and(?e, ?P), ?s1, ?Q)",
        "stmt_hoare(and(not(?e), ?P), ?s2, ?Q)",
      ]
    }),
    convertStringRule({
      name: "HWhile",
      conclusion: "stmt_hoare(?I, While(?e, ?s), and(?I, not(?e)))",
      premises: [
        "stmt_hoare(and(?I, ?e), ?s, ?I)",
      ]
    }),
    // Program rules
    convertStringRule({
      name: "HBlock",
      conclusion: "stmt_hoare(?P, Block(?p), ?Q)",
      premises: [
        "prg_hoare(?P, ?p, ?Q)",
      ]
    }),
    convertStringRule({
      name: "HSeq",
      conclusion: "prg_hoare(?P, Seq(?s, ?p), ?R)",
      premises: [
        "stmt_hoare(?P, ?s, ?Q)",
        "prg_hoare(?Q, ?p, ?R)",
      ]
    }),
    convertStringRule({
      name: "HSeqS",
      conclusion: "prg_hoare(?P, Seq(?s1, Seq(?s2, Term)), ?R)",
      premises: [
        "stmt_hoare(?P, ?s1, ?Q)",
        "stmt_hoare(?Q, ?s2, ?R)",
      ]
    }),
    convertStringRule({
      name: "HTerm",
      conclusion: "prg_hoare(?P, Term, ?P)",
      premises: [
      ]
    }),
    // meta rules
    convertStringRule({
      name: "HConsequenceStmt",
      conclusion: "stmt_hoare(?P', ?s, ?Q')",
      premises: [
        "implies(?P, ?P')",
        "stmt_hoare(?P, ?s, ?Q)",
        "implies(?Q', ?Q)",
      ]
    }),
    convertStringRule({
      name: "HConsequencePrg",
      conclusion: "prg_hoare(?P', ?p, ?Q')",
      premises: [
        "implies(?P, ?P')",
        "prg_hoare(?P, ?p, ?Q)",
        "implies(?Q', ?Q)",
      ]
    }),
    convertStringRule({
      name: "ImpliesIdem",
      conclusion: "implies(?P, ?P)",
      premises: [
      ]
    }),
  ]
};

// expects program renderer
export const app_renderer: AppDispatchRenderer<string> = {
  "stmt_hoare": (_, args) => `⊢ { ${args[0]} } ${args[1]} { ${args[2]} }`,
  "prg_hoare": (_, args) => `⊢ { ${args[0]} } ${args[1]} { ${args[2]} }`,
  "implies": (_, args) => `(${args[0]}) => (${args[1]})`,
  "and": (_, args) => `${args[0]} /\\ ${args[1]}`,
  "Define": (_, args) => `${args[0]} := ${args[1]}`,
  "defined": (_, args) => `def(${args[0]})`,
  // covered in meta
  // "not": (_, args) => `¬${args[0]}`,
  "subst": (_, args) => `${args[0]} [${args[2]} / ${args[1]}]`,
};

export const const_renderer: ConstDispatchRenderer<string> = {
  "False": "⊥",
};

export const normalizers: Normalizers = {
  "subst": (expr: Expr) => {
    // we know expr = App (Const "subst", [Q, x, e])
    const app = expr as App;
    const [Q, x, e] = app.args;
    console.log("subst", expr, Q, x, e)

    if (Q.kind === "var")
      return expr;
    if (x.kind !== "const")
      return expr;

    const subst: Subst = {
      [x.value]: e,
    };
    const substQ = applySubst(subst, Q, "const");
    return substQ;
  },
};
