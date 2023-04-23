import { describe, expect, it } from "@jest/globals";
import { applyRule, applyRuleFull, convertStringRule, ruleByName } from "./inference_rules";
import { calculus as type_conv_calculus } from "../calculi/type_conversion";
import { calculus as color_calculus } from "../calculi/color";
import { calculus as expr_type_calculus, app_renderer as expr_type_app_renderer, const_renderer as expr_type_const_renderer } from "../calculi/static_semantics_expr";
import { parse } from "../syntax/parser";

describe("colorCalculus", () => {
  it("blueAxiom", () => {
    expect(
      applyRule(ruleByName(color_calculus, "Blue")!, parse("Blue")))
      .toEqual([]);
  });

  it("green1", () => {
    expect(
      applyRule(ruleByName(color_calculus, "Green2")!, parse("Green"))?.map(p => p.value))
      .toEqual([parse("Yellow"), parse("Blue")]);
  });

  it("complete_examples", () => {
    const goal = parse("Brown");
    const tree = applyRule(ruleByName(color_calculus, "Brown1")!, goal);
    expect(tree?.map(p => p.value)).toEqual([parse("Red"), parse("Green")]);
    const [g1, g2] = tree!;
    const tree1 = applyRule(ruleByName(color_calculus, "Red")!, g1.value);
    expect(tree1?.map(p => p.value)).toEqual([]);
    const tree2 = applyRule(ruleByName(color_calculus, "Green2")!, g2.value);
    expect(tree2?.map(p => p.value)).toEqual([parse("Yellow"), parse("Blue")]);
    const [g2_1, g2_2] = tree2!;
    const tree2_1 = applyRule(ruleByName(color_calculus, "Yellow")!, g2_1.value);
    expect(tree2_1?.map(p => p.value)).toEqual([]);
    const tree2_2 = applyRule(ruleByName(color_calculus, "Blue")!, g2_2.value);
    expect(tree2_2?.map(p => p.value)).toEqual([]);
  });
});

describe("unitTest", () => {
  it("unique_naming", () => {
    const goal = parse("f(?i, 3)");
    const inf = convertStringRule({
      conclusion: "f(2, ?i0)",
      premises: ["equal(?i0, 1)"]
    });
    const res = applyRuleFull(inf, goal);
    expect(res).not.toBeNull();
    const [premises, subst] = res!;
    expect(premises.map(p => p.value)).toEqual([parse("equal(3,1)")]);
    expect(subst).toEqual({
      "i": parse("2"),
      "i0": parse("3"),
    });
  });

  it("conflict_naming", () => {
    const goal = parse("f(?i, 3)");
    const inf = convertStringRule({
      conclusion: "f(2, ?i)",
      premises: ["equal(?i, 1)"]
    });
    const res = applyRuleFull(inf, goal);
    expect(res).not.toBeNull();
    const [premises, subst] = res!;
    expect(premises.map(p => p.value)).toEqual([parse("equal(3,1)")]);
    expect(subst).toEqual({
      "i": parse("2"),
      "i0": parse("3"),
    });
  });
});


describe("exprTypingRules", () => {
  // Example 6.6.8 
  // https://compilers.cs.uni-saarland.de/prog2pretext/main/webapp/sec-c0-type.html#example-23
  // see index for pretty printed interactive version

  it("example6.6.8", () => {
    const expr = "BinOp(Minus, BinOp(Plus,Indir(x),y), 1)";
    const gamma = "Γ";
    const goal = parse(`typed(${gamma}, ${expr}, ?type)`);

    // with bound
    const tree_bound = applyRule(ruleByName(expr_type_calculus, "TArith")!, goal, { "i1": parse("int"), "i2": parse("int") });
    expect(tree_bound?.map(p => p.value)).toEqual([
      parse(`typed(${gamma}, BinOp(Plus,Indir(x),y), int)`),
      parse(`typed(${gamma}, 1, int)`),
      parse("is_int(int)"),
      parse("is_int(int)"),
      parse("is_arith_op(Minus)")
    ]);

    // without pre-bound
    // the underlying mgu determines type = int
    const res = applyRuleFull(ruleByName(expr_type_calculus, "TArith")!, goal, null);
    expect(res).not.toBeNull();
    const [tree, subst] = res!;
    expect(subst).toEqual({
      "Gamma": parse(gamma),
      "r": parse("Minus"),
      "e1": parse("BinOp(Plus,Indir(x),y)"),
      "e2": parse("1"),
      // additional information previously unknown
      "type": parse("int"),
    });
    expect(tree?.map(p => p.value)).toEqual([
      parse(`typed(${gamma}, BinOp(Plus,Indir(x),y), ?i1)`),
      parse(`typed(${gamma}, 1, ?i2)`),
      parse("is_int(?i1)"),
      parse("is_int(?i2)"),
      parse("is_arith_op(Minus)")
    ]);
    const [g1, g2] = tree;

    const tree2 = applyRule(ruleByName(expr_type_calculus, "TConst")!, g2.value);
    expect(tree2?.map(p => p.value)).toEqual([
      parse(`is_bound(1)`),
    ]);

    // ...
  });
});
