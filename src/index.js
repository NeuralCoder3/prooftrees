import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './dragdrop.css';
import {DragTree, ruleTypes} from './tree';
import * as serviceWorker from './serviceWorker';


// var _render = ReactDOM.render;
// ReactDOM.render = function () {
//     console.log(arguments);
//     return arguments[1].react = _render.apply(this, arguments);
// };

// function getReactDomComponent(dom) {
//   const internalInstance = dom[Object.keys(dom).find(key =>
//     key.startsWith('__reactInternalInstance$'))];
//   if (!internalInstance) return null;
//   return internalInstance._currentElement;
// }

// var tA=<Tree conclusion="A" assumption />;
// var tB=<Tree conclusion="X" premises={[tA]} />;
// var tX=<Tree conclusion="X -> Z" />;
// // var t=<Tree conclusion="Z" premises={[tB,tX]} />;
// var t=<DragTree conclusion="Z" premises={[tB,tX]} />;

// var rA=React.createRef();
// var rB=React.createRef();
// var rX=React.createRef();
// var rt=React.createRef();

// var tA=<DragTree ref={rA} conclusion="A" type={ruleTypes.ASSUMPTION} />;
// var tB=<DragTree ref={rB} conclusion="X" premises={[tA]} />;
// var tX=<DragTree ref={rX} conclusion="X -> Z" />;
// var t=<DragTree  ref={rt} conclusion="Z" premises={[tB,tX]} />;



// var tA=<DragTree conclusion="A" type={ruleTypes.ASSUMPTION} />;
// var tB=<DragTree conclusion="X" premises={[tA]} />;
// var tX=<DragTree conclusion="X -> Z" />;
// var t=<DragTree  conclusion="Z" premises={[tB,tX]} />;

// var h1=<DragTree conclusion="A" type={ruleTypes.HOLE} />;
// var h2=<DragTree conclusion="B" type={ruleTypes.HOLE} />;
// var t2=<DragTree conclusion="$A\land B$" ruleName="$\land:\text{Anw}$" premises={[h1,h2]} />;


// window.findReactComponent = function(el) {
//   for (const key in el) {
//     if (key.startsWith('__reactInternalInstance$')) {
//       const fiberNode = el[key];

//       return fiberNode && fiberNode.return && fiberNode.return.stateNode;
//     }
//   }
//   return null;
// };
// window.FindReact=function(dom, traverseUp = 0) {
//     const key = Object.keys(dom).find(key=>{
//         return key.startsWith("__reactFiber$") // react 17+
//             || key.startsWith("__reactInternalInstance$"); // react <17
//     });
//     const domFiber = dom[key];
//     if (domFiber == null) return null;

//     // react <16
//     if (domFiber._currentElement) {
//         let compFiber = domFiber._currentElement._owner;
//         for (let i = 0; i < traverseUp; i++) {
//             compFiber = compFiber._currentElement._owner;
//         }
//         return compFiber._instance;
//     }

//     // react 16+
//     const GetCompFiber = fiber=>{
//         //return fiber._debugOwner; // this also works, but is __DEV__ only
//         let parentFiber = fiber.return;
//         while (typeof parentFiber.type == "string") {
//             parentFiber = parentFiber.return;
//         }
//         return parentFiber;
//     };
//     let compFiber = GetCompFiber(domFiber);
//     for (let i = 0; i < traverseUp; i++) {
//         compFiber = GetCompFiber(compFiber);
//     }
//     return compFiber.stateNode;
// }




// var tA=<DragTree conclusion="A" type={ruleTypes.ASSUMPTION} />;
// // var tA=new DragTree({conclusion:"A",type:ruleTypes.ASSUMPTION});
// var tB=<DragTree conclusion="X" premises={[tA]} />;
// // var tX=<DragTree conclusion="X -> Z" />;
// // var t=<DragTree  conclusion="Z" premises={[tB,tX]} />;

// // var t = React.createElement(tA);
// var t=tB;
// // console.log(tA,tAO,t);
// // console.log(tA,tAO,t);
// console.log(tA);
// console.log(window.findReactComponent(tA));
// console.log(window.FindReact(tA));
// console.log(getReactDomComponent(tA));
// var tAR=ReactDOM.render(tA,document.getElementById('root'));
// console.log(window.findReactComponent(tAR));
// console.log(window.FindReact(tAR));
// console.log(getReactDomComponent(tAR));
// console.log(tAR);

// console.log(ReactTestUtils.findAllInRenderedTree());


// console.log(tA.react);

// // window.searchRoot = React.render(React.createElement......
// // var componentsArray = React.addons.TestUtils.findAllInRenderedTree(window.searchRoot, function() { return true; });


// create element with <DragTree >  (for rendering)
// store ref => at rendering create component instance   (for field and state access)
ReactDOM.render(
    <div>
    <div id="rootContent"></div>
    <div id="dummy"></div>
    </div>
    , document.getElementById('root'));

var tAR=<DragTree conclusion="A" type={ruleTypes.ASSUMPTION} />;
// var tA = ReactDOM.render(tAR,document.getElementById("dummy"));
// var dummy=document.createElement("div")
var tA = ReactDOM.render(tAR,document.createElement("div"));
var tBR=<DragTree conclusion="X" premises={[[tA,tAR]]} />;
var tB = ReactDOM.render(tBR,document.createElement("div"));
var tXR=<DragTree conclusion="X -> Z" />;
var tX = ReactDOM.render(tXR,document.createElement("div"));
var tR=<DragTree  conclusion="Z" premises={[[tB,tBR],[tX,tXR]]} />;
var t  = ReactDOM.render(tR ,document.createElement("div"));

// Problem: render twice => are the instances correct?

// var tA, tB, tX, t;
// var tAR=<DragTree ref={el => tA = el}  conclusion="A" type={ruleTypes.ASSUMPTION} />;
// var tBR=<DragTree ref={el => tB = el} conclusion="X" premises={[[tA,tAR]]} />;
// var tXR=<DragTree ref={el => tX = el} conclusion="X -> Z" />;
// var tR=<DragTree  ref={el => t  = el} conclusion="Z" premises={[[tB,tBR],[tX,tXR]]} />;


ReactDOM.render(
    <div>
    {tR}
    </div>
    , document.getElementById('rootContent'));

    // console.log(tA,tAR);
    // console.log(tX,tXR);
    // console.log(tB,tBR);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
