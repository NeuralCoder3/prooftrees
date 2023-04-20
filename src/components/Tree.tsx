import { calculus, ruleByName, applyRuleFull } from "../logic/inference/inference_rules";
import { parse } from "../logic/syntax/parser";
import { StringDispatchRenderer } from "../logic/syntax/renderer";
import { Expr, getVars } from "../logic/syntax/syntactic_logic";
import { Subst, applySubst } from "../logic/unification/unification";

export interface GenericTree<T> {
  conclusion: T;
  assumptions: GenericTree<T>[];
  rule?: string;
};

export type Tree = GenericTree<Expr>;
export type StringTree = GenericTree<string>;

export function goal_tree(conclusion: Expr): Tree {
  return {
    conclusion: conclusion,
    assumptions: [],
  };
}

export type rule_selection = "all" | "applicable" | "unknown" | "calculus";

const debugRenderer = new StringDispatchRenderer();

export function applyNamedRule(calc: calculus, name: string, goal: Expr): [Expr[], Subst] {
  const rule = ruleByName(calc, name);
  if (!rule) {
    throw new Error(`Rule ${name} not found`);
  }
  const result = applyRuleFull(rule, goal, null);
  if (!result) {
    throw new Error(`Rule ${name} did not apply. Goal: ${debugRenderer.render(goal)}, Conclusion: ${debugRenderer.render(rule.conclusion)}`);
  }
  const [premises, subst] = result;
  const goal_vars = getVars(goal);
  const goal_subst: Subst = {};
  for (const v of goal_vars) {
    if (subst[v]) {
      goal_subst[v] = subst[v];
    }
  }
  return [premises, goal_subst];
}

export function applyTreeSubst(tree: Tree, subst: Subst): Tree {
  return {
    conclusion: applySubst(subst, tree.conclusion),
    assumptions: tree.assumptions.map(a => applyTreeSubst(a, subst)),
    rule: tree.rule,
  };
}

// deep copy of tree
export function copyTree(tree: Tree): Tree {
  return {
    conclusion: tree.conclusion,
    assumptions: tree.assumptions.map(a => copyTree(a)),
    rule: tree.rule,
  };
}

export function isClosed(tree: Tree): boolean {
  return tree.rule !== undefined && tree.assumptions.every(a => isClosed(a));
}

export function stringTreeToTree(tree: StringTree): Tree {
  return {
    conclusion: parse(tree.conclusion),
    assumptions: tree.assumptions.map(a => stringTreeToTree(a)),
    rule: tree.rule,
  };
}

export function treeToStringTree(tree: Tree): StringTree {
  return {
    conclusion: debugRenderer.render(tree.conclusion),
    assumptions: tree.assumptions.map(a => treeToStringTree(a)),
    rule: tree.rule,
  };
}
