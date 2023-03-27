


## Unification Inference

In this repository, we explore the idea that inference proofs (and such FOL) can be expressed/reduced as a unification problems. 

We present rules in an abstract way as a combination of a conclusion and a set of premises. 
The unification happens between the goal that should be proven using an inference proof derivation and the conclusion of the rule resulting in new premises.

### Usage

The needed packages can be installed using `npm install`.

To run the example provided in `index.ts` use `npm start`.

The tests can be run using `npm test`.

### Overview

This code is a quick exploration in a generalized unification approach to inference.
The following features are currently implemented:
- most general unification of arbitrary predicate logic terms
- parsing of predicate logic terms
- rendering using expandable pretty printing
- handling of substitutions (application, consistent fresh renaming)
- generation of inference rules and calculi
- application of inference rules
- handling of unification results including variable instantiation
- some sample calculi (fully supported: type conversion, static semantics (expression, statement, program), hoare logic)

#### Files

We give a short guidance through the code.

We represent terms using the type
```OCaml
data Expr = Const of String | Var of String | App of (Expr, Expr list)
```
where `Const` represents constants and `Var` variables.

The logic part of the code is located in the `lib/logic` folder.
- parser: parsing of predicate logic terms including constants and variables (prefixed using `?`)
- renderer: a pretty printer for terms generalized over the output type, expandable using dispatcher for constant and function symbols
- syntactic_logic: syntax and general operations on terms

The inference specific logic is located in the `lib` folder.
- inference_rules: handling of rules (application, renaming, printing) and calculi
- unification: unification of terms and handling of unification results

Lastly, we test our approach on some calculi in the `calculi` folder.
- Color: a simple caclulus with unqualified syntactic rules
- type_conversion: a calculus to determine whether types are convertible
- static_semantics_expr: typing rules for expressions in a subset of C
- static_semantics_stmt: typing rules for statements and programs in a subset of C
- hoare: a calculus for Hoare logic

#### Tests

We just provide some unit tests that inspect a happy-path execution and some edge cases.
The tests are not complete and do not provide strong guarantees.
They demonstrate the usage of functions and make sure a minimal functionality is provided.

Tests are implemented using jest and are placed grouped by files in `[file].test.ts`.

### Theory

Unification is tightly connected to the idea of inference, logic, and reasoning.
Applying inference rules is a form of unification where the student matches the goal with the conclusion of the rule to derive new premises. In some cases, additional free variables have to be instantiated using creativity or remaining proof steps.

On first thought, one can see inference rules as string with placeholders.
The unification problem becomes identifying the placeholders and replacing them with the correct terms.
Hereby, the terms are substring of arbitrary length that could also contain placeholders themselves.

For instance, `A ?x D` and `A B ?y C D` can be unified by replacing `?x` with `B ?z C` and `?y` with `?z`.
An additional problem from overlapping unifications can be seen in `a?X` and `?Yb` which are unified to `a?Zb`.

Therefore, word level splitting is insufficient.
This unification problem is hard and in this form not discussed in common literature.
A similar problem is the edit-distance problem where the goal is to transform one string into another by inserting, deleting, or replacing characters. The characters would be subterm in our case.

However, we could transfer this problem into a classic unification problem by splitting the string at minimal block intervals and formulating the problem using append/concatenation.
The resulting problem is an AI/AU-unification problem where the goal is to unify the terms modulo associativity and identity as semantic properties of the syntactic operations.
The problem is known to be solvable but is NP-complete and difficult to implement and apply.

Alternatively, we could make use of the structure of inference rules and interpret them as syntactic predicate logic terms.
The unification problem becomes a syntactic unification of terms, and thus, ammendable to Robinson's algorithm (or versions like Martelli, Montarnari, Paterson, Wegman).

This algorithm is easy to implement with basic knowledge of automated reasoning and runs in linear time.
