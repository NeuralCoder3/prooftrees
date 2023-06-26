import { Delete, Add } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, IconButton } from "@mui/material";
import React from "react";
import { Expr } from "../logic/syntax/syntactic_logic";
import { DispatchRenderer } from "../logic/syntax/renderer";
import { parse } from "../logic/syntax/parser";

export type AliasTableProps = {
  aliases: [Expr, Expr][],
  setAliases: React.Dispatch<React.SetStateAction<[Expr, Expr][]>>,
  rendererGenerator: (showAlias: boolean) => DispatchRenderer<string>
}

export function AliasTable(
  { aliases, setAliases, rendererGenerator }: AliasTableProps
) {
  const [openAliasDialog, setOpenAliasDialog] = React.useState(false);
  const [aliasDialogAlias, setAliasDialogAlias] = React.useState("");
  const [aliasDialogDefinition, setAliasDialogDefinition] = React.useState("");
  const [aliasDialogError, setAliasDialogError] = React.useState("");

  const aliasDialog = (
    <Dialog open={openAliasDialog} onClose={() => setOpenAliasDialog(false)}>
      <DialogTitle>Alias Definition</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please input the alias and the corresponding definition.
          Note: The definition should be in plain expression without notations or syntactic sugar.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="alias"
          label="Alias"
          type="text"
          fullWidth
          variant="standard"
          value={aliasDialogAlias}
          onChange={(e) => {
            setAliasDialogAlias(e.target.value);
            setAliasDialogError("");
          }}
        />
        <TextField
          autoFocus
          margin="dense"
          id="definition"
          label="Definition"
          type="text"
          fullWidth
          variant="standard"
          value={aliasDialogDefinition}
          onChange={(e) => {
            setAliasDialogDefinition(e.target.value);
            setAliasDialogError("");
          }}
        />
        <DialogContentText color="error">
          {aliasDialogError}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenAliasDialog(false)}>Cancel</Button>
        <Button onClick={() => {
          try {
            const new_def = parse(aliasDialogDefinition);
            const new_key = parse(aliasDialogAlias);
            setAliases((prev) => {
              const new_aliases = [...prev, [new_def, new_key] as [Expr, Expr]];
              return new_aliases;
            });
            setOpenAliasDialog(false);
          } catch (e) {
            setAliasDialogError("Invalid alias or definition");
          }
        }}>Register</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <div className="Aliases">
      <table className="Aliases__Table">
        <thead>
          <tr>
            <th>Alias</th>
            <th>Definition</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            aliases.map(([key, value], i) => {
              return (
                <tr>
                  <td>{rendererGenerator(false).render(value)}</td>
                  <td>{rendererGenerator(false).render(key)}</td>
                  <td>
                    <IconButton onClick={() => {
                      setAliases((prev) => {
                        // delete i-th element but keep the order
                        const new_aliases = prev.filter((_, j) => j !== i);
                        return new_aliases;
                      })
                    }}
                      color="error" aria-label="delete"
                    >
                      <Delete />
                    </IconButton>
                  </td>
                </tr>
              )
            })
          }
          <tr>
            <td></td>
            <td></td>
            <td>
              <IconButton onClick={() => {
                setOpenAliasDialog(true);
              }
              }
                color="primary" aria-label="add"
              >
                <Add />
              </IconButton>
            </td>
          </tr>
        </tbody>
      </table>
      {aliasDialog}
    </div>
  );
}
