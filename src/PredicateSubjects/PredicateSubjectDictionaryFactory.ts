import { PredicateSubjectDictionary } from "./PredicateSubjectDictionary";
import { PredicateTreeError } from "../Predicates/PredicateTree/PredicateTreeError";
import { Validators } from "../validators";
import type { TPredicateSubjectDictionaryJson } from "./type";

export namespace PredicateSubjectDictionaryFactory {
  export function fromJson(
    json: TPredicateSubjectDictionaryJson
  ): PredicateSubjectDictionary {
    // TODO - *tmc* - seems if no valid operators it throws generic message
    //        not PredicateTreeError, no debug messages
    const { hasError, errorMessages } = Validators.ValidateSubjectDictionary(json);

    if (hasError) {
      throw new PredicateTreeError("JSON SubjectDictionary invalid", errorMessages);
    }

    return PredicateSubjectDictionary.fromJson(json);
  }

  export function toJson(
    subjectDictionary: PredicateSubjectDictionary
  ): TPredicateSubjectDictionaryJson {
    return subjectDictionary.toJson() as TPredicateSubjectDictionaryJson;
  }
}
