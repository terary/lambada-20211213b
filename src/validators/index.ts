import { NoSingleChildRule } from "./NoSingleChildRule";
import { ValidateAllPredicatesAgainstOperator } from "./ValidateAllPredicatesAgainstOperator";
import { ValidatePredicateAgainstOperator } from "./ValidatePredicateAgainstOperator";
import { ValidateSubjectDictionary } from "./ValidateSubjectDictionary";

export type { TValidatorResponse } from "./types";
export type { IValidatePredicateAgainstOperator } from "./ValidatePredicateAgainstOperator";

export const Validators = {
  ValidateAllPredicatesAgainstOperator,
  NoSingleChildRule,
  ValidatePredicateAgainstOperator,
  ValidateSubjectDictionary,
};
