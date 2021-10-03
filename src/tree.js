import React from 'react';
import './tree.css';

import { v4 as uuidv4 } from 'uuid';

// https://www.npmjs.com/package/react-draggable
import Draggable from 'react-draggable';
// import reactable from 'reactablejs';

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
        // console.log(this.state.uuid);
        this.containerDiv = React.createRef();
    }


    componentDidMount() {
        this.adjustSize();
        // setTimeout(this.adjustSize,50);
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
            // if(i>0)
            //     premisesCode.push(<hr style={{display:"inline-block",margin:"0 10px",border:"0px"}} />);
            premisesCode.push(this.state.premises[i]);
            // last block for rule name
            premisesCode.push(<hr style={{display:"inline-block",margin:"0 10px",border:"0px"}} />);
        }

        var premisesWidth=Math.max(this.state.width,100);
            // <center><div ref={e => (this.conclDiv = e)}>{this.state.conclusion}</div></center>
        return (
        <div style={{display:"inline-block"}} ref={this.containerDiv}>
            <center>{ premisesCode }</center>
            {this.state.assumption ? <div /> : 
                <div id={this.state.uuid} class="hr-sect" style={{width: premisesWidth+"px"}}>
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
        // console.log(this.state.x);
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

// interface dragTreeState extends treeState {
//   x: number;
//   y: number;
// }

/*
class TreeWrap extends Tree {
    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
            ...this.state
        };
        // console.log(this.state);
    }

    move(dx,dy) {
        this.setState(state => ({
        x: state.x + dx,
        y: state.y + dy,
        }));
    }

    render() {
    // draggable
    // onDragMove={this.handleDragMove}
  return (<div
    style={{
      position: 'relative',
      left: this.state.x,
      top: this.state.y,
      display: "inline-block",
      background: 'grey',
    }}
    ref={this.props.getRef}
  >
      {super.render()}
  </div>);
    }
}

// const Child = (props: ChildProps) => (
//   <div
//     style={{
//       fontSize: '30px',
//       position: 'relative',
//       left: props.x,
//       top: props.y,
//       width: props.width,
//       height: props.height,
//       background: 'grey',
//       transform: `rotate(${props.angle}deg)`,
//     }}
//     ref={props.getRef}
//   >
//       Reactable is a react hight-order component for interactjs.
//   </div>
// )



const ReactableTree = reactable(TreeWrap);


class DragTree extends ReactableTree {
    constructor(props) {
        var handleDragMove = (e) => {
            const { dx, dy } = e
            this.setState(state => ({
                x: state.x + dx,
                y: state.y + dy,
            }))
        }
        super({
            draggable:true,
            onDragMove: handleDragMove,
            ...props
        });
        // this.onDragMove=this.handleDragMove;
    }

    // handleDragMove = (e) => {
    //     const { dx, dy } = e
    //     this.setState(state => ({
    //         x: state.x + dx,
    //         y: state.y + dy,
    //     }))
    // }

    render() {return super.render()}
}

*/

/*

class DragTree extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            x: 0,
            y: 0,
            ...props
        }
        this.tree = 
        <ReactableTree
          draggable
        //   gesturable
        //   resizable={{
        //     edges: { left: true, right: true, bottom: true, top: true },
        //   }}
          onDragMove={this.handleDragMove}
        //   onDoubleTap={this.handleDoubleTap}
        //   onGestureMove={this.handleGestureMove}
        //   onResizeMove={this.handleResizeMove}
          {...this.state}
        />;
;
    }

  handleDragMove = (e) => {
    const { dx, dy } = e
    this.tree.move(dx,dy);
    // this.setState(state => ({
    //   x: state.x + dx,
    //   y: state.y + dy,
    // }))
    // console.log(this.state);
  }
//   handleDoubleTap = (e) => {
//   }
//   handleGestureMove = (e) => {
//     const { da } = e
//   }
//   handleResizeMove = (e) => {
//     const { width, height } = e.rect
//     const { left, top } = e.deltaRect
//   }
  render() {
    //   this.tree.state.x=this.state.x;
    //   this.tree.state.y=this.state.y;
    return (<div>{this.tree}</div>);
//     return (
// <ReactableTree
//           draggable
//         //   gesturable
//         //   resizable={{
//         //     edges: { left: true, right: true, bottom: true, top: true },
//         //   }}
//           onDragMove={this.handleDragMove}
//         //   onDoubleTap={this.handleDoubleTap}
//         //   onGestureMove={this.handleGestureMove}
//         //   onResizeMove={this.handleResizeMove}
//           {...this.state}
//         />
//     );
  }
}

*/

/* 

const MyComponent = (props) => {
  return <div draggable ref={props.getRef}>
    hello, world!
  </div>
}
 
// MyComponent will receive getRef in props, put getRef to the element you want interact, then you can use all options and event handlers on Reactable
 
const DragTree = reactable(MyComponent);
 
*/

export {Tree, DragTree};