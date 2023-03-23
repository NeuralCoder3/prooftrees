import * as logic from './logic/syntactic_logic';
import { parse } from './logic/parser';
import { Subst, applySubst, unify } from './unification';
import assert from 'assert';
import { Renderer } from './logic/renderer';

export interface InferenceRule {
  conclusion: logic.Expr;
  premises: logic.Expr[];
  name?: string;
}

export interface StringRule {
  conclusion: string;
  premises: string[];
  name?: string;
}

export function convertStringRule(rule: StringRule): InferenceRule {
  return {
    conclusion: parse(rule.conclusion),
    premises: rule.premises.map(parse),
    name: rule.name,
  };
}

export type calculus = InferenceRule[];

export function premiseVariables(rule: InferenceRule): Set<string> {
  return rule.premises
    .map(premise => logic.getVars(premise))
    .reduce((acc, s) => new Set([...acc, ...s]), new Set());
}

// variables that are in the premises but not in the conclusion => get creative
export function getFreeVariables(inf: InferenceRule): Set<string> {
  const conclusionVariables = logic.getVars(inf.conclusion);
  return new Set([...premiseVariables(inf)].filter(x => !conclusionVariables.has(x)));
}

export function applyRuleFull(
  inf: InferenceRule,
  goal: logic.Expr,
  var_bindings: Subst | null = {} // null => ignore, else needs to bind all free variables
): [logic.Expr[], Subst] | null {
  let conclusion = inf.conclusion;
  let premises = inf.premises;
  // name inference rule apart from goal
  const goal_vars = logic.getVars(goal);
  const inf_vars = new Set([...logic.getVars(conclusion), ...premiseVariables(inf)]);
  const subst = logic.nameApart(inf_vars, goal_vars);
  conclusion = applySubst(subst, conclusion);
  premises = premises.map(premise => applySubst(subst, premise));

  if (var_bindings !== null) {
    const freeVariables = getFreeVariables({
      ...inf,
      conclusion,
      premises,
    });
    for (const freeVariable of freeVariables) {
      assert(freeVariable in var_bindings);
    }
    premises = premises.map(premise =>
      applySubst(var_bindings, premise)
    );
  }
  const mgu = unify(conclusion, goal);
  if (mgu === null) {
    return null;
  }
  const result = premises.map(premise => applySubst(mgu, premise));
  return [result, mgu];
}

export function applyRule(
  inf: InferenceRule,
  goal: logic.Expr,
  var_bindings: Subst | null = {}
): logic.Expr[] | null {
  const result = applyRuleFull(inf, goal, var_bindings);
  if (result === null) {
    return null;
  }
  return result[0];
}

export function ruleByName(calculus: calculus, name: string): InferenceRule | null {
  for (const rule of calculus) {
    if (rule.name === name) {
      return rule;
    }
  }
  return null;
}


export function ruleToString(rule: InferenceRule, renderer: Renderer<string>): string {
  const premises = rule.premises.map(premise => renderer.render(premise));
  const conclusion = renderer.render(rule.conclusion);
  const length = Math.max(Math.max(...premises.map(premise => premise.length)), conclusion.length);
  const name = rule.name ? rule.name : '';
  return premises.join('\n') + '\n' + '-'.repeat(length) + ' ' + name + '\n' + conclusion;
}
