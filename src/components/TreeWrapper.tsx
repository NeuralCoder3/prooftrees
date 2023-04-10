import Draggable from "react-draggable";
import { TreeComponent } from "./TreeComponent";
import { calculus } from "../logic/inference/inference_rules";
import { Tree, goal_tree } from "./Tree";
import { useState } from "react";

interface TreeWrapperProps {
  calculus: calculus;
  init: Tree | string;
}

export function TreeWrapper(props: TreeWrapperProps) {

  const [tree, setTree] = useState<Tree>(typeof props.init === "string" ? goal_tree(props.init) : props.init);

  const update_assumptions = (subtree: Tree) => (rule: string, assumptions: string[]) => {
    subtree.assumptions = assumptions.map(a => goal_tree(a));
    subtree.rule = rule;
    // TODO: find better way to update tree components
    setTree({ ...tree });
  };

  return (
    <Draggable
      handle=".separator"
      cancel=".rule_name"
    >
      <div id="handle">
        <TreeComponent
          calculus={props.calculus}
          tree={tree}
          update_assumptions={update_assumptions}
        />
      </div>
    </ Draggable>
  );
}
