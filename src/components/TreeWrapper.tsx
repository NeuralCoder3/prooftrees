import Draggable, { DraggableEventHandler } from "react-draggable";
import { TreeComponent } from "./TreeComponent";
import { Premise, Calculus } from "../logic/inference/inference_rules";
import { Tree, copyTree, goal_tree, isClosed, treeFold, treeMap } from "./Tree";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Renderer } from "../logic/syntax/renderer";
import { Subst, applySubst } from "../logic/unification/unification";
import "./tree.css";
import { Options } from "./Options";
import { Expr, getVars } from "../logic/syntax/syntactic_logic";

// TODO: make opaque
export type timeToken = Tree;

interface TreeWrapperProps {
  calculus: Calculus;
  renderer: Renderer<string>;
  onDrag?: DraggableEventHandler;
  onStop?: DraggableEventHandler;
  options: Options;
  tree: Tree;
  setTree: Dispatch<SetStateAction<Tree>>;
  normalization: (expr: Expr) => Expr;
}

export function TreeWrapper(props: TreeWrapperProps) {

  const [forceUpdate, setForceUpdate] = useState(false);

  const update_assumptions = (subtree: Tree) => (rule: string | undefined, assumptions: Premise[]) => {
    subtree.assumptions = assumptions.map(a => goal_tree(a));
    subtree.rule = rule;
    // TODO: find better way to update tree components
    setForceUpdate(!forceUpdate);
  };

  const restore = (t: timeToken) => {
    props.setTree(t);
  };

  // TODO: handle non-local variable overlap => always use fresh variables
  // introduce fresh variables at handling
  const propagateSubst = (subst: Subst) => {
    props.setTree(
      (tree: Tree) => {
        console.log("propagating subst", subst);
        const new_tree = treeMap(tree, (concl: Expr) => applySubst(subst, concl));
        // hack for nested subst TODO: fix
        // const new_tree = treeMap(new_tree_1, (concl: Expr) => applySubst(subst, concl));
        const new_tree_norm = treeMap(new_tree, props.normalization);
        return new_tree_norm;
      });
  };

  const closed = isClosed(props.tree);

  useEffect(() => {
    console.log(props.options);
  }, []);

  const used_vars_list = treeFold<string[]>(props.tree, (e: Expr, ass_accs: string[][]) => {
    const concl_vars = getVars(e);
    return [
      ...concl_vars,
      ...(ass_accs.flat())
    ];
  });
  const used_vars = new Set(used_vars_list);

  return (
    <Draggable
      handle=".separator"
      cancel=".rule_name"
      onDrag={props.onDrag}
      onStop={props.onStop}
    >
      <div id="handle" className={closed && props.options.highlight ? "finished" : ""}>
        <TreeComponent
          calculus={props.calculus}
          tree={props.tree}
          update_assumptions={update_assumptions}
          renderer={props.renderer}
          propagateSubst={propagateSubst}
          capture={() => copyTree(props.tree)}
          restore={restore}
          options={props.options}
          used_vars={used_vars}
        />
      </div>
    </ Draggable>
  );
}
