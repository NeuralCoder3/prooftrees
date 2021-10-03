import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './dragdrop.css';
import {Tree, DragTree, ruleTypes} from './tree';
import * as serviceWorker from './serviceWorker';




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

var tA=<DragTree conclusion="A" type={ruleTypes.ASSUMPTION} />;
var tB=<DragTree conclusion="X" premises={[tA]} />;
var tX=<DragTree conclusion="X -> Z" />;
var t=<DragTree  conclusion="Z" premises={[tB,tX]} />;

var h1=<DragTree conclusion="A" type={ruleTypes.HOLE} />;
var h2=<DragTree conclusion="B" type={ruleTypes.HOLE} />;
var t2=<DragTree conclusion="$A\land B$" ruleName="$\land:\text{Anw}$" premises={[h1,h2]} />;

ReactDOM.render(
    <div>
    {t}
    {t2}
    </div>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
