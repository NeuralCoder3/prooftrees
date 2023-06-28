import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { AppDispatchRenderer, AppRenderer, ConstDispatchRenderer, renderNestedList, renderNestedListAdvanced } from '../syntax/renderer';
import { Expr, equalExpr, fun } from '../syntax/syntactic_logic';

export const calculus: inf_calculus = {
  name: "StmtStaticSemantics",
  rules: [
    convertStringRule({
      name: "TAssign",
      conclusion: "stmt_typed(?Gamma, Assign(?l, ?e))",
      premises: [
        "typed(?Gamma, ?e, ?k1)",
        "typed(?Gamma, ?l, ?k2)",
        "convertible(?k1, ?k2)",
        ["is_scalar(?k1)", "side-condition"],
        ["is_scalar(?k2)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "TAbort",
      conclusion: "stmt_typed(?Gamma, Abort)",
      premises: [
      ]
    }),
    convertStringRule({
      name: "TIf",
      conclusion: "stmt_typed(?Gamma, If(?e, ?s1, ?s2))",
      premises: [
        "typed(?Gamma, ?e, ?k)",
        "stmt_typed(?Gamma, ?s1)",
        "stmt_typed(?Gamma, ?s2)",
        ["is_scalar(?k)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "TWhile",
      conclusion: "stmt_typed(?Gamma, While(?e, ?s))",
      premises: [
        "typed(?Gamma, ?e, ?k)",
        "stmt_typed(?Gamma, ?s)",
        ["is_scalar(?k)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "TDecl",
      conclusion: "stmt_typed(?Gamma, Block(Seq(Declare(?t, ?n), ?p)))",
      premises: [
        "stmt_typed(Extend(?t, ?n, ?Gamma), Block(?p))",
        ["is_type(?t)", "side-condition"],
      ]
      // conclusion: "prg_typed(?Gamma, Seq(Declare(?t, ?n), ?p))",
      // premises: [
      //   "prg_typed(Extend(?t, ?n, ?Gamma), ?p)",
      //   ["is_type(?t)", "side-condition"],
      // ]
    }),
    // Program rules
    convertStringRule({
      name: "TBlock",
      conclusion: "stmt_typed(?Gamma, Block(?p))",
      premises: [
        "prg_typed(?Gamma, ?p)",
        ["not(has_declare(?p))", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "TSeq",
      conclusion: "prg_typed(?Gamma, Seq(?s, ?p))",
      premises: [
        "stmt_typed(?Gamma, ?s)",
        "prg_typed(?Gamma, ?p)",
      ]
    }),
    convertStringRule({
      name: "TSeq1",
      conclusion: "prg_typed(?Gamma, Seq(?s, Term))",
      premises: [
        "stmt_typed(?Gamma, ?s)",
      ]
    }),
    convertStringRule({
      name: "TSeq2",
      conclusion: "prg_typed(?Gamma, Seq(?s, Seq(?s2, Term)))",
      premises: [
        "stmt_typed(?Gamma, ?s)",
        "stmt_typed(?Gamma, ?s2)",
      ]
    }),
    // convertStringRule({
    //   name: "IntLookup",
    //   conclusion: "maps(?Gamma, ?x, int)",
    //   premises: [
    //   ]
    // }),
    convertStringRule({
      name: "TTerm",
      conclusion: "prg_typed(?Gamma, Term)",
      premises: [
      ]
    }),
  ]
};

// simple
// const envRenderer: AppRenderer<string> = (_, args) => `${args[2]}[${args[0]} ↦ ${args[1]}]`;

// with duplicates
// const envRenderer: AppRenderer<string> = ([f, renderer], _) =>
//   renderNestedList(f, "Extend", "emptyEnv", renderer, ", ", (left, right) => right + left, "{", "}",
//     (args) => [fun("DeclPair", [args[0], args[1]]), args[2]]);

type DeclarationPair = {
  name: Expr, // or just string
  type: Expr,
};
const mkDeclPair = (name: Expr, type: Expr): DeclarationPair => ({ name, type });

// remove duplicates
const envRenderer: AppRenderer<string> = ([f, renderer], _) =>
  renderNestedListAdvanced<DeclarationPair, DeclarationPair[], string>(
    f,
    e => {
      if (e.kind === "app" && e.callee.kind === "const" && e.callee.value === "Extend") {
        const [type, name, env] = e.args;
        return [mkDeclPair(name, type), env];
      } else {
        return e;
      }
    },
    [],
    (arg, args) => {
      return [arg, ...(args.filter(decl => !equalExpr(decl.name, arg.name)))];
    },
    (args, end) => {
      const strRenderer = renderer.render.bind(renderer);
      const body =
        "{" + args.map(decl =>
          strRenderer(fun("DeclPair", [decl.type, decl.name]))
        ).join(", ") + "}";
      if (end.kind === "const" && end.value === "emptyEnv") {
        return body;
      } else {
        return body + " " + renderer.render(end);
      }
    }
  );

// couple with stmt renderer and convertible renderer
export const app_renderer: AppDispatchRenderer<string> = {
  "stmt_typed": (_, args) => `${args[0]} ⊢ ${args[1]}`,
  "prg_typed": (_, args) => `${args[0]} ⊢ ${args[1]}`,
  "Assign": (_, args) => `${args[0]} = ${args[1]};`,
  "If": (_, args) => `if (${args[0]}) ${args[1]} else ${args[2]}`,
  "While": (_, args) => `while (${args[0]}) ${args[1]}`,
  "Declare": (_, args) => `${args[0]} ${args[1]};`,
  "DeclPair": (_, args) => `${args[1]} ↦ ${args[0]}`,
  "Extend": envRenderer,
  "Block": (_, args) => `{ ${args[0]} }`,
  "Seq": ([f, renderer], _) => renderNestedList(f, "Seq", "Term", renderer, " ", (left, right) => left + " " + right, "", "")

  // temporary
};

export const const_renderer: ConstDispatchRenderer<string> = {
  "Term": "ε",
  "emptyEnv": "∅",
  "Abort": "abort();",
};
