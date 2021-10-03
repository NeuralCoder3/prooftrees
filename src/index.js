import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './dragdrop.css';
import App from './App';
import {Tree, DragTree} from './tree';
import * as serviceWorker from './serviceWorker';

// var tA=<Tree conclusion="A" assumption />;
// var tB=<Tree conclusion="X" premises={[tA]} />;
// var tX=<Tree conclusion="X -> Z" />;
// // var t=<Tree conclusion="Z" premises={[tB,tX]} />;
// var t=<DragTree conclusion="Z" premises={[tB,tX]} />;

var tA=<DragTree conclusion="A" assumption />;
var tB=<DragTree conclusion="X" premises={[tA]} />;
var tX=<DragTree conclusion="X -> Z" />;
var t=<DragTree conclusion="Z" premises={[tB,tX]} />;

ReactDOM.render(
    <div>
    {t}
    <App />
    </div>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
