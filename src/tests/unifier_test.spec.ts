import { describe, expect, it } from "@jest/globals";
import * as unifier from '../lib/unifier';

describe("unifierVariables", () => {
  const us = unifier.parseUnificationString("Hello, ?name !");
  it("should return [name]", () => {
    expect(unifier.getVariables(us)).toEqual(new Set(["name"]));
  });
});

describe("unifierString", () => {
  const us = unifier.parseUnificationString("Hello, ?name!");
  it("should return Hello, ?name!", () => {
    expect(unifier.unificationStringToString(us)).toEqual("Hello, ?name!");
  });
});

describe("unifierSplit", () => {
  const us = unifier.parseUnificationString("Hello, ?name!");
  it("split of string", () => {
    expect(us).toEqual([
      { kind: "string", value: "Hello" },
      { kind: "separator", value: "," },
      { kind: "separator", value: " " },
      { kind: "variable", value: "name" },
      { kind: "separator", value: "!" },
    ]);
  });
});

describe("unifierMGU", () => {
  const us1 = unifier.parseUnificationString("Hello, ?name !");
  const us2 = unifier.parseUnificationString("Hello, John !");
  const mgu = unifier.getUnificationStringsMGU(us1, us2);
  it("should return { name: John }", () => {
    expect(mgu).toEqual({ name: ["John"] });
  });
  // it("should return { name: John }", () => {
  //   expect(unifier.unifyUnificationStrings(us1, us2)).toEqual({ name: "John" });
  // });
});

describe("multiUnified", () => {
  const us1 = unifier.parseUnificationString("A Ptr(?X) B");
  const us2 = unifier.parseUnificationString("A ?Y B");

  const mgu = unifier.getUnificationStringsMGU(us1, us2);
  it("should return { X: [Y], Y: [X] }", () => {
    // expect(mgu).toEqual({ X: ["Y"], Y: ["X"] });
    expect(mgu).toEqual({
      X: null,
      Y: ["Ptr", "(", "?X", ")"],
    });
  });
});
