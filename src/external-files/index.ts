import type { TPredicateSubjectDictionaryJson, TSerializedPredicateTree } from "../";

import predicateSubjectsDictionaryJson from "./subject-dictionary-blue-skies.json";
import serializedPredicateTree from "./predicate-tree-blue-skies.json";

export const EXAMPLE_JSON_BLUE_SKIES = {
  predicateSubjectsDictionaryJson:
    predicateSubjectsDictionaryJson as TPredicateSubjectDictionaryJson,
  predicateTreeJson: serializedPredicateTree as TSerializedPredicateTree,
};
