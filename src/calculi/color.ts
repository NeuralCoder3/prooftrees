import * as inference_rules from '../lib/inference_rules';

export const calculus : inference_rules.calculus = [
  // Axioms = primary colors
  {
    name: "Blue",
    conclusion: "Blue",
    premises: [],
  },
  {
    name: "Red",
    conclusion: "Red",
    premises: [],
  },
  {
    name: "Yellow",
    conclusion: "Yellow",
    premises: [],
  },
  // Secondary colors
  {
    name: "Green1",
    conclusion: "Green",
    premises: ["Blue", "Yellow"],
  },
  {
    name: "Green2",
    conclusion: "Green",
    premises: ["Yellow", "Blue"],
  },
  {
    name: "Orange",
    conclusion: "Orange",
    premises: ["Red", "Yellow"],
  },
  {
    name: "Purple",
    conclusion: "Purple",
    premises: ["Red", "Blue"],
  },
  // Tertiary colors
  {
    name: "Brown1",
    conclusion: "Brown",
    premises: ["Red", "Green"],
  },
  {
    name: "Brown2",
    conclusion: "Brown",
    premises: ["Purple", "Orange"],
  }
];
