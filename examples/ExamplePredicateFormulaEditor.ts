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
