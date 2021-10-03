import React from 'react';
import './tree.css';

import { v4 as uuidv4 } from 'uuid';

// https://www.npmjs.com/package/react-draggable
import Draggable from 'react-draggable';

interface treeProp {
  assumption: bool;
  premises: Tree[];
  conclusion: string;
  prototype: bool;
}

interface treeState extends treeProp {
  width: number;
  height: number;
}

class Tree extends React.Component<treeProp,treeState> {

    constructor(props) {
        super(props);
        var defaultProps = {
            assumption: false,
            premises: [],
            conclusion: "Dummy",
            prototype: false
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
        var premisesCode = [];
        for (var i = 0; i < this.state.premises.length; i++) {
            premisesCode.push(this.state.premises[i]);
            // last block for rule name
            premisesCode.push(<hr style={{display:"inline-block",margin:"0 10px",border:"0px"}} />);
        }

        var premisesWidth=Math.max(this.state.width,100);
        return (
        <div style={{display:"inline-block"}} ref={this.containerDiv}>
            <center>{ premisesCode }</center>
            {this.state.assumption ? <div /> : 
                <div id={this.state.uuid} className="hr-sect" style={{width: premisesWidth+"px"}}>
                    Text
                </div>}
            <center>{this.state.conclusion}</center>
        </div>
        );
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