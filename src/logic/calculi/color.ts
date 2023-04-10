import * as inference_rules from '../inference/inference_rules';
import * as logic from '../syntax/syntactic_logic';

// https://www.overleaf.com/read/csfvyggxptqr

const blue = logic.mkConst("Blue");
const red = logic.mkConst("Red");
const yellow = logic.mkConst("Yellow");
const green = logic.mkConst("Green");
const orange = logic.mkConst("Orange");
const purple = logic.mkConst("Purple");
const brown = logic.mkConst("Brown");

export const calculus: inference_rules.calculus = inference_rules.mkCalculus("Color", [
  // Axioms = primary colors
  {
    name: "Blue",
    conclusion: blue,
    premises: [],
  },
  {
    name: "Red",
    conclusion: red,
    premises: [],
  },
  {
    name: "Yellow",
    conclusion: yellow,
    premises: [],
  },
  // Secondary colors
  {
    name: "Green1",
    conclusion: green,
    premises: [blue, yellow],
  },
  {
    name: "Green2",
    conclusion: green,
    premises: [yellow, blue],
  },
  {
    name: "Orange",
    conclusion: orange,
    premises: [red, yellow],
  },
  {
    name: "Purple",
    conclusion: purple,
    premises: [red, blue],
  },
  // Tertiary colors
  {
    name: "Brown1",
    conclusion: brown,
    premises: [red, green],
  },
  {
    name: "Brown2",
    conclusion: brown,
    premises: [purple, orange],
  }
]);
