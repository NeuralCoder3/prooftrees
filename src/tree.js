import React from 'react';
import './tree.css';

import { v4 as uuidv4 } from 'uuid';
// import { MathComponent } from 'mathjax-react'

// https://www.npmjs.com/package/react-draggable
import Draggable from 'react-draggable';
import MathJax from 'react-mathjax';

function trim (s, c) {
  if (c === "]") c = "\\]";
  if (c === "^") c = "\\^";
  if (c === "\\") c = "\\\\";
  return s.replace(new RegExp(
    "^[" + c + "]+|[" + c + "]+$", "g"
  ), "");
}

function makeMath(s) {
    return <MathJax.Provider>
            <MathJax.Node inline formula={s} />
        </MathJax.Provider>;
}

function wrapMath(s) {
    s=s.trim();
    if(s.startsWith("$"))
        return makeMath(trim(s,"$"));
    else 
        return s;
}


// interface treeProp {
//   assumption: bool;
//   premises: Tree[];
//   conclusion: string;
//   prototype: bool;
// }

// interface treeState extends treeProp {
//   width: number;
//   height: number;
// }

// Axiom handled by premises
export const ruleTypes = {
	ASSUMPTION: "Assumption",
	HOLE: "Hole",
	RULE: "Rule",
}

class Tree extends React.Component {
    // <treeProp,treeState> {

    constructor(props) {
        super(props);
        var defaultProps = {
            type: ruleTypes.RULE,
            premises: [],
            conclusion: "Dummy",
            ruleName: "Text",
            prototype: false,
            // math: false,
        };
        this.state={};
        for(var p in defaultProps){
            if(!props[p]){
                this.state[p]=defaultProps[p];
            }else{
                this.state[p]=props[p];
            }
        }
        this.state = {
            width: 0,
            height: 0,
            uuid: "UUID-"+uuidv4(),
            ...this.state
        };
        this.containerDiv = React.createRef();
        this.state.conclusion=wrapMath(this.state.conclusion);
        this.state.ruleName=wrapMath(this.state.ruleName);
    }

    getPremises() {
        return this.state.premises;
    }


    componentDidMount() {
        this.adjustSize();
    }

    adjustSize() {
        if(this.containerDiv.current)
            this.setState({
                width: this.containerDiv.current.offsetWidth,
                height: this.containerDiv.current.offsetHeight
            });
    }

    componentWillUnmount() {
    }


    render() {
        // var premisesCode = this.state.premises;
        var premisesCode = [];
        for (var i = 0; i < this.state.premises.length; i++) {
            var t = this.state.premises[i];
            // t.ref=React.createRef();
            premisesCode.push(t);
            // if(!t.getState)
                // console.log(t);
            if(t.props.premises && t.props.premises.length>0)
                premisesCode.push(<hr style={{display:"inline-block",margin:"0 10px",border:"0px"}} />);
        }

        var premisesWidth=Math.max(this.state.width,100);
        return (
        <div style={{display:"inline-block"}} ref={this.containerDiv}>
            <center>{ premisesCode }</center>
            {this.state.type===ruleTypes.RULE ? 
                <div id={this.state.uuid} className="hr-sect" style={{width: premisesWidth+"px"}}>
                    {this.state.ruleName}
                </div> : <div /> }
            <center>
            {this.state.conclusion}
                <hr style={{display:"inline-block",margin:"0 10px",border:"0px"}} />
            </center>
        </div>
        );
            // {
            //     this.state.math ?
            //         <MathJax.Provider>
            //             <MathJax.Node inline formula={this.state.conclusion} />
            //         </MathJax.Provider>
            //         : this.state.conclusion
            // }
    }
}




class DragTree extends Tree {
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
            ...this.state
        };
    }

    setPos(e,data) {
        this.setState(state => ({
        x: data.x,
        y: data.y,
        }));
    }

    render() {
        var sPos=(e,data) => this.setPos(e,data);
  return (<Draggable 
    onStop={(e,data) => sPos(e,data)}
    handle={"#"+this.state.uuid}
  >
      {super.render()}
  </Draggable>);
    }
}


export {Tree, DragTree};