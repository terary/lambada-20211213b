# gabby-query-protocol-lib

[![codecov](https://codecov.io/gh/terary/gabby-query-protocol-lib/branch/main/graph/badge.svg?token=3SBUXF77K9)](https://codecov.io/gh/terary/gabby-query-protocol-lib)
[![awesome](https://img.shields.io/badge/awesome-100%25-blue)](https://github.com/terary/gabby-query-protocol-lib)
[![Gabby Query Protocol](https://img.shields.io/badge/GQP-PredicateTree-blue)](https://github.com/terary/gabby-query-protocol-lib)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/terary/gabby-query-protocol-lib.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/terary/gabby-query-protocol-lib/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/terary/gabby-query-protocol-lib.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/terary/gabby-query-protocol-lib/context:javascript)

This package is the base library for Gabby Query Protocol.
It mostly focuses on the Predicate Formula aspects of GQP.

## Installation

Using npm:

`$ npm install gabby-query-protocol-lib`

### Documentation

[This Repo's docs](https://terary.github.io/gabby-query-protocol-lib/)

[Project's docs](https://terary.github.io/gabby-query-protocol-www/)

`./examples/*` contains executable snippets found in documentation.

### Description

This is a sub-project the Gabby Query Protocol. The purpose of this project is to provide utilities for building Predicate Trees.

### Terminology

_Predicate_ - a simple expression that evaluates to to true or false.
Properties: operator, subjectId, value.
Example: `{subjectId: "firstname", operator: "$eq", value: "barney"}`.

_Predicate Junction_ - an disjunction or conjunction expression.
Properties: operator
Example: `{operator: "$and"}`.

_Predicate Formula_ - coherent collection of predicate statements.

_Predicate Tree_ - The shape (coherent part) of the predicate statements.
Externally this is json representation of a _Directed Tree Graph_.
(I had better luck googling 'directed tree'). Each node exactly 1 parent, except root.
Any branch will have 2 or more children, AKA: no single child rule. This is differs from traditional directed trees.

![Predicate Tree](prdicate-tree.png?raw=true "Predicate Tree")

### Main Classes/Types

- see: src/common/type.ts - for pseudo-atomic types. Too many to list here
- See Repo documentation for further explanation.
- Examples (./examples/\*ts) have working examples.

#### IPredicateTree

```ts
export interface IPredicateTree {
  // visitor pattern.
  acceptVisitor(visitor: IVisitor<TPredicateNode>): void;

  appendPredicate(parentId: string, predicate: TPredicateNode): string;

  getChildrenIds(predicateId: string): string[];

  // returns TPredicateProperties | TPredicateJunctionPropsWithChildIds | null
  getPredicateById(predicateId: string): TPredicateNode | null;

  getPredicateByIdOrThrow(predicateId: string): TPredicateNode;

  // getPredicate - as TPredicateJunctionPropsWithChildIds  *preferred*
  getPredicateJunctionPropsById(
    predicateId: string
  ): TPredicateJunctionPropsWithChildIds | null;

  // getPredicate - as TPredicateProperties  *preferred*
  getPredicatePropsById(predicateId: string): TPredicateProperties | null;

  getPredicatePropsByIdOrThrow(predicateId: string): TPredicateProperties;

  getPredicateJunctionPropsByIdOrThrow(
    predicateId: string
  ): TPredicateJunctionPropsWithChildIds;

  isBranch(predicateId: string): boolean;

  removePredicate(predicateId: string): void;

  // for update purposes, alias coming soon.
  replacePredicate(predicateId: string, predicate: TPredicateNode): void;
  rootNodeId: string;

  toJson(): TSerializedPredicateTree;
}
```

#### Leaf Predicate (TPredicateProperties)

```ts
type TPredicateProperties = {
  subjectId: string;
  operator: TPredicateOperator;
  value: number | string; // this is the instance of Predicate, the type of this is
  // determined by the subject definition {subjectId, validOps, datatype...}
};
```

#### Branch Predicate (TPredicatePropertiesJunction)

```ts
type TPredicatePropertiesJunction = {
  operator: TPredicateJunctionOperator;
};
```

#### IPredicateSubjectDictionary

Should only be readOnly operators used for default values and validation.

```ts
export interface IPredicateSubjectDictionary
  extends IExportToJson<IPredicateSubjectDictionary, TPredicateSubjectDictionaryJson> {
  getOptionsList(subjectId: string): TPredicateSubjectOptionsList;
  // getAllSubjects(): TPredicateSubjectDictionary; // internal dictionary
  getSubjectIds(): string[];
  getSubject(subjectId: string): TPredicateSubjectWithId;
  //   getSubjectOrThrow(subjectId: string): TPredicateSubjectWithId;
  getDefaultSubject(): TPredicateSubjectWithId;
  makeEmptyPredicate(): TPredicateProperties;
  getColumns(): TPredicateSubjectAsColumnDefinition[];
  toJson(): TPredicateSubjectDictionaryJson;
}
```

### Example

```ts
import { PredicateFormulaEditorFactory, TPredicateProperties } from "../src";
import { EXAMPLE_JSON_BLUE_SKIES } from "../src";

const { predicateTreeJson } = EXAMPLE_JSON_BLUE_SKIES;
const { predicateSubjectsDictionaryJson: subjectDictionaryJson } =
  EXAMPLE_JSON_BLUE_SKIES;

export const predicateFormula = PredicateFormulaEditorFactory.fromJson({
  predicateTreeJson: predicateTreeJson,
  // predicateTreeJson is optional.
  // if undefined tree will be empty (like new document, start from scratch)

  subjectDictionaryJson: subjectDictionaryJson,
});

const newPredicate: TPredicateProperties = {
  operator: "$eq",
  subjectId: "firstName",
  value: "Barney",
};

const newPredicateId = predicateFormula.predicatesAppend(
  predicateFormula.rootNodeId,
  newPredicate
);

const toBeUpdatedPredicate = predicateFormula.predicatesGetPropertiesById(newPredicateId);
toBeUpdatedPredicate.value = "Betty";

predicateFormula.predicatesReplace(newPredicateId, toBeUpdatedPredicate);
console.log(JSON.stringify(predicateFormula.toJson(), null, 2));
```

### npm run

**gabby:build**  
Transpile to js includes source map
and types, target directory './dist'

**gabby:pack**  
Create npm friendly tgz package
