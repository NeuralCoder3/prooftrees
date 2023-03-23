import { describe, expect, it } from "@jest/globals";
import { mkApp, mkConst, mkVar } from "./syntactic_logic";
import { parseOption, parse } from "./parser";

describe("parseResult", () => {
  it("Const", () => {
    expect(parseOption("a")).toEqual(mkConst("a"));
  });

  it("Var", () => {
    expect(parse("?a")).toEqual(mkVar("a"));
  });

  it("App", () => {
    expect(parse("f(a,?x,0)")).toEqual(
      mkApp(mkConst("f"), [mkConst("a"), mkVar("x"), mkConst("0")])
    );
  });

  it("App with whitespace", () => {
    expect(parse("f(a, ?x, 0)")).toEqual(
      mkApp(mkConst("f"), [mkConst("a"), mkVar("x"), mkConst("0")])
    );
  });

  it("empty app", () => {
    expect(parse("f()")).toEqual(mkApp(mkConst("f"), []));
  });

});
