import { Fragment, createRef, useEffect, useLayoutEffect, useState } from "react";
import { Premise, applyRule, Calculus } from "../logic/inference/inference_rules";
import { Tree, applyNamedRule, treeFold } from "./Tree";
import { assert } from "console";
import { parse } from "../logic/syntax/parser";
import { Renderer, StringDispatchRenderer } from "../logic/syntax/renderer";
import { Expr, getVars } from "../logic/syntax/syntactic_logic";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { Subst, renderSubst } from "../logic/unification/unification";
import { timeToken } from "./TreeWrapper";
import { Options } from "./Options";


interface TreeProps {
  calculus: Calculus;
  tree: Tree;
  renderer: Renderer<string>;
  restore: (t: timeToken) => void;
  options: Options;
  capture: () => timeToken;
  update_assumptions: (tree: Tree) => (rule: string | undefined, assumptions: Premise[]) => void;
  propagateSubst: (subst: Subst) => void;
  locked?: boolean;
  used_vars: Set<string>;
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
    // const used_vars_list = treeFold<string[]>(props.tree, (e: Expr, ass_accs: string[][]) => {
    //   const concl_vars = getVars(e);
    //   return [
    //     ...concl_vars,
    //     ...(ass_accs.flat())
    //   ];
    // });
    // const used_vars = new Set(used_vars_list);
    // console.log("Used variables: ", used_vars);

    try {
      const token = props.capture();
      setUndoToken(token);
      const [assumptions, subst] = applyNamedRule(props.calculus, ruleName, goal, props.used_vars);
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
              {
                !props.locked &&
                <IconButton color="primary" aria-label="Delete Subtree" component="label"
                  onClick={(e) => {
                    reset();
                  }}
                >
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              }
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



              className={
                hadError ? "error" : ""
              }

              // minWidth = width of largest option
              // red background on error
              styles={{
                // @ts-ignore
                control: (provided, state) => {
                  const max_width = 4 + Math.max(...props.calculus.rules.map(r => r.name?.length || 0));

                  let style = {
                    ...provided,
                    // minWidth: "fit-content",
                    minWidth: `${max_width}ch`,
                  };
                  if (hadError)
                    style = {
                      ...style,
                      backgroundColor: "rgba(255, 72, 26, 0.4)",
                    };

                  return style;
                },
                // @ts-ignore
                menu: (base) => ({
                      ...base,
                      width: "max-content",
                      minWidth: "100%"
                }),
                

              }}

              onChange={(e) => {
                if (e?.value) {
                  handleRule(e.value);
                }
              }}

              onInputChange={(e) => { }}
              onMenuClose={() => { }}
              onMenuOpen={() => { }}

            />
          )
      }
    </div >
  );


  useEffect(() => {
    setSpacerWidth(ruleNameRef.current?.offsetWidth || 0);
  }, [ruleNameRef.current]);

  if (props.tree.annotations.length > 0 && !props.options.showSideConditions) {
    return <></>;
  }

  return (
    <div>
      <div style={{
        width: "fit-content"
      }}>
        {!props.tree.open &&
          <>
            <div className="nobreak_center">
              {
                props.tree.assumptions.map((t, index) =>
                  <Fragment key={index}>
                    <div>
                      <TreeComponent
                        tree={t}
                        calculus={props.calculus} update_assumptions={props.update_assumptions} renderer={props.renderer}
                        propagateSubst={props.propagateSubst} restore={props.restore} capture={props.capture}
                        options={props.options}
                        used_vars={props.used_vars}
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
          </>
        }
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

