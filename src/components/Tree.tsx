import { calculus, ruleByName, applyRuleFull } from "../logic/inference/inference_rules";
import { StringDispatchRenderer } from "../logic/syntax/renderer";
import { Expr, getVars } from "../logic/syntax/syntactic_logic";
import { Subst } from "../logic/unification/unification";

export interface Tree {
  conclusion: string;
  assumptions: Tree[];
  rule?: string;
};

export function goal_tree(conclusion: string): Tree {
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
