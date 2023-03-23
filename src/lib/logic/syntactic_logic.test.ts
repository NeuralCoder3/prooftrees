import { describe, expect, it } from "@jest/globals";
import { getVars, mkApp, mkConst, mkVar } from "./syntactic_logic";

describe("CheckVars", () => {
  it("no vars", () => {
    expect(getVars(mkConst("a"))).toEqual(new Set());
  });

  it("one var", () => {
    expect(getVars(mkVar("a"))).toEqual(new Set(["a"]));
  });

  it("two vars", () => {
    expect(getVars(
      mkApp(mkConst("f"), [mkVar("a"), mkConst("b"), mkVar("c")])
    )).toEqual(new Set(["a", "c"]));
  });

  it("duplicate vars", () => {
    expect(getVars(
      mkApp(mkConst("f"), [mkVar("a"), mkConst("b"), mkVar("a")])
    )).toEqual(new Set(["a"]));
  });

});
