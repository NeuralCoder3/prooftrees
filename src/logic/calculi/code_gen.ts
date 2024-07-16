import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { AppDispatchRenderer, ConstDispatchRenderer, renderNestedList } from '../syntax/renderer';
import { App, Expr, Normalizers, mapNormalizer, mkConst } from '../syntax/syntactic_logic';
import { app_renderer as expr_app_renderer } from './static_semantics_expr';

// codeR(offsets, registers, expr, type, code)
// mips => single instruction

export const calculus: inf_calculus = {
  name: "CodeGen",
  rules: [
    convertStringRule({
      name: "CConst",
      conclusion: "codeR(?offs, cons(?r, ?rs), ?c, int, mips(li, ?r, ?c))",
      premises: [
        ["is_num(?c)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "CVar",
      conclusion: "codeL(?offs, cons(?r, ?rs), ?x, ?k, mips(addiu, ?r, $sp, ?d))",
      premises: [
        "maps(?offs, ?x, ?d)",
        ["is_var(?x)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "CLtoR",
      conclusion: "codeR(?offs, cons(?r, ?rs), ?l, ?k, codeCons(?c, mips(loadOf(?k), ?r, ?r)))",
      premises: [
        "codeL(?offs, cons(?r, ?rs), ?l, ?k, ?c)",
        // ["is_lvalue(?l)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "CIndir",
      conclusion: "codeL(?offs, cons(?r, ?rs), Indir(?e), ?k, ?c)",
      premises: [
        "codeR(?offs, cons(?r, ?rs), ?e, Ptr(?k), ?c)",
      ]
    }),
    convertStringRule({
      name: "CAddrOf",
      conclusion: "codeR(?offs, cons(?r, ?rs), Addr(?l), Ptr(?k), ?c)",
      premises: [
        "codeL(?offs, cons(?r, ?rs), ?l, ?k, ?c)",
        // ["is_lvalue(?l)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "CBinary",
      conclusion: `codeR(?offs, cons(?r1, cons(?r2, ?rs)), BinOp(?o, ?e1, ?e2), int, 
        codeCons(?c1, codeCons(?c2, mips(commandOf(?o), ?r1, ?r1, ?r2))))`,
      premises: [
        "codeR(?offs, cons(?r1, cons(?r2, ?rs)), ?e1, ?k1, ?c1)",
        "codeR(?offs, cons(?r2, ?rs), ?e2, ?k2, ?c2)",
      ]
    }),

    // Statement Code Gen
    convertStringRule({
      name: "CWhile",
      conclusion: `codeS(?offs, While(?e, ?s), 
        codeCons( mips(b, T),
        codeCons( label(L),
        codeCons( ?c2,
        codeCons( label(T),
        codeCons( ?c1,
          mips(bnez, ?r, L)
        ))))))`,
      premises: [
        "codeR(?offs, cons($t0, cons($t1, cons($t2, ?rs))), ?e, ?k, ?c1)",
        "codeS(?offs, ?s, ?c2)",
      ]
    }),
    convertStringRule({
      name: "CIf",
      conclusion: `codeS(?offs, If(?e, ?s1, ?s2), 
        codeCons( ?c,
        codeCons( mips(beqz, ?r, F),
        codeCons( ?c1,
        codeCons( mips(b, N),
        codeCons( label(F),
        ?c2
        ))))))`,
      premises: [
        "codeR(?offs, cons($t0, cons($t1, cons($t2, ?rs))), ?e, ?k, ?c)",
        "codeS(?offs, ?s1, ?c1)",
        "codeS(?offs, ?s2, ?c2)",
      ]
    }),
    convertStringRule({
      name: "CAssign",
      conclusion: `codeS(?offs, Assign(?l, ?e),
        codeCons( ?c1,
        codeCons( ?c2,
        mips(storeOf(?k1), ?r2, ?r1)
        )))`,
      premises: [
        "codeL(?offs, cons($t0, cons($t1, cons($t2, ?rs))), ?l, ?k1, ?c1)",
        "codeR(?offs, cons($t1, cons($t2, ?rs)), ?e, ?k2, ?c2)",
      ]
    }),
    convertStringRule({
      name: "CBlock",
      conclusion: `TODO`,
      premises: [
      ]
    }),
    convertStringRule({
      name: "CTerm",
      conclusion: `codeP(?offs, Term, empty)`,
      premises: [
      ]
    }),
    convertStringRule({
      name: "CSeq",
      conclusion: `codeP(?offs, Seq(?s, ?p), codeCons(?cs, ?cp))`,
      premises: [
        "codeS(?offs, ?s, ?cs)",
        "codeP(?offs, ?p, ?cp)",
      ]
    }),
  ]
};

export const app_renderer: AppDispatchRenderer<string> = {
  ...expr_app_renderer,
  "codeR": (_, args) => `codeR ${args[0]} (${args[1]}) ⟦${args[2]}⟧ ${args[3]} = <div class="codebox">${args[4]}</div>`,
  "codeL": (_, args) => `codeL ${args[0]} (${args[1]}) ⟦${args[2]}⟧ ${args[3]} = <div class="codebox">${args[4]}</div>`,
  "codeS": (_, args) => `codeS ${args[0]} ⟦${args[1]}⟧ = <div class="codebox">${args[2]}</div>`,
  "codeP": (_, args) => `codeP ${args[0]} ⟦${args[1]}⟧ = <div class="codebox">${args[2]}</div>`,
  "codeCons": (_, args) => `${args[0]} <br/> ${args[1]}`,
  "mips": (_, args) => {
    let command_str = "";
    for (let i = 0; i < args.length; i++) {
      if (args[i] === undefined)
        continue;
      if (i > 0)
        command_str += " ";
      command_str += args[i];
    }
    return command_str;
  },
  "cons": ([f, renderer], _) => renderNestedList(f, "cons", "nil", renderer, "::", (left, right) => left + " :: " + right, "", ""),
  "label": (_, args) => `${args[0]}:`,
};

export const const_renderer: ConstDispatchRenderer<string> = {
  "nil": "nil",
  "empty": "",
};

const commandMap: { [key: string]: string } = {
  "Plus": "addiu",
  "Minus": "subu",
  "Mul": "mul",
  "Mult": "mul",
}

const loadMap: { [key: string]: string } = {
  "int": "lw",
  "float": "l.s",
  "double": "l.d",
}

export const normalizers: Normalizers = {
  "commandOf": mapNormalizer(commandMap),
  "loadOf": (expr: Expr): Expr => {
    const app = expr as App;
    const [o] = app.args;
    if (o.kind === "var")
      return expr;
    return mkConst("lw");
  },
  "storeOf": (expr: Expr): Expr => {
    const app = expr as App;
    const [o] = app.args;
    if (o.kind === "var")
      return expr;
    return mkConst("sw");
  },
};
