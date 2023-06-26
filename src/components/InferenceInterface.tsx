import { TreeWrapper } from '../components/TreeWrapper';
import * as color from "../logic/calculi/color";
import * as type_conversion from "../logic/calculi/type_conversion";
import * as expr_ty from "../logic/calculi/static_semantics_expr";
import * as stmt_ty from "../logic/calculi/static_semantics_stmt";
import * as meta from "../logic/calculi/meta";
import * as hoare from "../logic/calculi/hoare";
import { StringDispatchRenderer } from '../logic/syntax/renderer';
import React, { useEffect } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Options, default_options } from './Options';
import { Calculus, combineCalculus } from '../logic/inference/inference_rules';
import { parse } from '../logic/syntax/parser';
import { Expr } from '../logic/syntax/syntactic_logic';
import './InferenceInterface.css';
import { AliasTable } from './AliasTable';
import { CalculusTable } from './CalculusTable';
import SplitPane from 'react-split-pane';
// import { PaneDirective, PanesDirective, SplitterComponent } from '@syncfusion/ej2-react-layouts';
// import { ReflexContainer, ReflexElement } from 'react-reflex';

// const calculus = color.calculus;
// const renderer = new StringDispatchRenderer();
// const goal = "Brown";

// const goal = "typed(Γ, BinOp(Minus, BinOp(Plus,Indir(x),y), 1), ?type)";
const aliases_str = [
  ["Extend(int, y, Γ)", "Γ'"],
  ["Extend(int, x, Extend(int, y, emptyEnv))", "Γ"]
];

const goal_raw = `
stmt_typed(
  Γ,
  Block(
  Seq(
    Assign(y, 1),
    Seq(
      Block(
        Seq(
          Declare(int, y),
          Seq(
            Assign(y, x),
            epsilon
          )
        )
      ),
      epsilon
    )
  )
))
`.replaceAll("\n", "");
// const prettyRendererGenerator = (aliases, showAlias: boolean) => new StringDispatchRenderer(showAlias ? aliases : [])
//   .registerAppDispatcher(expr_ty.app_renderer).registerConstDispatcher(expr_ty.const_renderer)
//   .registerAppDispatcher(stmt_ty.app_renderer).registerConstDispatcher(stmt_ty.const_renderer);

const initialAliases = aliases_str.reverse().map(([key, value]) => {
  return [parse(key), parse(value)] as [Expr, Expr]
});
// replace all aliases (on expr level would be better => order independent)
const goal =
  aliases_str.reduce((acc, [key, value]) => {
    return acc.replaceAll(value, key);
  }, goal_raw);
const plainRenderer = new StringDispatchRenderer();
// const prettyRenderer = prettyRendererGenerator(false);
// const prettyRendererWithAlias = prettyRendererGenerator(true);
const initialCalculus = combineCalculus(
  [
    expr_ty.calculus,
    stmt_ty.calculus,
    type_conversion.calculus,
    meta.calculus
  ],
  "Typing",
  false
);

function camelCaseToWords(str: string) {
  return str.replace(/([A-Z])/g, ' $1')
    .replace(/^./, function (str) { return str.toUpperCase(); })
}


export function InferenceInterface() {

  const urlParams = new URLSearchParams(window.location.search);

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
    .registerAppDispatcher(stmt_ty.app_renderer).registerConstDispatcher(stmt_ty.const_renderer);

  const usedRenderer = (withAlias: boolean) => {
    if (options.plainRenderer)
      return plainRenderer;
    return prettyRendererGenerator(withAlias && options.showAlias);
  }

  const [calculus, setCalculus] = React.useState<Calculus>(initialCalculus);

  // const [sizes, setSizes] = React.useState([
  //   100,
  //   // '20%',
  //   'auto',
  // ]);

  return (
    <>
      <div className="InferenceInterface">
        {/* <SplitPane split='vertical' primary='second'
          defaultSize={options.minimalStyle ? "100%" : "80%"}
        > */}
        <div className="rowC">
          {
            !options.minimalStyle &&
            // <div style={
            //   {
            //     backgroundColor: "red",
            //   }
            // } >
            <div className='leftcol'>
              <AliasTable
                aliases={aliases}
                setAliases={setAliases}
                rendererGenerator={usedRenderer}
              />
              <CalculusTable
                calculus={calculus}
                setCalculus={setCalculus}
                renderer={usedRenderer(true)}
                options={options}
              />
            </div>
            // </div>
          }
          <div className='rightcol'>
            {!options.minimalStyle &&
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
                      }
                      )
                  }
                </div>
              </div>
            }
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
                    init={goal}
                    calculus={calculus} renderer={usedRenderer(true)}
                    onDrag={onDrag} onStop={onStop}
                    options={options}
                  />
                </div>

              </TransformComponent>
            </TransformWrapper >
          </div>
          {/* </SplitPane> */}
        </div>
      </div>
    </>
  );
}
