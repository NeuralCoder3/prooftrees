import { describe, expect, it } from "@jest/globals";
import { Subst, unify } from "./unification";
import { parse } from "../syntax/parser";

function unifyString(s1: string, s2: string): Subst | null {
  const e1 = parse(s1);
  const e2 = parse(s2);
  return unify(e1, e2);
}

describe("unifyExpr", () => {
  it("unifyVars", () => {
    expect(unifyString("f(a,?x,0)", "f(a,?y,0)")).toEqual({ x: parse("?y") });
  });

  it("unifyConst", () => {
    expect(unifyString("f(?x,b,0)", "f(a,?y,0)")).toEqual({
      x: parse("a"),
      y: parse("b"),
    });
  });

  it("unifyNested", () => {
    expect(unifyString("f(?x)", "f(g(a,?y,b))")).toEqual({
      x: parse("g(a,?y,b)"),
    });
  });

  it("unifyDisjointOverlap", () => {
    expect(unifyString("f(?x,b,?x)", "f(a,?y,0)")).toEqual(null);
  });

  it("unifyOverlap", () => {
    expect(unifyString("f(?x,b,?x)", "f(a,b,?y)")).toEqual({
      x: parse("a"),
      y: parse("a"),
    });
  });
});
