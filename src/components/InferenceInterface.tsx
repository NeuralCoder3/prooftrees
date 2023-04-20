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

const calculus = color.calculus;
const renderer = new StringDispatchRenderer();
const goal = "Brown";

// const calculus = expr_ty.calculus;
// const type_renderer = new StringDispatchRenderer()
//   .registerAppDispatcher(expr_ty.app_renderer).registerConstDispatcher(expr_ty.const_renderer);
// const goal = "typed(Γ, BinOp(Minus, BinOp(Plus,Indir(x),y), 1), ?type)";

export function InferenceInterface() {

  let initial_scale = 1.0;

  if (window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    const scale = urlParams.get('scale');
    if (scale) {
      initial_scale = parseFloat(scale);
    }
  }

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
      initialScale={initial_scale}
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
          />
        </div>
        {/* </div> */}

      </TransformComponent>
    </TransformWrapper >
  );
}
