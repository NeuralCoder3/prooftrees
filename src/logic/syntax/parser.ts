import { Expr, mkApp, mkConst, mkVar } from "./syntactic_logic";

// Note: we operate on strings instead of tokens due to modularity

export function expectToken(s: string, token: string): string {
  if (s.startsWith(token)) {
    return s.slice(token.length);
  }
  throw new Error("Expected token '" + token + "', got '" + s + "'");
}

export function parseWhitespace(s:string, optional:boolean = true): string {
  let i = 0;
  while (i < s.length && (s[i] === " " || s[i] === "\t" || s[i] === "\n" || s[i] === "\r")) {
    i++;
  }
  if (i === 0 && !optional) {
    throw new Error("Expected whitespace, got '" + s + "'");
  }
  return s.slice(i);
}

export function parseLeftAssoc(start: Expr|null, s:string, baseParser:(s:string) => [Expr, string], ops: [string, string][]): [Expr, string] {
  let str = s;
  let expr;
  if (start === null) {
    let [expr2, rest] = baseParser(str);
    expr = expr2;
    str = rest;
  } else {
    expr = start;
  }
  while (ops.some(([op, _]) => str.startsWith(op))) {
    const str_cpy = str;
    const [op, const_name] = ops.find(([op, _]) => str_cpy.startsWith(op))!;
    str = str.slice(op.length);
    str = parseWhitespace(str);
    let [expr2, rest2] = baseParser(str);
    expr = mkApp(mkConst("BinOp"), [mkConst(const_name),expr, expr2]);
    str = rest2;
    str = parseWhitespace(str);
  }
  return [expr, str];
}


const ident_pattern = /([a-z0-9_A-ZΓ']+)/;
// const ident_pattern = /([a-z0-9_A-ZΓ'$]+)/;
// export const ident_pattern = /([^ \t\n\r\(\)\s,]+)/;
// f(a, ?x, 0) => App(Const("f"), [Const("a"), Var("x"), Const("0")])
export function parseIdent(s: string): [string, string] {
  const match = ident_pattern.exec(s);
  if (match === null) {
    throw new Error("Expected identifier, got '" + s + "'");
  }
  return [match[0], s.slice(match[0].length)];
}
export function parseVar(s: string): [Expr, string] | null {
  if (s[0] !== "?") {
    return null;
    // throw new Error("Expected variable, got '" + s + "'");
  }
  const ident = parseIdent(s.slice(1));
  const [name, rest] = ident;
  return [mkVar(name), rest];
}
export function parseAtom(s: string): [Expr, string] {
  if (s[0] === "?") {
    return parseVar(s)!;
  }
  const ident = parseIdent(s);
  const [name, rest] = ident;
  return [mkConst(name), rest];
}
export function parseRawExpr(s: string): [Expr, string] {
  const atom = parseAtom(s);
  const [expr, rest] = atom;
  if (rest === "" || rest[0] !== "(") {
    return [expr, rest];
  }
  const args = [];
  let rest2 = rest.slice(1);
  while (rest2[0] !== ")") {
    const [arg, rest3] = parseRawExpr(rest2);
    args.push(arg);
    rest2 = rest3;
    if (rest2[0] === ",") {
      rest2 = rest2.slice(1);
    }
  }
  rest2 = rest2.slice(1);
  return [mkApp(expr, args), rest2];
}
export function prepareString(s: string): string {
  const s2 = s.replace(/\s/g, "");
  return s2;
}
export function parseOption(s: string): Expr | null {
  try {
    const [expr, rest] = parseRawExpr(prepareString(s));
    if (rest !== "") {
      return null;
    }
    return expr;
  } catch (e) {
    return null;
  }
}
export function parse(s: string): Expr {
  const [expr, rest] = parseRawExpr(prepareString(s));
  if (rest !== "") {
    throw new Error("Expected end of string, got '" + rest + "'");
  }
  return expr;
}


