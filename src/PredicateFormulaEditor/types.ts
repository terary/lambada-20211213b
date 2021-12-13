import type { TPredicateSubjectDictionaryJson, TSerializedPredicateTree } from "../index";
export type PredicateFormulaEditorJson = {
  predicateTreeJson?: TSerializedPredicateTree;
  subjectDictionaryJson: TPredicateSubjectDictionaryJson;
};
