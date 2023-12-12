import { TreeWrapper } from '../components/TreeWrapper';
import * as color from "../logic/calculi/color";
import * as type_conversion from "../logic/calculi/type_conversion";
import * as expr_ty from "../logic/calculi/static_semantics_expr";
import * as stmt_ty from "../logic/calculi/static_semantics_stmt";
import * as meta from "../logic/calculi/meta";
import * as hoare from "../logic/calculi/hoare";
import * as prog1_static from "../logic/calculi/static_prog1";
import { StringDispatchRenderer } from '../logic/syntax/renderer';
import React, { useEffect, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Options, calculiList, default_options } from './Options';
import { Calculus, combineCalculus, valuePremise } from '../logic/inference/inference_rules';
import { parse } from '../logic/syntax/parser';
import { Expr, Normalizer, Normalizers, mkApp } from '../logic/syntax/syntactic_logic';
import './InferenceInterface.css';
import { AliasTable } from './AliasTable';
import { CalculusTable } from './CalculusTable';
import Split from '@uiw/react-split';
import { Tree, stringTreeToTree, StringTree, goal_tree, treeToStringTree } from './Tree';
import { Button, IconButton } from '@mui/material';
import { InputDialog } from './InputDialog';
// import { PaneDirective, PanesDirective, SplitterComponent } from '@syncfusion/ej2-react-layouts';
// import { ReflexContainer, ReflexElement } from 'react-reflex';


const normalizationMaps: Normalizers[] = [
  hoare.normalizers,
]
// const calculus = color.calculus;
// const renderer = new StringDispatchRenderer();
// const goal = "Brown";

// const goal = "typed(Γ, BinOp(Minus, BinOp(Plus,Indir(x),y), 1), ?type)";
// const aliases_str = [
//   ["Extend(int, y, Γ)", "Γ'"],
//   ["Extend(int, x, Extend(int, y, emptyEnv))", "Γ"]
// ];

// const goal_raw = `
// stmt_typed(
//   Γ,
//   Block(
//   Seq(
//     Assign(y, 1),
//     Seq(
//       Block(
//         Seq(
//           Declare(int, y),
//           Seq(
//             Assign(y, x),
//             Term
//           )
//         )
//       ),
//       Term
//     )
//   )
// ))
// `.replaceAll("\n", "");
const goal =
`
typed(Extend(int, x, Extend(bool, y, Empty)), If(Id(y), Id(x), Const(0)), int)
`
//   ` stmt_typed(emptyEnv, 
//     Block(
//         Seq(
//             Declare(int, x),
//         Seq(
//             Declare(int, y),
//         Seq(
//             Declare(float, x),
//         Seq(
//             Assign(x, 3),
//             Term
//         ))))
//     )
// ) `
  // ` stmt_typed(emptyEnv, 
  //     Block(
  //         Seq(
  //             Declare(int, x),
  //         Seq(
  //             Declare(int, y),
  //         Seq(
  //             Assign(x, 3),
  //         Seq(
  //             Block(
  //                 Seq(
  //                     Declare(Ptr(int), x),
  //                 Seq(
  //                     Assign(x, Addr(y)),
  //                     Term
  //                 ))
  //             ),
  //         Seq(
  //             Assign(y,x),
  //             Term
  //         )))))
  //     )
  // ) `
  ;//.replaceAll("\n", "");
// const goal =
//   aliases_str.reduce((acc, [key, value]) => {
//     return acc.replaceAll(value, key);
//   }, goal_raw);

// const prettyRendererGenerator = (aliases, showAlias: boolean) => new StringDispatchRenderer(showAlias ? aliases : [])
//   .registerAppDispatcher(expr_ty.app_renderer).registerConstDispatcher(expr_ty.const_renderer)
//   .registerAppDispatcher(stmt_ty.app_renderer).registerConstDispatcher(stmt_ty.const_renderer);

// const initialAliases = aliases_str.reverse().map(([key, value]) => {
//   return [parse(key), parse(value)] as [Expr, Expr]
// });
const initialAliases: [Expr, Expr][] = [];
const plainRenderer = new StringDispatchRenderer();
// const prettyRenderer = prettyRendererGenerator(false);
// const prettyRendererWithAlias = prettyRendererGenerator(true);
// const initialCalculus = combineCalculus(
//   [
//     expr_ty.calculus,
//     stmt_ty.calculus,
//     type_conversion.calculus,
//     meta.calculus
//   ],
//   "Typing",
//   false
// );

function camelCaseToWords(str: string) {
  return str.replace(/([A-Z])/g, ' $1')
    .replace(/^./, function (str) { return str.toUpperCase(); })
}

function normalizeExpr(e: Expr): Expr {
  if (e.kind !== "app") {
    return e;
  }
  const f = normalizeExpr(e.callee);
  const args = e.args.map(normalizeExpr);
  const new_e = mkApp(f, args);
  if (f.kind !== "const")
    return new_e;

  const name = f.value;

  const normalizers: Normalizer[] =
    normalizationMaps.map(
      map =>
        [map[name], map["*"]]
    ).reduce((acc, x) => acc.concat(x), [])
      .filter(x => x !== undefined);

  const result: Expr = normalizers.reduce((acc: Expr, normalizer: Normalizer) => {
    return normalizer(acc);
  }, new_e);
  return result;
}

export function InferenceInterface() {
  const urlParams = new URLSearchParams(window.location.search);
  // let goal: string = "";

  // useEffect(() => {
  // goal = goal_raw;
  // if (urlParams.get("goal")) {
  //   goal = urlParams.get("goal") as string;
  // }

  // replace all aliases (on expr level would be better => order independent)
  // goal =
  //   aliases_str.reduce((acc, [key, value]) => {
  //     return acc.replaceAll(value, key);
  //   }, goal);
  // }, []);


  let paramOptions: Options = {
    ...default_options
  };

  // useEffect(() => {
  for (const _key in paramOptions) {
    const key = _key as keyof typeof paramOptions;
    const value = paramOptions[key];
    const option = urlParams.get(key);
    if (option) {
      const indexer = key as (keyof (typeof paramOptions));
      let new_value: any;
      if (typeof value === "boolean") {
        new_value = (option === "true") as any;
      } else if (typeof value === "number") {
        new_value = parseFloat(option) as any;
      } else {
        new_value = option as any;
      }
      // @ts-ignore
      paramOptions[indexer] = new_value as (typeof value);
    }
  }

  //   console.log("Default options: ", default_options);
  //   console.log("Param options: ", paramOptions);
  // }, [paramOptions, urlParams]);

  // wrap options into state
  const [options, setOptions] = React.useState<Options>(paramOptions);

  const [isMoveable, setIsMoveable] = React.useState<boolean>(false);

  const onDrag = () => {
    setIsMoveable(true)
  }
  const onStop = () => {
    setIsMoveable(false)
  }

  useEffect(() => {
    console.log("Options changed: ", options);
  }, [options]);

  const updateOption = (name: keyof Options, value: typeof options[keyof Options]) => {
    console.log("Updating option: ", name, value, "current options: ", options[name]);
    setOptions((prev) => {
      let new_options = { ...prev };
      // @ts-ignore
      new_options[name] = value;
      return new_options;
    });
  }

  const [aliases, setAliases] = React.useState<[Expr, Expr][]>(initialAliases);

  const prettyRendererGenerator = (showAlias: boolean) => new StringDispatchRenderer(showAlias ? aliases : [])
    .registerAppDispatcher(expr_ty.app_renderer).registerConstDispatcher(expr_ty.const_renderer)
    .registerAppDispatcher(stmt_ty.app_renderer).registerConstDispatcher(stmt_ty.const_renderer)
    .registerAppDispatcher(meta.app_renderer).registerConstDispatcher(meta.const_renderer)
    .registerAppDispatcher(hoare.app_renderer).registerConstDispatcher(hoare.const_renderer)
    .registerAppDispatcher(prog1_static.app_renderer).registerConstDispatcher(prog1_static.const_renderer)
    ;

  const usedRenderer = (withAlias: boolean) => {
    if (options.plainRenderer)
      return plainRenderer;
    return prettyRendererGenerator(withAlias && options.showAlias);
  }

  let initialCalculus;
  try {
    initialCalculus = combineCalculus(
      options.calculus.split(
        /[\s,]+/
      ).map((name) => {
        const calculus = calculiList.find((c) => c.name.toLowerCase() === name.toLowerCase());
        if (!calculus) {
          throw new Error(`Calculus ${name} not found`);
        }
        return calculus;
      }),
      "Custom",
      false
    );
  } catch (e) {
    console.error("Error while parsing calculus: ", e);
    initialCalculus = meta.calculus;
  }

  const [calculus, setCalculus] = React.useState<Calculus>(initialCalculus);




  let init_tree: Tree;

  // we use stringTree instead of Tree to safe a bit of space in the URL

  if (options.tree) {
    init_tree = stringTreeToTree(JSON.parse(options.tree) as StringTree);
  } else if (options.goal) {
    init_tree = goal_tree(valuePremise(parse(options.goal)));
  } else {
    init_tree = goal_tree(valuePremise(parse(goal)));
  }


  const [tree, setTree] = useState<Tree>(init_tree);

  // const [sizes, setSizes] = React.useState([
  //   100,
  //   // '20%',
  //   'auto',
  // ]);

  const [openGoalDialog, setOpenGoalDialog] = React.useState(false);
  const [openExportTreeDialog, setOpenExportTreeDialog] = React.useState(false);
  const [openExportRuleDialog, setOpenExportRuleDialog] = React.useState(false);

  const treeLink = (version: "goal" | "tree", addOptions = false) => {
    const urlParams = new URLSearchParams(window.location.search);
    if (addOptions) {
      for (const key in options) {
        const value = options[key as keyof Options];
        if (value !== undefined)
          urlParams.set(key, value.toString());
      }
    }
    // remove goal and tree
    urlParams.delete("goal");
    urlParams.delete("tree");
    if (version === "goal") {
      urlParams.set('goal', treeToStringTree(tree).conclusion);
    } else {
      urlParams.set('tree', JSON.stringify(treeToStringTree(tree)));
    }
    const url = window.location.origin + window.location.pathname + "?" + urlParams.toString();
    return url;
  };

  useEffect(() => {
    const _global = (window /* browser */ || global /* node */) as any
    _global.exportTree = () => {
      console.log("Exported tree: ", treeLink("tree"));
    };
  });

  return (
    <>
      <div className="InferenceInterface">
        {/* <SplitPane split='vertical' primary='second'
          defaultSize={options.minimalStyle ? "100%" : "80%"}
        > */}
        <div className="rowC">
          <Split style={{ height: "100%", width: "100%" }}>
            {
              (options.showRules || options.showAlias) &&
              <div className='leftcol'>
                {options.showAlias &&
                  <AliasTable
                    aliases={aliases}
                    setAliases={setAliases}
                    rendererGenerator={usedRenderer}
                  />
                }
                {options.showRules &&
                  <CalculusTable
                    calculus={calculus}
                    setCalculus={setCalculus}
                    renderer={usedRenderer(true)}
                    options={options}
                  />
                }
              </div>
              // </div>
            }
            <div className='rightcol'>
              <div className="UI">
                {options.showOptions &&
                  <div className="ControlSettings">
                    <div className="ControlSettings__Option">
                      {
                        Object.entries(options)
                          .filter(([key, value]) => typeof value === "boolean")
                          .map(([key, value]) => {
                            return (
                              <label>
                                <input type="checkbox" checked={value as boolean} onChange={() => updateOption(key as keyof Options, !value)} />
                                {camelCaseToWords(key)}
                              </label>
                            )
                          })
                      }
                    </div>
                  </div>
                }
                {options.showButtons &&
                  <div className="UIButtons">
                    <Button
                      onClick={() => {
                        setOpenGoalDialog(true);
                      }}
                    >
                      Change Goal
                    </Button>
                    <InputDialog
                      open={openGoalDialog}
                      setOpen={setOpenGoalDialog}
                      title="Change Goal"
                      description={"Enter a new goal. Share link for current goal: <a href=\"" + treeLink("goal") + "\">Share Link</a>"}
                      defaultValue={plainRenderer.render(tree.conclusion)}
                      onConfirm={(new_goal) => {
                        try {
                          setTree(goal_tree(valuePremise(parse(new_goal))));
                          return null;
                        } catch (e) {
                          return "Error parsing goal: " + e;
                        }
                      }}
                      readonly={false}
                    />

                    <Button
                      onClick={() => {
                        setOpenExportTreeDialog(true);
                      }}
                    >
                      Import/Export Tree
                    </Button>
                    <InputDialog
                      open={openExportTreeDialog}
                      setOpen={setOpenExportTreeDialog}
                      title="Tree Export"
                      description={
                        "Copy/Edit the following text to save/load the tree: <a href=\"" + treeLink("tree") + "\">Share Link</a>"
                      }
                      defaultValue={JSON.stringify(treeToStringTree(tree))}
                      onConfirm={(new_tree) => {
                        const current_tree = JSON.stringify(treeToStringTree(tree));
                        if (current_tree === new_tree) {
                          return null;
                        }
                        try {
                          const newTree = stringTreeToTree(JSON.parse(new_tree) as StringTree);
                          setTree(newTree);
                          return null;
                        } catch (e) {
                          return "Error parsing tree: " + e;
                        }
                      }}
                      readonly={false}
                    />

                    <Button
                      onClick={() => {
                        setOpenExportRuleDialog(true);
                      }}
                    >
                      Import/Export Rules
                    </Button>
                    <InputDialog
                      open={openExportRuleDialog}
                      setOpen={setOpenExportRuleDialog}
                      title="Rule Im/Export"
                      description={
                        "Copy/Edit the following text to save/load the rules:"
                      }
                      // TODO: first/last convert to string
                      defaultValue={JSON.stringify(calculus)}
                      onConfirm={(new_rules) => {
                        const current_rules = JSON.stringify(calculus);
                        if (current_rules === new_rules) {
                          return null;
                        }
                        try {
                          const newRules = JSON.parse(new_rules) as Calculus;
                          setCalculus(newRules);
                          return null;
                        } catch (e) {
                          return "Error parsing rules: " + e;
                        }
                      }}
                      readonly={false}
                    />

                  </div>
                }
              </div>
              <TransformWrapper
                initialScale={options.scale}
                disabled={isMoveable}
                minScale={.25}
                maxScale={1.5}
                limitToBounds={false}
                pinch={{ step: 5 }}
              >

                <TransformComponent
                  contentClass={"main" + (options.offset === "center" ? "_centered" : "")}
                  wrapperStyle={{
                    height: '100%', width: '100%',
                  }}>
                  <div className='InferenceArea'>
                    <TreeWrapper
                      calculus={calculus} renderer={usedRenderer(true)}
                      onDrag={onDrag} onStop={onStop}
                      options={options}
                      tree={tree} setTree={setTree}
                      normalization={normalizeExpr}
                    />
                  </div>

                </TransformComponent>
              </TransformWrapper >
            </div>
          </Split>
        </div>
        {/* </SplitPane> */}
      </div >
    </>
  );
}
