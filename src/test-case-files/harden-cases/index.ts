import blueSkiesPredicateTreeJson from "./predicate-tree-blue-skies.json";
import blueSkiesSubjectDictionaryJson from "./subject-dictionary-blue-skies.json";

import singleChildPredicateTreeJson from "./predicate-tree-single-child.json";
import circularRefPredicateTreeJson from "./predicate-tree-circular-reference.json";

import subjectDictionaryJson from "../test-subject-document.json";
import invalidPredicateWithSubjectJson from "./predicates-subject-validation.json";

export const blueSkiesJson = {
  subjectDictionaryJson: blueSkiesSubjectDictionaryJson,
  predicateTreeJson: blueSkiesPredicateTreeJson,
};

export const singleChildJson = {
  subjectDictionaryJson: blueSkiesSubjectDictionaryJson,
  predicateTreeJson: singleChildPredicateTreeJson,
};

export const circularRefJson = {
  subjectDictionaryJson: blueSkiesSubjectDictionaryJson,
  predicateTreeJson: circularRefPredicateTreeJson,
};

export const predicateInvalidSubjects = {
  subjectDictionaryJson: subjectDictionaryJson,
  predicateTreeJson: invalidPredicateWithSubjectJson,
};
