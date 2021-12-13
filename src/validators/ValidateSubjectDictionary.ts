import { TPredicateSubjectDictionaryJson } from "../PredicateSubjects";
import { TValidatorResponse } from "./types";
import { ValidatePredicateSubject } from "./ValidatePredicateSubject";

export const ValidateSubjectDictionary = (
  subjects: TPredicateSubjectDictionaryJson
): TValidatorResponse => {
  const allErrors: string[] = [];
  if (Object.keys(subjects || {}).length === 0) {
    allErrors.push("Subject Dictionary has no subjects");
  }

  Object.entries(subjects).forEach(([subjectId, subjectProperties]) => {
    const { errorMessages } = ValidatePredicateSubject(subjectId, subjectProperties);
    allErrors.push(...errorMessages);
  });

  return {
    hasError: allErrors.length > 0,
    errorMessages: allErrors,
  };
};
