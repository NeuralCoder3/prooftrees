import { App, Const, Expr, Var, equalExpr, replaceInExpr } from "./syntactic_logic";

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
    private preprocess: (e: Expr) => Expr = (e: Expr) => e,
    private postprocess: (t: T) => T = (t: T) => t
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

  render(e_: Expr): T {
    const e = this.preprocess(e_);
    let result;
    switch (e.kind) {
      case "const":
        result = this.renderConst(e);
        break;
      case "app":
        result = this.renderApp(e, e.args.map(this.render.bind(this)));
        break;
      case "var":
        result = this.var_handler(e);
        break;
    }
    result = this.postprocess(result);
    return result;
  }
}

export class StringDispatchRenderer extends DispatchRenderer<string> {

  constructor(aliases: [Expr, Expr][] = []) {

    // const aliasResolution = (s: string) => {
    //   let result = s;
    //   do {
    //     s = result;
    //     for (const k in aliases) {
    //       result = result.replaceAll(k, aliases[k]);
    //     }
    //     console.log(result);
    //   } while (result !== s);
    //   return result;
    // };

    const aliasResolution = (e: Expr) => {
      let result = e;
      do {
        e = result;
        for (const [k, v] of aliases) {
          result = replaceInExpr(result, k, v);
        }
      } while (!equalExpr(result, e));
      return result;
    };


    super(
      c => c.value,
      ([f, renderer], args) => `${renderer.render(f.callee)}(${args.join(", ")})`,
      (f, args) => `${f}(${args.join(", ")})`,
      v => "?" + v.value,
      aliasResolution
    );
  }
}


// V = extracted arguments
// T = collected arguments
// U = output
export function renderNestedListAdvanced<V, T, U>(
  e: Expr,
  getArg: (e: Expr) => [V, Expr] | Expr,
  empty: T,
  combine: (arg: V, args: T) => T,
  postprocess: (t: T, end: Expr) => U,
): U {
  function collectArgs(e: Expr): [T, Expr] {
    const res = getArg(e);
    if (res instanceof Array) {
      const [arg, rest] = res;
      const [acc, end] = collectArgs(rest);
      return [combine(arg, acc), end];
    } else {
      return [empty, res];
    }
  }
  const [args, end] = collectArgs(e);
  return postprocess(args, end);
}

export function renderNestedList(
  e: Expr,
  cons_name: string,
  nil_name: string,
  renderer: Renderer<string>,
  join = ', ',
  // app = ' ++ ',
  app = (left: string, right: string) => left + ' ++ ' + right,
  lparen = '(',
  rparen = ')',
  arg_collect = (args: Expr[]) => [args[0], args[1]]
): string {
  const s = renderNestedListAdvanced<Expr, Expr[], string>(
    e,
    e => {
      if (e.kind === "app" && e.callee.kind === "const" && e.callee.value === cons_name) {
        return arg_collect(e.args) as [Expr, Expr];
      } else {
        return e;
      }
    },
    [],
    (arg, args) => [arg, ...args],
    (args, end) => {
      const body =
        // (custom_nil !== null && args.length === 0) ? custom_nil :
        lparen + args.map(renderer.render.bind(renderer)).join(join) + rparen;
      if (end.kind === "const" && end.value === nil_name) {
        return body;
      } else {
        // return body + app + renderer.render(end);
        return app(body, renderer.render(end));
      }
    }
  );
  return s;
}


