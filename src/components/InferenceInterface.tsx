import { TreeWrapper } from '../components/TreeWrapper';
// import { calculus as color_calculus } from './logic/calculi/color';
import * as color from "../logic/calculi/color";
import * as type_conversion from "../logic/calculi/type_conversion";
import * as expr_ty from "../logic/calculi/static_semantics_expr";
import * as stmt_ty from "../logic/calculi/static_semantics_stmt";
import * as hoare from "../logic/calculi/hoare";
import { StringDispatchRenderer } from '../logic/syntax/renderer';
import React, { useContext } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { Options, default_options } from './Options';

// const calculus = color.calculus;
// const renderer = new StringDispatchRenderer();
// const goal = "Brown";

const calculus = expr_ty.calculus;
const renderer = new StringDispatchRenderer()
  .registerAppDispatcher(expr_ty.app_renderer).registerConstDispatcher(expr_ty.const_renderer);
const goal = "typed(Γ, BinOp(Minus, BinOp(Plus,Indir(x),y), 1), ?type)";


export function InferenceInterface() {

  // let initial_scale = 1.0;

  const urlParams = new URLSearchParams(window.location.search);
  // if (window.location.search) {
  //   const scale = urlParams.get('scale');
  //   if (scale) {
  //     initial_scale = parseFloat(scale);
  //   }
  // }

  // parse options
  // for (const [key : keyof typeof options, value] of Object.entries(options)) {

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

  // options =
  //   Object.fromEntries(
  //     Object.entries(options).map(([key, value]) => {
  //       const option = urlParams.get(key);
  //       if (option) {
  //         let new_value: any;
  //         if (typeof value === "boolean") {
  //           new_value = (option === "true") as any;
  //         } else if (typeof value === "number") {
  //           new_value = parseFloat(option) as any;
  //         } else {
  //           new_value = option as any;
  //         }
  //         return [key, new_value];
  //       } else {
  //         return [key, value];
  //       }
  //     })
  //   ) as typeof options;

  // let key: keyof typeof options;
  // for (key in options) {
  //   const value = options[key];
  //   const option = urlParams.get(key);
  //   if (option) {
  //     const indexer = key as (keyof (typeof options));
  //     let new_value: any;
  //     if (typeof value === "boolean") {
  //       new_value = (option === "true") as any;
  //       options[indexer] = new_value as (typeof value);
  //     } else if (typeof value === "number") {
  //       new_value = parseFloat(option) as any;
  //       options[indexer] = new_value as (typeof value);
  //     } else {
  //       new_value = option as any;
  //       options[indexer] = new_value as (typeof value);
  //     }
  //     // options[indexer] = new_value as (typeof value);
  //   }
  // }

  // const context = useContext(AppContext)
  const [isMoveable, setIsMoveable] = React.useState<boolean>(false);

  const onDrag = () => {
    setIsMoveable(true)
    //etc
  }
  const onStop = () => {
    setIsMoveable(false)
    //etc 
  }

  return (

    <TransformWrapper
      initialScale={options.scale}
      disabled={isMoveable}
      minScale={.25}
      maxScale={1.5}
      limitToBounds={false}
      // onPanning={updateXarrow}
      // onZoom={updateXarrow}
      pinch={{ step: 5 }}
    >

      <TransformComponent
        contentClass='main'
        wrapperStyle={{
          height: '100vh', width: '100vw'
        }}>
        {/* <div> */}
        <div className='InferenceArea'>
          <TreeWrapper
            init={goal}
            calculus={calculus} renderer={renderer}
            onDrag={onDrag} onStop={onStop}
            // onClick={onInteracting} onEndClick={onInteractingEnd}
            // onClick={onDrag} onEndClick={onStop}
            options={options}
          />
        </div>
        {/* </div> */}

      </TransformComponent>
    </TransformWrapper >
  );
}
