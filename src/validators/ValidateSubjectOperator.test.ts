import { ValidateSubjectOperator } from "./ValidateSubjectOperator";

describe("ValidateSubjectOperator", () => {
  it("Should return hasError:false errorMessages:[] if valid operator (blue skies)", () => {
    const expectedResult = {
      hasError: false,
      errorMessages: [],
    };
    const operator = { $eq: true };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should *not* fail if operator is listed but set to false", () => {
    const expectedResult = {
      hasError: false,
      errorMessages: [],
    };
    const operator = { $eq: false };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should fail if operator is not one of the supported types", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator: '$eqx' is not supported."],
    };
    const operator = { $eqx: true };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should *not* fail $anyOf operator and provides valid option list (blue skies)", () => {
    const expectedResult = {
      hasError: false,
      errorMessages: [],
    };
    const operator = { $anyOf: { optionList: [{ label: "option one", value: "one" }] } };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should fail $anyOf operator and does not provide option list", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator '$anyOf' provided with an invalid option list"],
    };
    const operator = { $anyOf: true };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });

  it("Should fail $anyOf operator and does provides object option list", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator '$anyOf' provided with an invalid option list"],
    };
    const operator = { $anyOf: {} };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should fail $anyOf operator and  provides empty option list", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator '$anyOf' provided with an invalid option list"],
    };
    const operator = { $anyOf: [] };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should fail $anyOf operator and provides option list that is an empty option list", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator '$anyOf' provided with an invalid option list"],
    };
    const operator = { $anyOf: { optionList: [] } };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should fail if $anyOf operator provides invalid option list (bad label) ", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator '$anyOf' provided with an invalid option list"],
    };
    const operator = { $anyOf: { optionList: [{ labelx: "option one", value: "one" }] } };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should fail if $anyOf operator provides invalid option list (bad value) ", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator '$anyOf' provided with an invalid option list"],
    };
    const operator = { $anyOf: { optionList: [{ label: "option one", valuex: "one" }] } };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should *not* fail $oneOf operator and provides valid option list (blue skies)", () => {
    const expectedResult = {
      hasError: false,
      errorMessages: [],
    };
    const operator = { $oneOf: { optionList: [{ label: "option one", value: "one" }] } };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
  it("Should fail $oneOf operator and provides invalid option list", () => {
    const expectedResult = {
      hasError: true,
      errorMessages: ["Operator '$oneOf' provided with an invalid option list"],
    };
    const operator = {
      $oneOf: { optionList: [{ labelx: "option one", value: "xone" }] },
    };
    const actualResult = ValidateSubjectOperator(operator);

    expect(expectedResult).toStrictEqual(actualResult);
  });
});
