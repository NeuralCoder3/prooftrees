import * as inference_rules from '../lib/inference_rules';

export const calculus : inference_rules.calculus = [
  {
    name:"int",
    conclusion:"?i1 <-> ?i2",
    premises:["is_int(?i1)", "is_int(?i2)"]
  }
