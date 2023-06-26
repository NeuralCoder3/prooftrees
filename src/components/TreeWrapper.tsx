import Draggable, { DraggableEventHandler } from "react-draggable";
import { TreeComponent } from "./TreeComponent";
import { Premise, Calculus, valuePremise } from "../logic/inference/inference_rules";
import { StringTree, Tree, applyTreeSubst, copyTree, goal_tree, isClosed, stringTreeToTree, treeToStringTree } from "./Tree";
import { useEffect, useState } from "react";
import { Renderer } from "../logic/syntax/renderer";
import { parse } from "../logic/syntax/parser";
import { Subst } from "../logic/unification/unification";
import "./tree.css";
import { Options } from "./Options";

// TODO: make opaque
export type timeToken = Tree;

interface TreeWrapperProps {
  calculus: Calculus;
  init: string;
  renderer: Renderer<string>;
  onDrag?: DraggableEventHandler;
  onStop?: DraggableEventHandler;
  options: Options;
}

export function TreeWrapper(props: TreeWrapperProps) {

  let init_tree: Tree;

  // we use stringTree instead of Tree to safe a bit of space in the URL

  if (props.options.tree) {
    init_tree = stringTreeToTree(JSON.parse(props.options.tree) as StringTree);
  } else if (props.options.goal) {
    init_tree = goal_tree(valuePremise(parse(props.options.goal)));
  } else {
    init_tree = goal_tree(valuePremise(parse(props.init)));
  }


  const [tree, setTree] = useState<Tree>(init_tree);
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    const _global = (window /* browser */ || global /* node */) as any
    _global.exportTree = () => {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('tree', JSON.stringify(treeToStringTree(tree)));
      const url = window.location.origin + window.location.pathname + "?" + urlParams.toString();
      console.log(url);
    };
  });

  const update_assumptions = (subtree: Tree) => (rule: string | undefined, assumptions: Premise[]) => {
    subtree.assumptions = assumptions.map(a => goal_tree(a));
    subtree.rule = rule;
    // TODO: find better way to update tree components
    setForceUpdate(!forceUpdate);
  };

  const restore = (t: timeToken) => {
    setTree(t);
  };

  // TODO: handle non-local variable overlap => always use fresh variables
  const propagateSubst = (subst: Subst) => {
    setTree(
      (tree) => {
        const new_tree = applyTreeSubst(tree, subst);
        return new_tree;
      });
  };

  const closed = isClosed(tree);

  useEffect(() => {
    console.log(props.options);
  }, []);

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
          tree={tree}
          update_assumptions={update_assumptions}
          renderer={props.renderer}
          propagateSubst={propagateSubst}
          capture={() => copyTree(tree)}
          restore={restore}
          options={props.options}
        />
      </div>
    </ Draggable>
  );
}
