import './App.css';
import { TreeWrapper } from './components/TreeWrapper';
import { calculus as color_calculus } from './logic/calculi/color';

const calculus = color_calculus;

function App() {
  return (
    <div className="App">
      <TreeWrapper calculus={calculus} init={"Brown"} />
    </div>
  );
}

export default App;
