import type { TPredicateNode } from "../../index";

const simplePredicates = {
  root: {
    subjectId: "theRoot",
    operator: "$eq",
    value: "The Root",
  } as TPredicateNode,
  child0: {
    subjectId: "child0",
    operator: "$eq",
    value: "Child Zero",
  } as TPredicateNode,
  child1: {
    subjectId: "child1",
    operator: "$eq",
    value: "Child One",
  } as TPredicateNode,
  child2: {
    subjectId: "child2",
    operator: "$eq",
    value: "Child Two",
  } as TPredicateNode,
  grandchild0: {
    subjectId: "grandchild0",
    operator: "$eq",
    value: "Grandchild Zero",
  } as TPredicateNode,
  grandchild1: {
    subjectId: "grandchild1",
    operator: "$eq",
    value: "Grandchild One",
  } as TPredicateNode,
};


export { simplePredicates };
