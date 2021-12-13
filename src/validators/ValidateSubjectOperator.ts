import { TOperatorOptions, TValidOperatorList, TValueLabelList } from "../index";
import { CONSTS } from "../index";
import { hasExactlyProperties } from "./isFunctions";
import { IValidator } from "./types";

export const ValidateSubjectOperator: IValidator = (
  operatorTuples: TValidOperatorList
) => {
  const allErrorMessages: string[] = [];
  if (Object.keys(operatorTuples).length === 0) {
    allErrorMessages.push("No valid operators found.");
  }

  Object.entries(operatorTuples).forEach(([operator, prop]) => {
    if (!CONSTS.PREDICATE_OPERATORS.includes(operator)) {
      allErrorMessages.push(`Operator: '${operator}' is not supported.`);
    }
    if (operator === "$anyOf") {
      if (!prop) {
        allErrorMessages.push(`Operator '$anyOf' provided with an invalid option list`);
      } else if (!isValidOptionList((prop as TOperatorOptions).optionList)) {
        allErrorMessages.push(`Operator '$anyOf' provided with an invalid option list`);
      }
    }
    if (operator === "$oneOf") {
      if (!prop) {
        allErrorMessages.push(`Operator '$oneOf' provided with an invalid option list`);
      } else if (!isValidOptionList((prop as TOperatorOptions).optionList)) {
        allErrorMessages.push(`Operator '$oneOf' provided with an invalid option list`);
      }
    }
  });

  return {
    hasError: allErrorMessages.length > 0,
    errorMessages: allErrorMessages,
  };
};

const isValidOptionList = (optionList: TValueLabelList | undefined) => {
  if (!optionList) {
    return false;
  }
  if (!Array.isArray(optionList)) {
    return false;
  }
  if (optionList.length === 0) {
    return false;
  }
  const invalidOptions = optionList.filter((option) => {
    return !hasExactlyProperties(option, "value", "label");
  });
  return invalidOptions.length === 0;
};
