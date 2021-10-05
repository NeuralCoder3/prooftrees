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
        return s.length>0 ? s : "&nbsp;";
}



// Axiom handled by premises
export const ruleTypes = {
	ASSUMPTION: "Assumption",
	HOLE: "Hole",
	RULE: "Rule",
}

class Tree {
    constructor(options={}) {
        Object.assign(this,{
            type: ruleTypes.RULE,
            premises: [],
            conclusion: "Dummy",
            ruleName: "Text",
            prototype: false,
            parent: undefined,
            treeComp: undefined,
            uuid: "UUID-"+uuidv4(),
        },options);
        this.treeComp=<DragTree tree={this} />;
        this.conclusion=wrapMath(this.conclusion);
        this.ruleName=wrapMath(this.ruleName);
        // for(var [t,] of this.state.premises) {
        //     t.state.conclusion="Test";
        //     // console.log("Set parent of "+t.state.conclusion+" to "+this.state.conclusion);
        //     // console.log(t);
        //     t.state.parent=this;
        // }
    }
}

class TreeComp extends React.Component {
    // <treeProp,treeState> {

    constructor(props) {
        super(props);
        // probs should contain a tree
        // console.log("Create TreeComp with ",props);
        if(!props.tree){
            console.log("ill-formed treeComp construction")
            // add new hole tree => not accessible => Problem
        }
        this.state = {
            width: 0,
            height: 0,
        };
        this.containerDiv = React.createRef();
        // console.log(this.state.conclusion+": "+this.state.premises.length);
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
        let premises = this.props.tree.premises;
        for (var i = 0; i < premises.length; i++) {
            var t = premises[i];
            // t.ref=React.createRef();
            premisesCode.push(t.treeComp);
            // if(!t.getState)
                // console.log(t);
            // if(t.props.premises && t.props.premises.length>0)
            if(t && t.premises.length>0)
                premisesCode.push(<hr style={{display:"inline-block",margin:"0 10px",border:"0px"}} />);
        }

        var premisesWidth=Math.max(this.state.width,100);
        return (
        <div style={{display:"inline-block"}} ref={this.containerDiv}>
            <center>{ premisesCode }</center>
            {this.props.tree.type===ruleTypes.RULE ? 
                <div id={this.props.tree.uuid} className="hr-sect" style={{width: premisesWidth+"px"}}>
                    {this.props.tree.ruleName}
                </div> : <div /> }
            <center>
            <div style={{display: "inline-block"}} className={this.props.tree.type===ruleTypes.HOLE ? "dropzone" : ""} id={this.props.tree.type===ruleTypes.ASSUMPTION ? this.props.tree.uuid : "conclusion"}>
                {this.props.tree.conclusion}
            </div>
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




class DragTree extends TreeComp {
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
        // var [t,] = this.state.premises[0];
        console.log(this.props.tree);
        if(this.props.tree.parent && data.x*data.x+data.y*data.y>=100*100) {
            console.log("Detach");
            // console.log(window.findReactComponent(t));
            // console.log(window.FindReact(t));
        }
    }

    render() {
        var sPos=(e,data) => this.setPos(e,data);
  return (<Draggable 
    onStop={(e,data) => sPos(e,data)}
    handle={"#"+this.props.tree.uuid}
  >
      {super.render()}
  </Draggable>);
    }
}


export {TreeComp, Tree, DragTree};