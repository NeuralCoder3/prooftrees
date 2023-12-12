import * as type_conversion from "../logic/calculi/type_conversion";
import * as expr_ty from "../logic/calculi/static_semantics_expr";
import * as stmt_ty from "../logic/calculi/static_semantics_stmt";
import * as meta from "../logic/calculi/meta";
import * as hoare from "../logic/calculi/hoare";
import * as prog1_static from "../logic/calculi/static_prog1";


export const calculiList = [
  meta.calculus,
  prog1_static.calculus,
  // type_conversion.calculus,
  // expr_ty.calculus,
  // stmt_ty.calculus,
  // hoare.calculus,
];

export let default_options = {
  // initial settings
  goal: (undefined as undefined | string),
  tree: (undefined as undefined | string),
  offset: ("center" as "0,0" | "center"),
  scale: 1.0,
  calculus: "prog1static,meta",

  highlight: true,
  showSideConditions: false,
  plainRenderer: false,
  showAlias: true,
  // minimalStyle: false,
  showButtons: true,
  showRules: true,
  showOptions: true,
}



export type Options = typeof default_options;
