import Draggable, { DraggableEventHandler } from "react-draggable";
import { TreeComponent } from "./TreeComponent";
import { calculus } from "../logic/inference/inference_rules";
import { StringTree, Tree, applyTreeSubst, copyTree, goal_tree, isClosed, stringTreeToTree, treeToStringTree } from "./Tree";
import { useEffect, useState } from "react";
import { Renderer } from "../logic/syntax/renderer";
import { parse } from "../logic/syntax/parser";
import { Expr } from "../logic/syntax/syntactic_logic";
import { Subst } from "../logic/unification/unification";
import "./tree.css";

// TODO: make opaque
export type timeToken = Tree;


interface TreeWrapperProps {
  calculus: calculus;
  init: Tree | string;
  renderer: Renderer<string>;
  onDrag?: DraggableEventHandler;
  onStop?: DraggableEventHandler;
  // onClick?: () => void;
  // onEndClick?: () => void;
}

export function TreeWrapper(props: TreeWrapperProps) {

  let init_tree;
  let highlight_finished = true;

  // we use stringTree instead of Tree to safe a bit of space in the URL

  if (window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    const goal = urlParams.get('goal');
    if (goal) {
      init_tree = goal_tree(parse(goal));
    }
    const tree = urlParams.get('tree');
    if (tree) {
      init_tree = stringTreeToTree(JSON.parse(tree) as StringTree);
    }
    const highlight = urlParams.get('highlight');
    if (highlight) {
      highlight_finished = highlight === "true";
    }
  }
  if (!init_tree) {
    init_tree = typeof props.init === "string" ? goal_tree(parse(props.init)) : props.init;
  }

  const [tree, setTree] = useState<Tree>(init_tree);
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    const _global = (window /* browser */ || global /* node */) as any
    _global.exportTree = () => {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('tree', JSON.stringify(treeToStringTree(tree)));
      // window.location.search = urlParams.toString();
      // console.log(urlParams.toString());
      const url = window.location.origin + window.location.pathname + "?" + urlParams.toString();
      console.log(url);
    };
    // console.log("Use exportTree() to export the current tree.")
  });

  const update_assumptions = (subtree: Tree) => (rule: string | undefined, assumptions: Expr[]) => {
    subtree.assumptions = assumptions.map(a => goal_tree(a));
    subtree.rule = rule;
    // TODO: find better way to update tree components
    // setTree({ ...tree });
    // force update
    setForceUpdate(!forceUpdate);
  };

  const restore = (t: timeToken) => {
    setTree(t);
  };

  // TODO: handle non-local variable overlap => always use fresh variables
  const propagateSubst = (subst: Subst) => {
    // const treeCopy = copyTree(tree);
    setTree(
      (tree) => {
        const new_tree = applyTreeSubst(tree, subst);
        return new_tree;
      });
    // const new_tree = applyTreeSubst(tree, subst);
    // setTree(new_tree);
  };

  const closed = isClosed(tree);

  // useEffect(() => {
  //   console.log("closed: " + closed);
  // }, [closed]);

  return (
    <Draggable
      handle=".separator"
      cancel=".rule_name"
      onDrag={props.onDrag}
      onStop={props.onStop}
    >
      <div id="handle" className={closed && highlight_finished ? "finished" : ""}>
        <TreeComponent
          calculus={props.calculus}
          tree={tree}
          update_assumptions={update_assumptions}
          renderer={props.renderer}
          propagateSubst={propagateSubst}
          capture={() => copyTree(tree)}
          restore={restore}
        // onClick={props.onClick}
        // onEndClick={props.onEndClick}
        />
      </div>
    </ Draggable>
  );
}
