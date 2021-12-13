import { CONSTS } from "../index";
import type {
  TPredicateSubjectWithId,
  TPredicateProperties,
  TPredicateNodeJson,
  IPredicateSubjectDictionary,
  TOperatorOptions,
} from "../index";
import {
  hasExactlyProperties,
  isDateISO8601String,
  isInteger,
  isNumeric,
  isString,
} from "./isFunctions";
import { IValidator, TValidatorResponse } from "./types";

export interface IValidatePredicateAgainstOperator {
  (
    predicateJson: TPredicateNodeJson,
    subjects: IPredicateSubjectDictionary
  ): TValidatorResponse;
}

export const ValidatePredicateAgainstOperator: IValidatePredicateAgainstOperator = (
  predicateJson: TPredicateNodeJson,
  subjects: IPredicateSubjectDictionary
) => {
  if (!hasExactlyProperties(predicateJson, ...CONSTS.PREDICATE_PROPERTIES)) {
    return {
      hasError: true,
      errorMessages: [
        `Predicate JSON does not contain exactly keys: '${CONSTS.PREDICATE_PROPERTIES.join(
          "', '"
        )}'.`,
        `Predicate JSON: '${JSON.stringify(predicateJson)}'.`,
      ],
    };
  }

  const predicate = predicateJson as TPredicateProperties;
  const subject = subjects.getSubject(predicate.subjectId);
  if (!subject) {
    return {
      hasError: true,
      errorMessages: [`Invalid subject id: '${predicate.subjectId}'`],
    };
  }

  if (!Object.keys(subject.validOperators).includes(predicate.operator)) {
    return {
      hasError: true,
      errorMessages: [
        `Predicate operator not valid for subject.`,
        `Predicate subject Id '${predicate.subjectId}', operator ${predicate.operator}`,
      ],
    };
  }

  if (predicate.operator === "$anyOf") {
    return isValidOptionOf(predicate, subject, "$anyOf");
  }

  if (predicate.operator === "$nanyOf") {
    return isValidOptionOf(predicate, subject, "$nanyOf");
  }

  if (predicate.operator === "$oneOf") {
    return isValidOptionOf(predicate, subject, "$oneOf");
  }

  if (predicate.operator === "$isNull") {
    return isNullValue(predicate);
  }

  if (subject.datatype === "string") {
    return isValidString(predicate);
  }

  if (subject.datatype === "datetime") {
    return isValidDatetime(predicate);
  }

  if (subject.datatype === "decimal") {
    return isValidDecimal(predicate);
  }

  if (subject.datatype === "integer") {
    return isValidInteger(predicate);
  }

  // We should never reach this. Coverage complains
  return { hasError: true, errorMessages: ["Failed to detect datatype"] };
};

const isValidInteger: IValidator = (predicate: TPredicateProperties) => {
  if (isInteger(predicate.value)) {
    return { hasError: false, errorMessages: [] };
  }
  return {
    hasError: true,
    errorMessages: [
      `Value: '${predicate.value}' does not appear to be valid valid integer`,
      "Validation is sensitive to quoted numbers",
    ],
  };
};

const isNullValue: IValidator = (predicate: TPredicateProperties) => {
  if (predicate.value === null) {
    return { hasError: false, errorMessages: [] };
  }
  return {
    hasError: true,
    errorMessages: [
      `${predicate.subjectId} value: '${predicate.value}' does not appear to be valid 'null' `,
      "$isNull operator only accepts null for value",
    ],
  };
};

const isValidDecimal: IValidator = (predicate: TPredicateProperties) => {
  if (isNumeric(predicate.value)) {
    return { hasError: false, errorMessages: [] };
  }
  return {
    hasError: true,
    errorMessages: [
      `Value: '${predicate.value}' does not appear to be valid decimal`,
      "Validation is sensitive to quoted numbers",
    ],
  };
};

const isValidString: IValidator = (predicate: TPredicateProperties) => {
  if (isString(predicate.value)) {
    return { hasError: false, errorMessages: [] };
  }
  return {
    hasError: true,
    errorMessages: [`Value: '${predicate.value}' does not appear to be valid string`],
  };
};

const isValidDatetime: IValidator = (predicate: TPredicateProperties) => {
  if (isDateISO8601String(predicate.value)) {
    return { hasError: false, errorMessages: [] };
  }

  return {
    hasError: true,
    errorMessages: [
      `Value: '${predicate.value}' does not appear to be valid ISO8601 date format`,
    ],
  };
};

const isValidOptionOf: IValidator = (
  predicate: TPredicateProperties,
  subject: TPredicateSubjectWithId,
  operator: "$anyOf" | "$nanyOf" | "$oneOf"
) => {
  if (isValidOption(predicate, subject, operator)) {
    return {
      hasError: false,
      errorMessages: [],
    };
  } else {
    const validOptions = getValidOptionValues(subject, operator);
    const userFriendlyInvalidOption = Array.isArray(predicate.value)
      ? `'${predicate.value.join("', '")}'`
      : predicate.value;
    return {
      hasError: true,
      errorMessages: [
        `option: ${userFriendlyInvalidOption} is not a valid option for subject: ${predicate.subjectId}`,
        `Valid options include: '${validOptions.join("', '")}'`,
      ],
    };
  }
};

const getValidOptionValues = (
  subject: TPredicateSubjectWithId,
  operator: "$anyOf" | "$nanyOf" | "$oneOf"
) => {
  const options = (subject.validOperators[operator] as TOperatorOptions).optionList || [];
  return options.map((option) => option.value);
};

const isValidOption = (
  predicate: TPredicateProperties,
  subject: TPredicateSubjectWithId,
  operator: "$anyOf" | "$nanyOf" | "$oneOf"
): boolean => {
  const validOptionValues = getValidOptionValues(subject, operator);
  const selectedOptions =
    operator === "$anyOf" || operator === "$nanyOf" ? predicate.value : [predicate.value];

  for (let opt of selectedOptions as (string | number)[]) {
    if (!validOptionValues.includes(opt)) {
      return false;
    }
  }
  return true;
};
