import React from 'react';
import logo from './logo.svg';
import './App.css';
import { DragWrapper } from './components/DragWrapper';
import Draggable from 'react-draggable';

function App() {
  const logo_component = (
    <div id="App-logo">
      <img src={logo} className="App-logo" alt="logo" />
    </div>
  );
  const text_component = (
    <p id="App-text">
      Edit <code>src/App.tsx</code> and save to reload.
    </p>
  );
  return (
    <div className="App">
      <header className="App-header">
        <DragWrapper
          posHandler={(last, next) => false}
          handleId="App-logo"
          child={logo_component}
        />
        <DragWrapper
          posHandler={(last, next) => false}
          handleId="App-text"
          child={text_component}
        />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <Draggable
          axis="x"
          handle=".handle"
          defaultPosition={{ x: 0, y: 0 }}
          // position={null}
          grid={[25, 25]}
          scale={1}
        >
          <div>
            <div className="handle">Drag from here</div>
            <div>This readme is really dragging on...</div>
          </div>
        </Draggable>
      </header>
    </div>
  );
}

export default App;
