import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { expectToken, parseIdent, parseWhitespace } from '../syntax/parser';
import { AppDispatchRenderer, AppRenderer, ConstDispatchRenderer, envRenderer, renderNestedList, renderNestedListAdvanced } from '../syntax/renderer';
import { Expr, fun, mkConst } from '../syntax/syntactic_logic';
import { parseExpr } from './static_semantics_expr';

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
    convertStringRule({
      name: "TDecl",
      conclusion: "stmt_typed(?Gamma, Block(Seq(Declare(?t, ?n), ?p)))",
      premises: [
        "stmt_typed(Extend(?t, ?n, ?Gamma), Block(?p))",
        ["is_type(?t)", "side-condition"],
      ]
      // conclusion: "prg_typed(?Gamma, Seq(Declare(?t, ?n), ?p))",
      // premises: [
      //   "prg_typed(Extend(?t, ?n, ?Gamma), ?p)",
      //   ["is_type(?t)", "side-condition"],
      // ]
    }),
    // Program rules
    convertStringRule({
      name: "TBlock",
      conclusion: "stmt_typed(?Gamma, Block(?p))",
      premises: [
        "prg_typed(?Gamma, ?p)",
        ["not(has_declare(?p))", "side-condition"],
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
      name: "TSeq1",
      conclusion: "prg_typed(?Gamma, Seq(?s, Term))",
      premises: [
        "stmt_typed(?Gamma, ?s)",
      ]
    }),
    convertStringRule({
      name: "TSeq2",
      conclusion: "prg_typed(?Gamma, Seq(?s, Seq(?s2, Term)))",
      premises: [
        "stmt_typed(?Gamma, ?s)",
        "stmt_typed(?Gamma, ?s2)",
      ]
    }),
    // convertStringRule({
    //   name: "IntLookup",
    //   conclusion: "maps(?Gamma, ?x, int)",
    //   premises: [
    //   ]
    // }),
    convertStringRule({
      name: "TTerm",
      conclusion: "prg_typed(?Gamma, Term)",
      premises: [
      ]
    }),
  ]
};

// simple
// const envRenderer: AppRenderer<string> = (_, args) => `${args[2]}[${args[0]} ↦ ${args[1]}]`;

// with duplicates
// const envRenderer: AppRenderer<string> = ([f, renderer], _) =>
//   renderNestedList(f, "Extend", "emptyEnv", renderer, ", ", (left, right) => right + left, "{", "}",
//     (args) => [fun("DeclPair", [args[0], args[1]]), args[2]]);


// couple with stmt renderer and convertible renderer
export const app_renderer: AppDispatchRenderer<string> = {
  "stmt_typed": (_, args) => `${args[0]} ⊢ ${args[1]}`,
  "prg_typed": (_, args) => `${args[0]} ⊢ ${args[1]}`,
  "Assign": (_, args) => `${args[0]} = ${args[1]};`,
  "If": (_, args) => `if (${args[0]}) ${args[1]} else ${args[2]}`,
  "While": (_, args) => `while (${args[0]}) ${args[1]}`,
  "Declare": (_, args) => `${args[0]} ${args[1]};`,
  "DeclPair": (_, args) => `${args[1]} ↦ ${args[0]}`,
  "Maps": (_, args) => `${args[1]} ↦ ${args[0]}`,
  "Extend": envRenderer("emptyEnv", "Extend", "DeclPair"),
  "Block": (_, args) => `{ ${args[0]} }`,
  "Seq": ([f, renderer], _) => renderNestedList(f, "Seq", "Term", renderer, " ", (left, right) => left + " " + right, "", "")

  // temporary
};

export const const_renderer: ConstDispatchRenderer<string> = {
  "Term": "ε",
  "emptyEnv": "∅",
  "Abort": "abort();",
};


export function parseStmt(s: string): [Expr, string] {
  let str = s;
  str = parseWhitespace(str);

  let stmt = null;

  if (str.startsWith("abort")) {
    str = str.slice("abort".length);
    str = parseWhitespace(str);
    str = expectToken(str, "(");
    str = parseWhitespace(str);
    str = expectToken(str, ")");
    str = parseWhitespace(str);
    str = expectToken(str, ";");
    stmt = fun("Abort", []);
  } else if (str.startsWith("if")) {
    str = str.slice("if".length);
    str = parseWhitespace(str);
    str = expectToken(str, "(");
    str = parseWhitespace(str);
    const [e, rest] = parseExpr(str);
    str = parseWhitespace(rest);
    str = expectToken(str, ")");
    str = parseWhitespace(str);
    str = expectToken(str, "{");
    str = parseWhitespace(str);
    const [s1, rest1] = parseStmt(str);
    str = parseWhitespace(rest1);
    str = expectToken(str, "}");
    str = parseWhitespace(str);
    str = expectToken(str, "else");
    str = parseWhitespace(str);
    str = expectToken(str, "{");
    const [s2, rest2] = parseStmt(str);
    str = rest2;
    str = parseWhitespace(str);
    str = expectToken(str, "}");
    str = parseWhitespace(str);
    stmt = fun("If", [e, s1, s2]);
  } else if (str.startsWith("while")) {
    str = str.slice("while".length);
    str = parseWhitespace(str);
    str = expectToken(str, "(");
    str = parseWhitespace(str);
    const [e, rest] = parseExpr(str);
    str = parseWhitespace(rest);
    str = expectToken(str, ")");
    str = parseWhitespace(str);
    const [s, rest1] = parseStmt(str);
    str = rest1;
    // str = expectToken(str, "{");
    // str = parseWhitespace(str);
    // const [s, rest1] = parseStmt(str);
    // str = parseWhitespace(rest1);
    // str = expectToken(str, "}");
    stmt = fun("While", [e, s]);
  } else if (str.startsWith("{")) {
    str = str.slice(1);
    const [p, rest] = parseProgram(str);
    str = rest;
    str = parseWhitespace(str);
    str = expectToken(str, "}");
    stmt = fun("Block", [p]);
  }

  if (stmt !== null) {
    return [stmt, str];
  }

  // assign
  let [ident, rest2] = parseIdent(str);
  str = rest2;
  str = parseWhitespace(str);
  str = expectToken(str, "=");
  str = parseWhitespace(str);
  const [e, rest3] = parseExpr(str);
  str = rest3;
  str = parseWhitespace(str);
  str = expectToken(str, ";");
  stmt = fun("Assign", [mkConst(ident), e]);
  return [stmt, str];
  // Decl, Blocks, Seq
}

export function parseProgram(s:string) : [Expr, string] {
  let str = s;
  let stmt_list = []
  while(true) {
    let s_org = str;
    try {
      str = parseWhitespace(str);
      const [stmt, rest] = parseStmt(str);
      stmt_list.push(stmt);
      str = rest;
    } catch(e) {
      str = s_org;
      break;
    }
  }
  // right associative connection via Seq
  let prg = 
    stmt_list.reduceRight<Expr>((acc, stmt) => fun("Seq", [stmt, acc]), mkConst("Term"));
  return [prg, str];
}


export const parsers = {
  "Statement": parseStmt,
  "Program": parseProgram
};