import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { expectToken, parseAtom, parseIdent, parseLeftAssoc, parseWhitespace } from '../syntax/parser';
import { AppDispatchRenderer, AppRenderer, ConstDispatchRenderer } from '../syntax/renderer';
import { Expr, mkApp, mkConst, mkVar } from '../syntax/syntactic_logic';
import { parseType, renderer as type_app_renderer } from './type_conversion';

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
    (f.args[0].value === "Mul" || f.args[0].value === "Div" ||
      f.args[0].value === "Mult")) {
    // if e1 is a binop with a plus operation
    const e1 = f.args[1];
    if(e1.kind === "app" &&
      e1.callee.kind === "const" &&
      e1.callee.value === "BinOp" &&
      e1.args[0].kind === "const" &&
      (e1.args[0].value === "Add" || e1.args[0].value === "Sub" ||
        e1.args[0].value === "Plus" || e1.args[0].value === "Minus")) {
      e1_str = `(${e1_str})`;
    }
    // same for e2
    const e2 = f.args[2];
    if(e2.kind === "app" &&
      e2.callee.kind === "const" &&
      e2.callee.value === "BinOp" &&
      e2.args[0].kind === "const" &&
      (e2.args[0].value === "Add" || e2.args[0].value === "Sub" || 
        e2.args[0].value === "Plus" || e2.args[0].value === "Minus")) {
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
  // "UnOp": (_, args) => `${args[0]} ${args[1]}`,
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
  "Lt": "<",
  "Gt": ">",
  "Leq": "≤",
  "Geq": "≥",
  "Div": "/",
  "Mul": "*",
  "Mult": "*",
  "Add": "+",
  "Sub": "-",
  // "And": "∧",
  "And": "&&",

  "Not": "!",
  "Addr": "&",
  "Indir": "*",
};


/*

bool_expr = 
    arith_expr == arith_expr
  | arith_expr != arith_expr
  | arith_expr <= arith_expr
  | arith_expr <  arith_expr
  | arith_expr >= arith_expr
  | arith_expr >  arith_expr
  | bool_expr  /\ arith_expr // implement via chain
  | bool_expr  \/ arith_expr
  | arith_expr

arith_expr = 
    arith_expr + prod_expr
  | arith_expr - prod_expr
  | prod_expr

prod_expr = 
    prod_expr * factor_expr
  | prod_expr / factor_expr
  | factor_expr

factor_expr = 
    number
  | var
  | !factor_expr
  | -factor_expr
  | &factor_expr
  | *factor_expr
  | (bool_expr)

// expr := expr2 == expr2 | expr2 != expr2 | expr2 < expr2 | expr2 <= expr2 | expr2 > expr2 | expr2 >= expr2 | expr2 + expr2 | expr2 - expr2 | expr2 * expr2 | expr2 / expr2 | expr2 && expr2 | expr2 || expr2 | !expr2 | (expr2) | var | const
*/

export function parseExpr(s: string): [Expr, string] {
  return parseBoolExpr(s);
}

function parseBoolExpr(s: string): [Expr, string] {
  let str = s;
  str = parseWhitespace(str);

  let [expr1, rest] = parseArithExpr(str);
  str = rest;
  str = parseWhitespace(str);
  const binops = [
    ["==", "Equal"], 
    ["!=", "UnEqual"], 
    ["<=", "LessEqual"], 
    ["<", "Less"], 
    [">=", "GreaterEqual"], 
    [">", "Greater"]
  ];
  for (let [op, const_name] of binops) {
    if (str.startsWith(op)) {
      str = str.slice(op.length);
      str = parseWhitespace(str);
      let [expr2, rest2] = parseArithExpr(str);
      const expr = mkApp(mkConst("BinOp"), [mkConst(const_name), expr1, expr2]);
      return [expr, rest2];
    }
  }

  const chain_ops : [string,string][] = [
    ["&&", "And"],
    ["||", "Or"],
    ["/\\", "And"],
  ];
  return parseLeftAssoc(expr1, str, parseArithExpr, chain_ops);
}

function parseArithExpr(s: string): [Expr, string] {
  let str = s;
  str = parseWhitespace(str);

  const binops : [string,string][] = [
    ["+", "Plus"], 
    ["-", "Minus"]
  ];
  return parseLeftAssoc(null, str, parseProdExpr, binops);
}

function parseProdExpr(s: string): [Expr, string] {
  let str = s;
  str = parseWhitespace(str);

  const binops : [string,string][] = [
    ["*", "Mul"],
    ["/", "Div"]
  ];
  return parseLeftAssoc(null, str, parseFactorExpr, binops);
}

function parseFactorExpr(s: string): [Expr, string] {
  let str = s;
  str = parseWhitespace(str);

  const unops = [
    ["!", "Not"],
    ["-", "Neg"],
    ["&", "Addr"],
    ["*", "Indir"]
  ];
  for (let [op, const_name] of unops) {
    if (str.startsWith(op)) {
      str = str.slice(op.length);
      str = parseWhitespace(str);
      let [expr, rest] = parseFactorExpr(str);
      return [mkApp(mkConst("UnaryOp"), [mkConst(const_name), expr]), rest];
    }
  }
  if (str[0] === "(") {
    str = str.slice(1);
    str = parseWhitespace(str);
    let [expr, rest] = parseBoolExpr(str);
    str = rest;
    str = parseWhitespace(str);
    str = expectToken(str, ")");
    return [expr, str];
  }

  // numbers and constants
  const [ident, rest] = parseIdent(str);
  // if all digits => Const(ident)
  if(ident.match(/^\d+$/)) {
    return [mkApp(mkConst("Const"), [mkConst(ident)]), rest];
  }
  return [mkConst(ident), rest];
}


function parseTypedExpr(s: string): [Expr, string] {
  let str = s;
  str = parseWhitespace(str);
  const [gamma, rest] = parseTypeEnv(str);
  str = rest;
  str = parseWhitespace(str);
  str = expectToken(str, "|-");
  str = parseWhitespace(str);
  const [expr, rest2] = parseExpr(str); 
  str = rest2;
  str = parseWhitespace(str);
  str = expectToken(str, ":");
  str = parseWhitespace(str);
  const [t, rest3] = parseType(str);
  str = rest3;
  return [mkApp(mkConst("typed"), [gamma, expr, t]), str];
}

function parseTypeEnv(s: string): [Expr, string] {
  let str = s;
  str = parseWhitespace(str);
  str = expectToken(str, "{");
  str = parseWhitespace(str);

  let mappings : [Expr, Expr][] = [];
  while(true) {
    // ident : type
    let s_org = str;
    try {
      const [ident, rest] = parseAtom(str);
      str = rest;
      str = parseWhitespace(str);
      str = expectToken(str, ":");
      str = parseWhitespace(str);
      const [t, rest2] = parseType(str);
      str = rest2;
      str = parseWhitespace(str);
      mappings.push([ident, t]);
    }
    catch(e) {
      str = s_org;
      break;
    }
  }

  str = parseWhitespace(str);
  str = expectToken(str, "}");

  // transform to Extend(type, name, gamma') 
  // with innermost being emptyEnv
  return [
    mappings.reduceRight<Expr>(
      (acc, [name, t], _1, _2) => mkApp(mkConst("Extend"), [t, name, acc]), 
      mkConst("emptyEnv")
    ), str];
}

// @ts-ignore
// window.parseExpr = parseExpr;


export const parsers = {
  "Expression": parseExpr,
  "Typed Expression": parseTypedExpr,
};