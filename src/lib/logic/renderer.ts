import { App, Const, Expr, Var } from "./syntactic_logic";

export abstract class Renderer<T> {
  abstract render(e: Expr): T;
}

export type ConstDispatchRenderer<T> = { [key: string]: T };
export type AppRenderer<T> = (f: [App, Renderer<T>], args: T[]) => T;
export type AppDispatchRenderer<T> = { [key: string]: AppRenderer<T> };

export class DispatchRenderer<T> extends Renderer<T> {

  private const_dispatch: ConstDispatchRenderer<T> = {};
  private app_dispatch: AppDispatchRenderer<T> = {};

  constructor(
    private default_const: (c: Const) => T,
    private default_app: AppRenderer<T>,
    private higher_order_function_handler: (f: T, args: T[]) => T,
    private var_handler: (v: Var) => T,
  ) {
    super();
  }

  registerConst(c: string, f: T): DispatchRenderer<T> {
    this.const_dispatch[c] = f;
    return this;
  }

  registerApp(f: string, g: AppRenderer<T>): DispatchRenderer<T> {
    this.app_dispatch[f] = g;
    return this;
  }

  registerConstDispatcher(d: ConstDispatchRenderer<T>): DispatchRenderer<T> {
    for (const k in d) {
      this.registerConst(k, d[k]);
    }
    return this;
  }

  registerAppDispatcher(d: AppDispatchRenderer<T>): DispatchRenderer<T> {
    for (const k in d) {
      this.registerApp(k, d[k]);
    }
    return this;
  }

  renderConst(c: Const): T {
    return this.const_dispatch[c.value] ? this.const_dispatch[c.value] : this.default_const(c);
  }

  renderApp(f: App, args: T[]): T {
    if (f.callee.kind === "const") {
      const name = f.callee.value;
      const dispatcher = this.app_dispatch[name] ? this.app_dispatch[name] : this.default_app;
      return dispatcher([f, this], args);
    } else {
      return this.higher_order_function_handler(this.render(f.callee), f.args.map(this.render.bind(this)));
    }
  }

  render(e: Expr): T {
    switch (e.kind) {
      case "const":
        return this.renderConst(e);
      case "app":
        return this.renderApp(e, e.args.map(this.render.bind(this)));
      case "var":
        return this.var_handler(e);
    }
  }
}

export class StringDispatchRenderer extends DispatchRenderer<string> {

  constructor() {
    super(
      c => c.value,
      ([f, renderer], args) => `${renderer.render(f.callee)}(${args.join(", ")})`,
      (f, args) => `${f}(${args.join(", ")})`,
      v => "?" + v.name,
    );
  }
}


export function renderNestedList(
  e: Expr,
  cons_name: string,
  nil_name: string,
  renderer: Renderer<string>,
  join = ', ',
  app = ' ++ ',
  lparen = '(',
  rparen = ')',
): string {
  function collectArgs(e: Expr): [Expr[], Expr] {
    if (e.kind === "app" && e.callee.kind === "const" && e.callee.value === cons_name) {
      const [xs, end] = collectArgs(e.args[1]);
      return [[e.args[0], ...xs], end];
    }
    return [[], e];
  }
  const [xs, end] = collectArgs(e);
  const body = lparen + xs.map(renderer.render.bind(renderer)).join(join) + rparen;
  if (end.kind === "const" && end.value === nil_name) {
    return body;
  } else {
    return body + app + renderer.render(end);
  }
}


