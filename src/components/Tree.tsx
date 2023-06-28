import { Calculus, ruleByName, applyRuleFull, Premise, Annotations, InferenceRule } from "../logic/inference/inference_rules";
import { parse } from "../logic/syntax/parser";
import { StringDispatchRenderer } from "../logic/syntax/renderer";
import { Expr, getVars } from "../logic/syntax/syntactic_logic";
import { Subst, applySubst } from "../logic/unification/unification";

export interface GenericTree<T> {
  conclusion: T;
  annotations: Annotations[];
  assumptions: GenericTree<T>[];
  rule?: string;
  open?: boolean;
};

export type Tree = GenericTree<Expr>;
export type StringTree = GenericTree<string>;

export function goal_tree(conclusion: Premise): Tree {
  return {
    conclusion: conclusion.value,
    assumptions: [],
    annotations: conclusion.annotations
  };
}

export type rule_selection = "all" | "applicable" | "unknown" | "calculus";

const debugRenderer = new StringDispatchRenderer();

export function applyNamedRule(calc: Calculus, name: string, goal: Expr, used_vars: Set<string>): [Premise[], Subst] {
  const rule = ruleByName(calc, name);
  if (!rule) {
    throw new Error(`Rule ${name} not found`);
  }
  const result = applyRuleFull(rule, goal, null, used_vars);
  if (!result) {
    throw new Error(`Rule ${name} did not apply. Goal: ${debugRenderer.render(goal)}, Conclusion: ${debugRenderer.render(rule.conclusion)}`);
  }
  const [premises, subst] = result;
  console.log("raw subst", subst);
  console.log("new premise", premises);
  const goal_vars = getVars(goal);
  // TODO: we need x for nested x in premises
  // TODO: alternative: applyRuleFull => fix premises

  // close subst recursively
  let subst_closed: Subst = subst;
  for (const v in subst) {
    subst_closed[v] = applySubst(subst_closed, subst[v]);
  }

  // TODO: why restrict here?
  const goal_subst: Subst = {};
  for (const v of goal_vars) {
    if (subst[v]) {
      goal_subst[v] = subst_closed[v];
    }
  }
  return [premises, goal_subst];
}

export function treeMap(tree: Tree, f: (expr: Expr) => Expr): Tree {
  return {
    ...tree,
    conclusion: f(tree.conclusion),
    assumptions: tree.assumptions.map(a => treeMap(a, f)),
  };
}

export function treeFold<T>(tree: Tree, f: (expr: Expr, assumptions: T[]) => T): T {
  return f(tree.conclusion, tree.assumptions.map(a => treeFold(a, f)));
}

// deep copy of tree
export function copyTree(tree: Tree): Tree {
  return {
    ...tree,
    conclusion: tree.conclusion,
    assumptions: tree.assumptions.map(a => copyTree(a)),
  };
}

export function isClosed(tree: Tree): boolean {
  return tree.rule !== undefined && tree.assumptions.every(a => isClosed(a));
}

export function stringTreeToTree(tree: StringTree): Tree {
  return {
    ...tree,
    conclusion: parse(tree.conclusion),
    assumptions: tree.assumptions.map(a => stringTreeToTree(a)),
  };
}

export function treeToStringTree(tree: Tree): StringTree {
  return {
    ...tree,
    conclusion: debugRenderer.render(tree.conclusion),
    assumptions: tree.assumptions.map(a => treeToStringTree(a)),
  };
}

export function ruleToTree(rule: InferenceRule): Tree {
  return {
    conclusion: rule.conclusion,
    assumptions: rule.premises.map(p => {
      const t = goal_tree(p);
      t.open = true;
      return t;
    }),
    annotations: [],
    rule: rule.name,
  };
}
