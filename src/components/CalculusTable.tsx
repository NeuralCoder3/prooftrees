import { Delete, Add } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, IconButton } from "@mui/material";
import React from "react";
import { Expr } from "../logic/syntax/syntactic_logic";
import { DispatchRenderer } from "../logic/syntax/renderer";
import { parse } from "../logic/syntax/parser";
import { Calculus, InferenceRule } from "../logic/inference/inference_rules";
import { TreeComponent } from "./TreeComponent";
import { Options } from "./Options";
import { ruleToTree } from "./Tree";
import './CalculusTable.css';

export type CalculusTableProps = {
  calculus: Calculus,
  setCalculus: React.Dispatch<React.SetStateAction<Calculus>>,
  renderer: DispatchRenderer<string>,
  options: Options,
}

export function CalculusTable(
  { calculus, setCalculus, renderer, options }: CalculusTableProps
) {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [ruleDialogName, setRuleDialogName] = React.useState("");
  const [ruleDialogConclusion, setRuleDialogConclusion] = React.useState("");
  const [ruleDialogPremises, setRuleDialogPremises] = React.useState<string[]>([]);
  const [ruleDialogError, setRuleDialogError] = React.useState("");

  const dialog = (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
      <DialogTitle>Calculus Rule Definition</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please input the name of the rule, the conclusion and the premises.
          Note: The conclusion and premises should be in plain expression without notations or syntactic sugar.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
          value={ruleDialogName}
          onChange={(e) => {
            setRuleDialogName(e.target.value);
          }}
        />
        <div className="CalculusRulesPremises">
          {
            ruleDialogPremises.map((premise, i) =>
              <div className="CalculusRulesPremise rowC">
                <IconButton onClick={() => {
                  setRuleDialogPremises((prev) => {
                    const new_premises = [...prev];
                    new_premises.splice(i, 1);
                    return new_premises;
                  });
                }}>
                  <Delete />
                </IconButton>
                <TextField
                  autoFocus
                  margin="dense"
                  label={`Premise ${i + 1}`}
                  type="text"
                  fullWidth
                  variant="standard"
                  value={premise}
                  onChange={(e) => {
                    setRuleDialogPremises((prev) => {
                      const new_premises = [...prev];
                      new_premises[i] = e.target.value;
                      return new_premises;
                    });
                  }}
                />
              </div>
            )
          }
          <div className="CalculusRulesPremisesAdd">
            <IconButton onClick={() => {
              setRuleDialogPremises((prev) => [...prev, ""]);
            }}>
              <Add />
            </IconButton>
            Add Premise
          </div>
        </div>
        <TextField
          autoFocus
          margin="dense"
          label="Conclusion"
          type="text"
          fullWidth
          variant="standard"
          value={ruleDialogConclusion}
          onChange={(e) => {
            setRuleDialogConclusion(e.target.value);
          }}
        />
        <DialogContentText color="error">
          {ruleDialogError}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        <Button onClick={() => {
          try {
            const new_rule: InferenceRule = {
              name: ruleDialogName,
              conclusion: parse(ruleDialogConclusion),
              premises: ruleDialogPremises.map((premise) => {
                return {
                  value: parse(premise),
                  annotations: [],
                }
              }),
            };
            setCalculus((prev) => {
              const new_rules = [...prev.rules, new_rule];
              return { ...prev, rules: new_rules };
            });
            setOpenDialog(false);
          } catch (e) {
            setRuleDialogError("Invalid alias or definition");
          }
        }}>Register</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <div className="CalculusRules">
      <h3>Rules</h3>
      <div className="CalculusRule add">
        <IconButton onClick={() => {
          setOpenDialog(true);
        }
        }
          color="primary" aria-label="add"
        >
          <Add />
        </IconButton>
        Add Rule
      </div>
      {
        calculus.rules.map((inf: InferenceRule, i: number) => {
          const tree = ruleToTree(inf);
          return (
            <div
              className="CalculusRule"
              key={i}>
              <div className="delete">
                <IconButton onClick={() => {
                  setCalculus((prev) => {
                    const new_rules = prev.rules.filter((_, j) => j !== i);
                    return { ...prev, rules: new_rules };
                  })
                }}
                  color="error" aria-label="delete"
                >
                  <Delete />
                </IconButton>
              </div>
              <div className="rule">
                <TreeComponent
                  tree={tree}
                  calculus={calculus}
                  renderer={renderer}
                  restore={(t) => { }}
                  capture={() => tree}
                  update_assumptions={(_) => (_) => { }}
                  propagateSubst={(_) => { }}
                  options={options}
                  locked={true}
                />
              </div>
            </div>
          )
        })
      }
      {dialog}
    </div >
  );
}
