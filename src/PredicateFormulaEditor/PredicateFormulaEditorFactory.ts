import { PredicateFormulaEditor } from "./PredicateFormulaEditor";
import type { PredicateFormulaEditorJson } from "./types";
import type { TPredicateSubjectDictionaryJson } from "../PredicateSubjects";
import type { TPredicateTreeFactoryOptions } from "../Predicates";
import { TPredicatePropertiesArrayValue, TPredicateProperties } from "..";

export const PredicateFormulaEditorFactory = {
  fromEmpty: (
    subjectDictionaryJson: TPredicateSubjectDictionaryJson,
    initialRootPredicate: TPredicatePropertiesArrayValue | TPredicateProperties,
    options?: TPredicateTreeFactoryOptions
  ): PredicateFormulaEditor => {
    return PredicateFormulaEditor.fromEmpty(
      subjectDictionaryJson,
      initialRootPredicate,
      options
    );
  },

  fromJson: (
    json: PredicateFormulaEditorJson,
    initialRootPredicate?: TPredicatePropertiesArrayValue | TPredicateProperties,
    options?: TPredicateTreeFactoryOptions
  ): PredicateFormulaEditor => {
    return PredicateFormulaEditor.fromJson(json, initialRootPredicate, options);
  },

  toJson: (
    predicateFormulaEditor: PredicateFormulaEditor
  ): PredicateFormulaEditorJson => {
    return predicateFormulaEditor.toJson();
  },
};
