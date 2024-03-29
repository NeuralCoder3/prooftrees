import assert from "assert";
import { Subst } from "../unification/unification";

// recursive closed type
// μ X. (1×S) + (2×X×L X) + (3×S)
// data Expr = Const of String | App of (Expr, Expr list) | Var of String
export type Expr = Const | App | Var;

export interface Const {
  kind: "const";
  value: string;
}

export interface App {
  kind: "app";
  callee: Expr;
  args: Expr[];
}

export interface Var {
  kind: "var";
  value: string;
}

export function mkConst(value: string): Const {
  return { kind: "const", value };
}
export function mkApp(callee: Expr, args: Expr[]): App {
  return { kind: "app", callee: callee, args: args };
}
export function mkVar(name: string): Var {
  return { kind: "var", value: name };
}

export function fun(name: string, args: Expr[]): Expr {
  return mkApp(mkConst(name), args);
}

export function getVars(e: Expr): Set<string> {
  switch (e.kind) {
    case "const":
      return new Set();
    case "app":
      return new Set(
        e.args
          .map(getVars)
          .reduce((acc, s) => new Set([...acc, ...s]), new Set())
      );
    case "var":
      return new Set([e.value]);
  }
}

export interface ConstantSymbols {
  arity: number;
  name: string;
}

export function getConstantSymbols(e: Expr): Set<ConstantSymbols> {
  switch (e.kind) {
    case "const":
      return new Set([{ arity: 0, name: e.value }]);
    case "app":
      const arg_symbols = e.args.map(getConstantSymbols).reduce(
        (acc, s) => new Set([...acc, ...s]),
        new Set()
      );
      if (e.callee.kind === "const") {
        return new Set([
          ...arg_symbols,
          { arity: e.args.length, name: e.callee.value }
        ]);
      } else {
        return new Set([...arg_symbols, ...getConstantSymbols(e.callee)]);
      }
    case "var":
      return new Set();
  }
}

export function replaceInExpr(e: Expr, src: Expr, dst: Expr): Expr {
  if (equalExpr(e, src)) {
    return dst;
  }
  switch (e.kind) {
    case "const":
      return e;
    case "app":
      return mkApp(
        replaceInExpr(e.callee, src, dst),
        e.args.map(a => replaceInExpr(a, src, dst))
      );
    case "var":
      return e;
  }
}

export function equalExpr(e1: Expr, e2: Expr): boolean {
  if (e1.kind !== e2.kind) {
    return false;
  }
  switch (e1.kind) {
    case "const":
      assert(e2.kind === "const");
      return e1.value === e2.value;
    case "app":
      assert(e2.kind === "app");
      return (
        equalExpr(e1.callee, e2.callee) &&
        e1.args.length === e2.args.length &&
        e1.args.every((a, i) => equalExpr(a, e2.args[i]))
      );
    case "var":
      assert(e2.kind === "var");
      return e1.value === e2.value;
  }
}

export function freshName(name: string, used: Set<string>): string {
  // abc -> abc0
  // abc0 -> abc1
  // abc42 -> abc43
  // ...
  if (!used.has(name)) {
    return name;
  }
  const suffix = name.match(/(\d+)$/);
  let n = 0;
  let new_name = name;
  if (suffix) {
    n = parseInt(suffix[1]);
    new_name = name.slice(0, -suffix[1].length);
  }
  while (used.has(new_name + n)) {
    n += 1;
  }
  return new_name + n;
}

export function nameApart(variables: Set<string>, vars: Set<string>): Subst {
  const subst: Subst = {};
  const used_vars = new Set([...vars]);
  for (const v of variables) {
    const new_name = freshName(v, used_vars);
    subst[v] = mkVar(new_name);
    used_vars.add(new_name);
  }
  return subst;
}


// export type Normalizer<T> = (e: T) => T;

// App(Const name, ...) => apply
// or if * => always
export type Normalizer = (e: Expr) => Expr;
export type Normalizers = { [key: string]: Normalizer };
