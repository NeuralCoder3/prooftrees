import { TreeWrapper } from '../components/TreeWrapper';
import * as color from "../logic/calculi/color";
import * as type_conversion from "../logic/calculi/type_conversion";
import * as expr_ty from "../logic/calculi/static_semantics_expr";
import * as stmt_ty from "../logic/calculi/static_semantics_stmt";
import * as hoare from "../logic/calculi/hoare";
import { StringDispatchRenderer } from '../logic/syntax/renderer';
import React from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Options, default_options } from './Options';
import { combineCalculus } from '../logic/inference/inference_rules';

// const calculus = color.calculus;
// const renderer = new StringDispatchRenderer();
// const goal = "Brown";

const calculus = combineCalculus(
  [
    expr_ty.calculus,
    stmt_ty.calculus,
  ],
  "typed",
  false
);
const renderer = new StringDispatchRenderer()
  // ;
  .registerAppDispatcher(expr_ty.app_renderer).registerConstDispatcher(expr_ty.const_renderer)
  .registerAppDispatcher(stmt_ty.app_renderer).registerConstDispatcher(stmt_ty.const_renderer);
// const goal = "typed(Γ, BinOp(Minus, BinOp(Plus,Indir(x),y), 1), ?type)";
const goal = `
stmt_typed(Γ, Block(
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



export function InferenceInterface() {

  const urlParams = new URLSearchParams(window.location.search);

  let options: Options = {
    ...default_options
  };

  for (const _key in options) {
    const key = _key as keyof typeof options;
    const value = options[key];
    const option = urlParams.get(key);
    if (option) {
      const indexer = key as (keyof (typeof options));
      let new_value: any;
      if (typeof value === "boolean") {
        new_value = (option === "true") as any;
      } else if (typeof value === "number") {
        new_value = parseFloat(option) as any;
      } else {
        new_value = option as any;
      }
      // @ts-ignore
      options[indexer] = new_value as (typeof value);
    }
  }

  const [isMoveable, setIsMoveable] = React.useState<boolean>(false);

  const onDrag = () => {
    setIsMoveable(true)
  }
  const onStop = () => {
    setIsMoveable(false)
  }

  return (

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
          height: '100vh', width: '100vw'
        }}>
        <div className='InferenceArea'>
          <TreeWrapper
            init={goal}
            calculus={calculus} renderer={renderer}
            onDrag={onDrag} onStop={onStop}
            options={options}
          />
        </div>

      </TransformComponent>
    </TransformWrapper >
  );
}
