import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { expectToken, parseWhitespace } from '../syntax/parser';
import { AppDispatchRenderer, ConstDispatchRenderer } from '../syntax/renderer';
import { App, Expr, mkApp, mkConst, Normalizers } from '../syntax/syntactic_logic';
import { Subst, applySubst } from '../unification/unification';
import { parseExpr } from './static_semantics_expr';
import { parseProgram, parseStmt } from './static_semantics_stmt';

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
      conclusion: "stmt_hoare(subst(?Q, ?x, ?e), Assign(?x, ?e), ?Q)",
      // conclusion: "stmt_hoare(and(defined(?e), ?Q'), Assign(?x, ?e), ?Q)",
      premises: [
        // or inline
        // "Define(?Q', subst(?Q, ?x, ?e))",
        ["is_var(?x)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "HAssignDef",
      // conclusion: "stmt_hoare(and(defined(?e), subst(?Q, ?x, ?e)), Assign(?x, ?e), ?Q)",
      conclusion: "stmt_hoare(BinOp(And, defined(?e), subst(?Q, ?x, ?e)), Assign(?x, ?e), ?Q)",
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
        // "stmt_hoare(and(?e, ?P), ?s1, ?Q)",
        // "stmt_hoare(and(not(?e), ?P), ?s2, ?Q)",
        "stmt_hoare(BinOp(And, ?P, ?e), ?s1, ?Q)",
        "stmt_hoare(BinOp(And, UnaryOp(Not, ?e), ?P), ?s2, ?Q)",
      ]
    }),
    // convertStringRule({
    //   name: "HWhile",
    //   conclusion: "stmt_hoare(?I, While(?e, ?s), and(?I, not(?e)))",
    //   premises: [
    //     "stmt_hoare(and(?I, ?e), ?s, ?I)",
    //   ]
    // }),
    convertStringRule({
      name: "HWhile",
      conclusion: "stmt_hoare(?I, While(?e, ?s), BinOp(And, ?I, UnaryOp(Not, ?e)))",
      premises: [
        // "stmt_hoare(and(?I, ?e), ?s, ?I)",
        "stmt_hoare(BinOp(And, ?I, ?e), ?s, ?I)",
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
        "implies(?P', ?P)",
        "stmt_hoare(?P, ?s, ?Q)",
        "implies(?Q, ?Q')",
      ]
    }),
    convertStringRule({
      name: "HConsequencePrg",
      conclusion: "prg_hoare(?P', ?p, ?Q')",
      premises: [
        "implies(?P', ?P)",
        "prg_hoare(?P, ?p, ?Q)",
        "implies(?Q, ?Q')",
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
  // "and": (_, args) => `${args[0]} /\\ ${args[1]}`,
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
    // console.log("subst", expr, Q, x, e)

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
  // convert to BinOp(And, a, b)
  "and": (expr: Expr) => {
    const app = expr as App;
    const [a, b] = app.args;
    return mkApp(mkConst("BinOp"), [mkConst("And"), a, b]);
  },
  "not": (expr: Expr) => {
    const app = expr as App;
    const [a] = app.args;
    return mkApp(mkConst("UnaryOp"), [mkConst("Not"), a]);
  }
};


function parseAssertion(s: string): [Expr, string] {
  return parseExpr(s);
}


function parseHoare(s: string, kind: "Stmt"|"Prg"): [Expr, string] {
  let str = s;
  str = parseWhitespace(str, true);
  str = expectToken(str, "|-");
  str = parseWhitespace(str, true);
  str = expectToken(str, "{");
  const [P, rest] = parseAssertion(str);
  str = rest;
  str = parseWhitespace(str, true);
  str = expectToken(str, "}");
  str = parseWhitespace(str, true);

  let inner = null;
  if (kind === "Stmt") {
    const [stmt, rest2] = parseStmt(str);
    inner = stmt;
    str = rest2;
  } else {
    const [prg, rest2] = parseProgram(str);
    inner = prg;
    str = rest2;
  }

  str = parseWhitespace(str, true);
  str = expectToken(str, "{");
  const [Q, rest3] = parseAssertion(str);
  str = rest3;
  str = parseWhitespace(str, true);
  str = expectToken(str, "}");
  str = parseWhitespace(str, true);

  return [mkApp(
      mkConst(kind === "Stmt" ? "stmt_hoare" : "prg_hoare"), 
      [P, inner, Q]
    ), str];
}

function parseStmtHoare(s: string): [Expr, string] {
  return parseHoare(s, "Stmt");
}
function parsePrgHoare(s: string): [Expr, string] {
  return parseHoare(s, "Prg");
}

export const parsers = {
  "Hoare Statement": parseStmtHoare,
  "Hoare Program": parsePrgHoare,
};
