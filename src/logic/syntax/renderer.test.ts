import { describe, expect, it } from "@jest/globals";
import { AppDispatchRenderer, ConstDispatchRenderer, StringDispatchRenderer, renderNestedList } from "./renderer";
import { parse } from "./parser";

describe("listTest", () => {

  const app_renderer: AppDispatchRenderer<string> = {
    "fac": (_, args) => `${args[0]}!`,
    "Cons": ([f, renderer], _) => renderNestedList(f, "Cons", "Nil", renderer, ", ",
      (left, right) => left + " ++ " + right
      , "[", "]"),
  };

  const const_renderer: ConstDispatchRenderer<string> = {
    "Nil": "<>",
    "infty": "∞",
  };

  const list_renderer = new StringDispatchRenderer().registerAppDispatcher(app_renderer).registerConstDispatcher(const_renderer);

  it("should render a list", () => {
    expect(list_renderer.render(
      parse("Cons(1, Cons(2, Cons(3, Nil)))")
    )).toEqual("[1, 2, 3]");
  });

  it("should render a list with const and app", () => {
    expect(list_renderer.render(
      parse("Cons(1, Cons(infty, Cons(fac(5), Nil)))")
    )).toEqual("[1, ∞, 5!]");
  });

  it("empty list", () => {
    expect(list_renderer.render(
      parse("Nil")
    )).toEqual("<>");
  });

  it("render with var", () => {
    expect(list_renderer.render(
      parse("Cons(1, Cons(?x, Cons(3, Nil)))")
    )).toEqual("[1, ?x, 3]");
  });

  it("render var end", () => {
    expect(list_renderer.render(
      parse("Cons(1, Cons(2, Cons(3, ?x)))")
    )).toEqual("[1, 2, 3] ++ ?x");
  });

});
