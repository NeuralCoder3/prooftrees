import { Expr, mkApp, mkConst, mkVar } from "./syntactic_logic";


const ident_pattern = /([a-z0-9_A-ZΓ']+)/;
// f(a, ?x, 0) => App(Const("f"), [Const("a"), Var("x"), Const("0")])
function parseIdent(s: string): [string, string] {
  const match = ident_pattern.exec(s);
  if (match === null) {
    throw new Error("Expected identifier, got '" + s + "'");
  }
  return [match[0], s.slice(match[0].length)];
}
function parseAtom(s: string): [Expr, string] {
  let is_var = false;
  if (s[0] === "?") {
    s = s.slice(1);
    is_var = true;
  }
  const ident = parseIdent(s);
  const [name, rest] = ident;
  if (is_var) {
    return [mkVar(name), rest];
  } else {
    return [mkConst(name), rest];
  }
}
function parseExpr(s: string): [Expr, string] {
  const atom = parseAtom(s);
  const [expr, rest] = atom;
  if (rest === "" || rest[0] !== "(") {
    return [expr, rest];
  }
  const args = [];
  let rest2 = rest.slice(1);
  while (rest2[0] !== ")") {
    const [arg, rest3] = parseExpr(rest2);
    args.push(arg);
    rest2 = rest3;
    if (rest2[0] === ",") {
      rest2 = rest2.slice(1);
    }
  }
  rest2 = rest2.slice(1);
  return [mkApp(expr, args), rest2];
}
function prepareString(s: string): string {
  const s2 = s.replace(/\s/g, "");
  return s2;
}
export function parseOption(s: string): Expr | null {
  try {
    const [expr, rest] = parseExpr(prepareString(s));
    if (rest !== "") {
      return null;
    }
    return expr;
  } catch (e) {
    return null;
  }
}
export function parse(s: string): Expr {
  const [expr, rest] = parseExpr(prepareString(s));
  if (rest !== "") {
    throw new Error("Expected end of string, got '" + rest + "'");
  }
  return expr;
}

