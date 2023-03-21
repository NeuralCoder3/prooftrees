import * as color from "./calculi/color";
import * as type_conversion from "./calculi/type_conversion";
import * as expr_ty from "./calculi/static_semantics_expr";
import * as stmt_ty from "./calculi/static_semantics_stmt";
import * as hoare from "./calculi/hoare";

import { ruleToString, calculus, ruleByName, applyRuleFull } from "./lib/inference_rules";
import { parse } from "./lib/logic/parser";
import { StringDispatchRenderer } from "./lib/logic/renderer";
import { Subst, renderSubst } from "./lib/unification";
import { Expr, getVars } from "./lib/logic/syntactic_logic";

function applyNamedRule(calc: calculus, name: string, goal: Expr): [Expr[], Subst] {
  const rule = ruleByName(calc, name);
  if (!rule) {
    throw new Error(`Rule ${name} not found`);
  }
  const result = applyRuleFull(rule, goal, null);
  if (!result) {
    throw new Error(`Rule ${name} did not apply`);
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

function step(goal: Expr, name: string): Expr[] {
  console.log(`Goal: ${type_renderer.render(goal)}`);
  console.log(`Rule: ${name}`)
  const [tree, tree_subst] = applyNamedRule(expr_ty.calculus, name, goal);
  console.log(`Unify: ` + renderSubst(tree_subst, type_renderer));
  console.log(`Premises:`);
  tree.forEach(t => console.log(`  ${type_renderer.render(t)}`));
  console.log("");
  return tree;
}





console.log("Color rules:");

const color_renderer = new StringDispatchRenderer();
for (const rule of color.calculus) {
  console.log(ruleToString(rule, color_renderer));
  console.log();
}

console.log();
console.log();
console.log("Type conversion rules:");
console.log();

const type_conv_renderer = new StringDispatchRenderer().registerAppDispatcher(type_conversion.renderer);
for (const rule of type_conversion.calculus) {
  console.log(ruleToString(rule, type_conv_renderer));
  console.log();
}

console.log();
console.log();
console.log("Static typing rules:");
console.log();

const type_renderer = new StringDispatchRenderer().registerAppDispatcher(expr_ty.app_renderer).registerConstDispatcher(expr_ty.const_renderer);
for (const rule of expr_ty.calculus) {
  console.log(ruleToString(rule, type_renderer));
  console.log();
}


console.log();
console.log();
console.log("Static typing example:");
console.log();


// https://compilers.cs.uni-saarland.de/prog2pretext/main/webapp/sec-c0-type.html#example-23
const expr = "BinOp(Minus, BinOp(Plus,Indir(x),y), 1)";
const gamma = "Γ";
const goal = parse(`typed(${gamma}, ${expr}, ?type)`);

const tree = step(goal, "TArith");
const goal1 = tree[0]; // *x+y
const goal2 = tree[1]; // 1

const tree2 = step(goal2, "TConst");

const tree1 = step(goal1, "TArith");
const goal1_1 = tree1[0]; // *x
const goal1_2 = tree1[1]; // y

const tree1_1 = step(goal1_1, "TIndir");
const goal1_1_1 = tree1_1[0]; // x

const tree1_1_1 = step(goal1_1_1, "TVar");



// Print hoare

console.log();
console.log();
console.log("Hoare rules:");
console.log();

const hoare_renderer = new StringDispatchRenderer()
  .registerAppDispatcher(expr_ty.app_renderer).registerConstDispatcher(expr_ty.const_renderer)
  .registerAppDispatcher(stmt_ty.app_renderer).registerConstDispatcher(stmt_ty.const_renderer)
  .registerAppDispatcher(hoare.app_renderer).registerConstDispatcher(hoare.const_renderer);
for (const rule of hoare.calculus) {
  console.log(ruleToString(rule, hoare_renderer));
  console.log();
}
