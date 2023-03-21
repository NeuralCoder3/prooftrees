// const greeting = getGreeting("John");
// console.log(greeting);

import { calculus as type_conv_rules, renderer as type_conv_app_renderer } from "./calculi/type_conversion";
import { calculus as color_rules } from "./calculi/color";
import { calculus as type_calculus, app_renderer as type_app_renderer, const_renderer as type_const_renderer } from "./calculi/static_semantics_expr";

import { ruleToString, calculus } from "./lib/inference_rules";
import { parse } from "./lib/logic/parser";
import { DispatchRenderer, LiteralStringRenderer, StringDispatchRenderer } from "./lib/logic/renderer";

console.log("Color rules:");

const color_renderer = new LiteralStringRenderer();
for (const rule of color_rules) {
  console.log(ruleToString(rule, color_renderer));
  console.log();
}

console.log();
console.log();
console.log("Type conversion rules:");
console.log();

const type_conv_renderer = new StringDispatchRenderer().registerAppDispatcher(type_conv_app_renderer);
for (const rule of type_conv_rules) {
  console.log(ruleToString(rule, type_conv_renderer));
  console.log();
}

console.log();
console.log();
console.log("Static typing rules:");
console.log();

const type_renderer = new StringDispatchRenderer().registerAppDispatcher(type_app_renderer).registerConstDispatcher(type_const_renderer);
for (const rule of type_calculus) {
  console.log(ruleToString(rule, type_renderer));
  console.log();
}

