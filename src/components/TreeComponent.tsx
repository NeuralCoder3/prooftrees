import { createRef, useEffect, useLayoutEffect, useState } from "react";
import { applyRule, calculus } from "../logic/inference/inference_rules";
import { Tree, applyNamedRule } from "./Tree";
import "./tree.css";
import { assert } from "console";
import { parse } from "../logic/syntax/parser";
import { StringDispatchRenderer } from "../logic/syntax/renderer";

interface TreeProps {
  calculus: calculus;
  tree: Tree;
  update_assumptions: (tree: Tree) => (rule: string, assumptions: string[]) => void;
}


// TODO: custom renderer
// TODO: rule selection restriction
// TODO: handle errors
// TODO: propagate subst (see example)

const renderer = new StringDispatchRenderer();

export const TreeComponent = (props: TreeProps) => {

  const [spacerWidth, setSpacerWidth] = useState(0);

  const ruleNameRef = createRef<HTMLDivElement>();

  const handleRule = (ruleName: string) => {
    const goal = props.tree.conclusion;
    const goal_expr = parse(goal);
    const [assumption_exprs, subst] = applyNamedRule(props.calculus, ruleName, goal_expr);
    const assumptions = assumption_exprs.map(a => renderer.render(a));
    props.update_assumptions(props.tree)(ruleName, assumptions);
  };

  const rule_name = (
    <div className="rule_name" ref={ruleNameRef} onResize={
      () => {
        setSpacerWidth(ruleNameRef.current?.offsetWidth || 0);
      }
    }>
      {
        props.tree.rule ?
          props.tree.rule :
          (
            <select
              onChange={(e) => {
                handleRule(e.target.value);
                return false;
              }}
            >
              <option value="">Select rule</option>
              {
                props.calculus.rules.map((rule, index) =>
                  <option key={index} value={rule.name}>{rule.name}</option>
                )
              }
            </select>
          )
        // <button onClick={() => props.update_assumptions(props.tree)("Rule", ["ABC"])
        // }>
        //   Add hypothesis
        // </button>
      }
    </div >
  );


  useEffect(() => {
    setSpacerWidth(ruleNameRef.current?.offsetWidth || 0);
  }, [ruleNameRef.current]);

  return (
    <div>
      <div style={{
        width: "fit-content"
      }}>
        <div className="nobreak_center">
          {
            props.tree.assumptions.map((t, index) =>
              <>
                <div key={index}>
                  <TreeComponent calculus={props.calculus} tree={t} update_assumptions={props.update_assumptions} />
                </div>
                <div className="small_spacer" />
              </>
            )
          }
        </div>
        <div className="separator" >
          {rule_name}
        </div>
        <div className="nobreak_center">
          {props.tree.conclusion}
          <div className="spacer" style={{
            width: spacerWidth
          }} />
        </div>
      </div>
    </div >
  );
}

