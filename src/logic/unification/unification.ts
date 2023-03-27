import { Renderer } from "react-dom";
import { Expr, getVars, equalExpr, Var } from "../syntax/syntactic_logic";

export type Subst = { [key: string]: Expr };

// syntactic unification according to robinson's algorithm

export function unify(e1: Expr, e2: Expr, check_overlap = true): Subst | null {
  if (check_overlap) {
    const vars1 = getVars(e1);
    const vars2 = getVars(e2);
    // disjointness is not a problem but not intended in this application
    for (const v of vars1) {
      if (vars2.has(v)) {
        throw new Error("unification error: variables overlap");
      }
    }
  }
  return _unify(e1, e2);
}

export function _unify(e1: Expr, e2: Expr, mgu: Subst | null = {}): Subst | null {
  if (mgu === null) {
    return null;
  }
  if (equalExpr(e1, e2)) {
    return mgu;
  }
  if (e1.kind === "var") {
    return unifyVar(e1, e2, mgu);
  }
  if (e2.kind === "var") {
    return unifyVar(e2, e1, mgu);
  }
  if (e1.kind === "app" && e2.kind === "app") {
    const args1 = e1.args;
    const args2 = e2.args;
    if (args1.length !== args2.length) {
      return null;
    }
    const mgu1 = _unify(e1.callee, e2.callee, mgu);
    return args1.reduce((mgu_acc, arg, i) => _unify(arg, args2[i], mgu_acc), mgu1);
  }
  return null;
}

function unifyVar(v: Var, e: Expr, mgu: Subst): Subst | null {
  if (v.name in mgu) {
    return _unify(mgu[v.name], e, mgu);
  }
  if (e.kind === "var" && e.name in mgu) {
    return _unify(v, mgu[e.name], mgu);
  }
  if (getVars(e).has(v.name)) {
    return null;
  }
  return { ...mgu, [v.name]: e };
}

export function applySubst(mgu: Subst, e: Expr): Expr {
  if (e.kind === "var") {
    if (e.name in mgu) {
      return mgu[e.name];
    }
    return e;
  }
  if (e.kind === "app") {
    return {
      kind: "app",
      callee: applySubst(mgu, e.callee),
      args: e.args.map(arg => applySubst(mgu, arg))
    };
  }
  return e;
}

export function renderSubst(subst: Subst, renderer: Renderer<string>): string {
  return "[" + Object.keys(subst).map(k => `?${k} -> ${renderer.render(subst[k])}`).join(", ") + "]";
}
