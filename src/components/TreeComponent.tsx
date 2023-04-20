import { Fragment, createRef, useEffect, useLayoutEffect, useState } from "react";
import { applyRule, calculus } from "../logic/inference/inference_rules";
import { Tree, applyNamedRule } from "./Tree";
import { assert } from "console";
import { parse } from "../logic/syntax/parser";
import { Renderer, StringDispatchRenderer } from "../logic/syntax/renderer";
import { Expr } from "../logic/syntax/syntactic_logic";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { Subst, renderSubst } from "../logic/unification/unification";
import { timeToken } from "./TreeWrapper";


interface TreeProps {
  calculus: calculus;
  tree: Tree;
  update_assumptions: (tree: Tree) => (rule: string | undefined, assumptions: Expr[]) => void;
  renderer: Renderer<string>;
  propagateSubst: (subst: Subst) => void;
  restore: (t: timeToken) => void;
  capture: () => timeToken;
}


// TODO: rule selection restriction
// TODO: propagate subst (see example)

// TODO: handle errors with message (currently just red)

export const TreeComponent = (props: TreeProps) => {

  const [spacerWidth, setSpacerWidth] = useState(0);
  const ruleNameRef = createRef<HTMLDivElement>();
  const [hadError, setHadError] = useState(false);
  const [undoToken, setUndoToken] = useState<timeToken | undefined>(undefined);

  const handleRule = (ruleName: string) => {
    const goal = props.tree.conclusion;
    try {
      const token = props.capture();
      setUndoToken(token);
      const [assumptions, subst] = applyNamedRule(props.calculus, ruleName, goal);
      // const assumptions = assumption_exprs.map(a => renderer.render(a));
      // console.log(renderSubst(subst, props.renderer));
      props.update_assumptions(props.tree)(ruleName, assumptions);

      // TODO: propagate undo upwards in deconstructor fashion
      // TODO: find better way to avoid double tree update
      // const token = props.propagateSubst(subst);
      props.propagateSubst(subst);
    } catch (e) {
      setHadError(true);
      console.log(e);
      return;
    }
  };

  // resets everything to before the subst was applied (right after adding the assumptions)
  // TODO: only remove children of the current node, only reset affected nodes
  const reset = () => {
    console.log("Resetting...");
    setHadError(false);
    if (undoToken) {
      props.restore(undoToken);
      setUndoToken(undefined);
      return;
    }
    props.update_assumptions(props.tree)(undefined, []);
  };

  const rule_name = (
    <div className="rule_name" ref={ruleNameRef} onResize={
      () => {
        setSpacerWidth(ruleNameRef.current?.offsetWidth || 0);
      }
    }>
      {
        props.tree.rule ?
          (
            <span>{props.tree.rule}
              <IconButton color="primary" aria-label="Delete Subtree" component="label"
                onClick={(e) => {
                  reset();
                }}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
              {/* <button
                className="delete_button"
                onClick={(e) => {
                  props.update_assumptions(props.tree)(undefined, []);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button> */}
            </span>
          )
          :
          (
            <Select
              options={
                props.calculus.rules.map((rule, index) =>
                  ({ value: rule.name, label: rule.name })
                )
              }
              // onChange={(e) => {
              //   props.onEndClick?.();
              //   handleRule(e.value);
              //   return false;
              // }}
              className={
                hadError ? "error" : ""
              }

              // red background on error
              styles={{
                control: (provided, state) =>
                  hadError ?
                    ({
                      ...provided,
                      backgroundColor: "rgba(255, 72, 26, 0.4)",
                    })
                    : provided,
              }}


              // inputValue="Select rule"
              // value={null}

              onChange={(e) => {
                // props.onEndClick?.();
                if (e?.value) {
                  handleRule(e.value);
                }
                // console.log("change");
                // return false;
              }}

              onInputChange={(e) => { }}
              onMenuClose={() => { }}
              onMenuOpen={() => { }}
            />
            // <Select
            //   // onClick={(e) => {
            //   //   console.log("click");
            //   //   props.onClick?.();
            //   // }}
            //   // onAbort={(e) => {
            //   //   console.log("abort");
            //   //   props.onEndClick?.();
            //   // }}
            //   // onAbortCapture={(e) => {
            //   //   console.log("abort capture");
            //   //   props.onEndClick?.();
            //   // }}
            //   // onAuxClick={(e) => {
            //   //   console.log("aux click");
            //   //   props.onEndClick?.();
            //   // }}
            //   // onLostPointerCapture={(e) => {
            //   //   console.log("lost pointer capture");
            //   //   props.onEndClick?.();
            //   // }}


            //   onChange={(e) => {
            //     props.onEndClick?.();
            //     handleRule(e.target.value);
            //     return false;
            //   }}
            //   className={
            //     hadError ? "error" : ""
            //   }
            // >
            //   <option value="">Select rule</option>
            //   {
            //     props.calculus.rules.map((rule, index) =>
            //       <option key={index} value={rule.name}>{rule.name}</option>
            //     )
            //   }
            // </Select>
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
              <Fragment key={index}>
                <div>
                  <TreeComponent
                    tree={t}
                    calculus={props.calculus} update_assumptions={props.update_assumptions} renderer={props.renderer}
                    propagateSubst={props.propagateSubst} restore={props.restore} capture={props.capture}
                  />
                </div>
                <div className="small_spacer" />
              </Fragment>
            )
          }
        </div>
        <div className="separator" >
          {rule_name}
        </div>
        <div className="nobreak_center">
          {props.renderer.render(props.tree.conclusion)}
          <div className="spacer" style={{
            width: spacerWidth
          }} />
        </div>
      </div>
    </div >
  );
}

