import { Validators } from ".";
import { ValidatePredicateSubject } from "./ValidatePredicateSubject";

const subjectWithValidProperties = {
  datatype: "string",
  validOperators: {
    $eq: true,
  },
  defaultLabel: "Valid Subject Properties",
};

const verbose = true;

describe("ValidatePredicateSubject", () => {
  it("Should fail if subjectId empty or non string", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: ["Subject Id is not a valid. SubjectId: '3'."],
    };

    const actualResult = ValidatePredicateSubject(
      3,
      subjectWithValidProperties,
      !verbose
    );

    expect(actualResult).toStrictEqual(expectedResult);
  });

  it("Should verify subject has exactly properties: CONST.SUBJECT_PROPERTIES", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: [
        "Subject with id: testSubjectId does not have exactly properties: 'datatype', 'validOperators', 'defaultLabel'",
        "testSubjectId: provided properties: ''",
      ],
    };

    const actualResult = ValidatePredicateSubject("testSubjectId", {}, !verbose);

    expect(actualResult).toStrictEqual(expectedResult);
  });
  it("Should fail if 'datatype' or 'defaultLabel' are not strings", () => {
    const subjectWithWrongPropertyValueTypes = {
      datatype: 3,
      validOperators: new Date(),
      defaultLabel: () => 3,
    };
    const expectedResult = {
      hasError: true,
      errorMessages: [
        "Property: 'defaultLabel' is not a valid string type.",
        "Property: 'datatype' is not a valid string type.",
      ],
    };

    const actualResult = ValidatePredicateSubject(
      "badProperties",
      subjectWithWrongPropertyValueTypes,
      !verbose
    );

    expect(actualResult).toStrictEqual(expectedResult);
  });
  it("Should fail if 'datatype' not supported datatype", () => {
    const subjectWithWrongPropertyValueTypes = {
      datatype: "stringX",
      validOperators: new Date(),
      defaultLabel: "stringX not a type",
    };
    const expectedResult = {
      hasError: true,
      errorMessages: ["Datatype 'stringX' not valid."],
    };

    const actualResult = ValidatePredicateSubject(
      "badProperties",
      subjectWithWrongPropertyValueTypes,
      !verbose
    );

    expect(actualResult).toStrictEqual(expectedResult);
  });

  it("Should fail if 'validOperators' has no valid operators", () => {
    const subjectWithOperatorObject = {
      datatype: "string",
      validOperators: new Date(),
      defaultLabel: "the label",
    };
    const expectedResult = {
      hasError: true,
      errorMessages: ["No valid operators found."],
    };

    const actualResult = ValidatePredicateSubject(
      "badProperties",
      subjectWithOperatorObject,
      !verbose
    );

    expect(actualResult).toStrictEqual(expectedResult);
  });
  it("Should fail if 'validOperators' has any invalid operators", () => {
    const subjectWithOperatorObject = {
      datatype: "string",
      validOperators: { $eq: true, $eqx: true },
      defaultLabel: "the label",
    };
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator: '$eqx' is not supported."],
    };

    const actualResult = ValidatePredicateSubject(
      "badProperties",
      subjectWithOperatorObject,
      !verbose
    );

    expect(actualResult).toStrictEqual(expectedResult);
  });

  it("Should fail if 'validOperators' has any invalid operators", () => {
    const subjectWithOperatorObject = {
      datatype: "string",
      validOperators: { $eq: true, $anyOf: true },
      defaultLabel: "the label",
    };
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator '$anyOf' provided with an invalid option list"],
    };

    const actualResult = ValidatePredicateSubject(
      "badProperties",
      subjectWithOperatorObject,
      !verbose
    );

    expect(actualResult).toStrictEqual(expectedResult);
  });

  it("Should fail if 'validOperators' has any invalid operators", () => {
    const subjectWithOperatorObject = {
      datatype: "string",
      validOperators: { $eq: true, $anyOf: true },
      defaultLabel: "the label",
    };
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator '$anyOf' provided with an invalid option list"],
    };

    const actualResult = ValidatePredicateSubject(
      "badProperties",
      subjectWithOperatorObject,
      !verbose
    );

    expect(actualResult).toStrictEqual(expectedResult);
  });
}); // describe ValidatePredicateSubject;
