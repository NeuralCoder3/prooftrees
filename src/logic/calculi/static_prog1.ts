import { Calculus as inf_calculus, convertStringRule } from '../inference/inference_rules';
import { AppDispatchRenderer, ConstDispatchRenderer } from '../syntax/renderer';
import { renderer as type_app_renderer } from './type_conversion';

export const calculus: inf_calculus = {
  name: "Prog1Static",
  rules: [
    convertStringRule({
      name: "TVar",
      conclusion: "typed(?E, Id(?x), ?t)",
      premises: [
        "maps(?E, ?x, ?t)",
        // ["is_var(?x)", "side-condition"],
      ]
    }),
    convertStringRule({
      name: "TConst",
      conclusion: "typed(?E, Const(?c), ?t)",
      premises: ["typed_const(Const(?c), ?t)"]
    }),
    convertStringRule({
      name: "TBinop",
      conclusion: "typed(?E, Binop(?o,?e1,?e2), ?t)",
      premises: [
        "typed(?E, ?o, Fun(?t1, Fun(?t2, ?t)))", 
        "typed(?E, ?e1, ?t1)", 
        "typed(?E, ?e2, ?t2)"
      ]
    }),
    convertStringRule({
      name: "TApp",
      conclusion: "typed(?E, App(?e1, ?e2), ?t)",
      premises: [
        "typed(?E, ?e1, Fun(?t2, ?t))",
        "typed(?E, ?e2, ?t2)"
      ]
    }),
    convertStringRule({
      name: "TIf",
      conclusion: "typed(?E, If(?e1, ?e2, ?e3), ?t)",
      premises: [
        "typed(?E, ?e1, bool)",
        "typed(?E, ?e2, ?t)",
        "typed(?E, ?e3, ?t)"
      ]
    }),
    convertStringRule({
      name: "TLet",
      conclusion: "typed(?E, Let(Id(?x), ?e1, ?e2), ?t)",
      premises: [
        "typed(?E, ?e1, ?t1)",
        "typed(Extend(?t1, ?x, ?E), ?e2, ?t)"
      ]
    }),
    convertStringRule({
      name: "TLam",
      conclusion: "typed(?E, Lam(Id(?x), ?t1, ?e), Fun(?t1, ?t2))",
      premises: [
        "typed(Extend(?t1, ?x, ?E), ?e, ?t2)"
      ]
    }),
    convertStringRule({
      name: "TLetRec",
      conclusion: "typed(?E, LetRec(Id(?f), Id(?x), ?t1, ?t2, ?e1, ?e2), ?t)",
      premises: [
        "typed(Extend(?t1, ?x, Extend(Fun(?t1, ?t2), ?f, ?E)), ?e1, ?t2)",
        "typed(Extend(Fun(?t1, ?t2), ?f, ?E), ?e2, ?t)"
      ]
    }),
  ]
};

export const app_renderer: AppDispatchRenderer<string> = {
  ...type_app_renderer,
  "typed": (_, args) => `${args[0]} ⊢ ${args[1]} : ${args[2]}`,
  "typed_const": (_, args) => `${args[0]} : ${args[1]}`,
  // "maps": (_, args) => `(${args[1]} : ${args[2]}) ∈ ${args[0]}`,

  "Const": (_, args) => `${args[0]}`,
  "Id": (_, args) => `${args[0]}`,

  "App": (_, args) => `${args[0]} (${args[1]})`,
  "Binop": (_, args) => `${args[1]} ${args[0]} ${args[2]}`,
  "If": (_, args) => `if ${args[0]} then ${args[1]} else ${args[2]}`,
  "Let": (_, args) => `let ${args[0]} = ${args[1]} in ${args[2]}`,
  "Lam": (_, args) => `λ (${args[0]} : ${args[1]}). ${args[2]}`,
  "LetRec": (_, args) => `let rec ${args[0]} (${args[1]} : ${args[2]}) : ${args[3]} = ${args[4]} in ${args[5]}`,

  "Fun": (_, args) => `${args[0]} → ${args[1]}`,

  // "is_bound": (_, args) => `-2³¹ ≤ ${args[0]} < 2³¹`,
  // "BinOp": (_, args) => `${args[1]} ${args[0]} ${args[2]}`,
  // "Indir": (_, args) => `*${args[0]}`,
  // "Addr": (_, args) => `&${args[0]}`,

  // temporary
  // "is_arith_op": (_, args) => `${args[0]} ∈ {+, -, *, /}`,
  // "is_cmp_op": (_, args) => `${args[0]} ∈ {<, ≤, >, ≥, ==, !=}`,
  // "is_int": (_, args) => `${args[0]} ∈ {int, char}`,
};

/*
x:int, y:bool |- if y then x else 0 : int

typed(Extend(int, x, Extend(bool, y, Empty)), If(Id(y), Id(x), Const(0)), int)

lam (x:t1). lam (x:t2). x : t1 -> t2 -> t2
typed(Empty, Lam(Id(x), t1, Lam(Id(x), t2, Id(x))), Fun(t1, Fun(t2, t2)))


4.7.1f
lam (f:?a). lam (g:?b). lam (x:?c). f x (g x)
typed(Empty, Lam(Id(f), ?a, Lam(Id(g), ?b, Lam(Id(x), ?c, App(App(Id(f), Id(x)), App(Id(g), Id(x)))))), ?t)


4.8.3h
if x then y+0 else z
typed(Extend(?t3, z, Extend(?t2, y, Extend(?t1, x, Empty))), If(Id(x), Binop(Plus, Id(y), Const(0)), Id(z)), ?t)
*/

export const const_renderer: ConstDispatchRenderer<string> = {
  "Empty": "{}",
  "Plus": "+",
  "Minus": "-",
};
