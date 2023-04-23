import assert from 'assert';
import { parse } from '../syntax/parser';
import { Renderer } from '../syntax/renderer';
import * as logic from '../syntax/syntactic_logic';
import { Subst, applySubst, unify } from '../unification/unification';

export type Annotations = "side-condition";

export type Premise = {
  value: logic.Expr;
  annotations: Annotations[];
};

export interface InferenceRule {
  conclusion: logic.Expr;
  premises: Premise[];
  name?: string;
}

export interface StringRule {
  conclusion: string;
  //         name,     optionally with annotations
  premises: (string | [string, string])[];
  name?: string;
}

export function convertStringRule(rule: StringRule): InferenceRule {
  const premises = rule.premises.map(premise => {
    if (typeof premise === 'string') {
      return { value: parse(premise), annotations: [] };
    } else {
      const [value, annotations] = premise;
      return { value: parse(value), annotations: annotations.split(',') as Annotations[] };
    }
  });
  return {
    conclusion: parse(rule.conclusion),
    premises: premises,
    name: rule.name,
  };
}

export interface calculus {
  rules: InferenceRule[];
  name: string;
  // renderers?: Renderer;
};

export function valuePremise(v: logic.Expr): Premise {
  return { value: v, annotations: [] };
}

export function combineCalculus(calculi: calculus[], new_name: string | null = null, rename_rules = false): calculus {
  return {
    name: new_name || calculi.map(c => c.name).join(' + '),
    rules: calculi.map(c => {
      if (rename_rules) {
        return c.rules.map(r => ({ ...r, name: `${c.name}::${r.name}` }));
      } else {
        return c.rules;
      }
    }).reduce((acc, x) => [...acc, ...x], []),
  };
}

export function mkCalculus(name: string, rules: InferenceRule[]): calculus {
  return { name, rules };
}

export function premiseVariables(rule: InferenceRule): Set<string> {
  return rule.premises
    .map(premise => logic.getVars(premise.value))
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
): [Premise[], Subst] | null {
  let conclusion = inf.conclusion;
  let premises = inf.premises;
  // name inference rule apart from goal
  const goal_vars = logic.getVars(goal);
  const inf_vars = new Set([...logic.getVars(conclusion), ...premiseVariables(inf)]);
  const subst = logic.nameApart(inf_vars, goal_vars);
  conclusion = applySubst(subst, conclusion);
  premises = premises.map(premise => {
    return {
      annotations: [...premise.annotations],
      value: applySubst(subst, premise.value),
    };
  });

  if (var_bindings !== null) {
    const freeVariables = getFreeVariables({
      ...inf,
      conclusion,
      premises,
    });
    for (const freeVariable of freeVariables) {
      assert(freeVariable in var_bindings);
    }
    premises = premises.map(premise => {
      return {
        ...premise,
        value: applySubst(var_bindings, premise.value),
      };
    });
  }
  const mgu = unify(conclusion, goal);
  if (mgu === null) {
    return null;
  }
  const result = premises.map(premise => {
    return {
      ...premise,
      value: applySubst(mgu, premise.value),
    }
  });
  return [result, mgu];
}

export function applyRule(
  inf: InferenceRule,
  goal: logic.Expr,
  var_bindings: Subst | null = {}
): Premise[] | null {
  const result = applyRuleFull(inf, goal, var_bindings);
  if (result === null) {
    return null;
  }
  return result[0];
}

export function ruleByName(calculus: calculus, name: string): InferenceRule | null {
  for (const rule of calculus.rules) {
    if (rule.name === name) {
      return rule;
    }
  }
  return null;
}


export function ruleToString(rule: InferenceRule, renderer: Renderer<string>): string {
  const premises = rule.premises.map(premise => renderer.render(premise.value));
  const conclusion = renderer.render(rule.conclusion);
  const length = Math.max(Math.max(...premises.map(premise => premise.length)), conclusion.length);
  const name = rule.name ? rule.name : '';
  return premises.join('\n') + '\n' + '-'.repeat(length) + ' ' + name + '\n' + conclusion;
}


function rootFunctionName(expr: logic.Expr): string | null {
  if (expr.kind === "app" && expr.callee.kind === "const") {
    return expr.callee.value;
  }
  return null;
}

export function associatedFunctions(calc: calculus): string[] {
  const result = [];
  for (const rule of calc.rules) {
    const root = rootFunctionName(rule.conclusion);
    if (root !== null) {
      result.push(root);
    }
  }
  return [...new Set(result)];
}
