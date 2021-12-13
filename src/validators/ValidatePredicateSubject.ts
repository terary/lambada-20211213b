import { CONSTS } from "../common";
import { hasExactlyProperties, isString } from "./isFunctions";
import { TPredicateSubjectProperties, TPredicateSubjectPropertiesJson } from "../index";
import { IValidator } from "./types";
import { ValidateSubjectOperator } from "./ValidateSubjectOperator";
type SubjectPropertyIndex = keyof TPredicateSubjectProperties;

export const ValidatePredicateSubject: IValidator = (
  subjectId: string,
  subjectJson: TPredicateSubjectPropertiesJson,
  verbose = true
) => {
  const allErrorMessages: string[] = [];

  if (!isString(subjectId) || subjectId.length < 1) {
    allErrorMessages.push(`Subject Id is not a valid. SubjectId: '${subjectId}'.`);
    if (!verbose) {
      return {
        hasError: allErrorMessages.length > 0,
        errorMessages: allErrorMessages,
      };
    }
  }

  if (!hasExactlyProperties(subjectJson, ...CONSTS.SUBJECT_PROPERTIES)) {
    allErrorMessages.push(
      `Subject with id: ${subjectId} does not have exactly properties: '${CONSTS.SUBJECT_PROPERTIES.join(
        "', '"
      )}'`,
      `${subjectId}: provided properties: '${Object.keys(subjectJson).join("', '")}'`
    );
    if (!verbose) {
      return {
        hasError: allErrorMessages.length > 0,
        errorMessages: allErrorMessages,
      };
    }
  }

  ["defaultLabel", "datatype"].forEach((property) => {
    if (!isString(subjectJson[property as SubjectPropertyIndex])) {
      allErrorMessages.push(`Property: '${property}' is not a valid string type.`);
    }
  });

  if (!verbose && allErrorMessages.length > 0) {
    return {
      hasError: allErrorMessages.length > 0,
      errorMessages: allErrorMessages,
    };
  }

  if (!CONSTS.SUPPORTED_DATATYPES.includes(subjectJson.datatype || "DOES_NOT_EXIST")) {
    allErrorMessages.push(`Datatype '${subjectJson.datatype}' not valid.`);
    if (!verbose) {
      return {
        hasError: allErrorMessages.length > 0,
        errorMessages: allErrorMessages,
      };
    }
  }

  const { errorMessages: operatorValidationErrorMessages } = ValidateSubjectOperator(
    subjectJson["validOperators"]
  );

  allErrorMessages.push(...operatorValidationErrorMessages);

  return {
    hasError: allErrorMessages.length > 0,
    errorMessages: allErrorMessages,
  };
};
