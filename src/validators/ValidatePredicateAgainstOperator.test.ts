import { PredicateSubjectDictionary } from "../index";
import { TPredicateSubjectDictionaryJson } from "../PredicateSubjects";
import { TPredicateNodeJson } from "../index";
import subjectDictionaryJson from "../test-case-files/test-subject-document.json";
import testPredicates from "../test-case-files/validation/predicates-validation.json";
import { ValidatePredicateAgainstOperator } from "./ValidatePredicateAgainstOperator";

const subjectDictionary = PredicateSubjectDictionary.fromJson(
  subjectDictionaryJson as TPredicateSubjectDictionaryJson
);
describe("ValidatePredicateAgainstOperator", () => {
  describe("Blue Skies", () => {
    it("Should return no error", () => {
      expect(
        ValidatePredicateAgainstOperator(
          testPredicates.blueSkies.root.payload as TPredicateNodeJson,
          subjectDictionary
        )
      ).toStrictEqual(NoError);
    });
  });
  describe("Thing it should do", () => {
    it("Should fail for missing properties", () => {
      const predicateJson = testPredicates.missingProperty.predicateJson.payload;

      const expectedResult = {
        hasError: true,
        errorMessages: [
          "Predicate JSON does not contain exactly keys: 'operator', 'value', 'subjectId'.",
          expect.any(String),
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail for extra properties", () => {
      const predicateJson = testPredicates.extraProperty.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "Predicate JSON does not contain exactly keys: 'operator', 'value', 'subjectId'.",
          expect.any(String),
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail invalid subjectId", () => {
      const predicateJson = testPredicates.invalidSubjectId.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: ["Invalid subject id: 'DOES_NOT_EXIST'"],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail if operator is invalid", () => {
      const predicateJson = testPredicates.invalidOperator.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "Predicate operator not valid for subject.",
          "Predicate subject Id 'lastname', operator $ex",
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });

    it("Should fail if operator is invalid for specified subject", () => {
      const predicateJson = testPredicates.invalidSubjectOperator.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "Predicate operator not valid for subject.",
          "Predicate subject Id 'lastname', operator $lt",
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should *not* fail for valid $anyOf options (blue skies)", () => {
      const predicateJson = testPredicates.validAnyOfOption.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should *not* fail for valid $nanyOf options (blue skies)", () => {
      const predicateJson = testPredicates.validNanyOfOption.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail for invalid $anyOf options (blue skies)", () => {
      const predicateJson = testPredicates.invalidAnyOfOption.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "option: 'CANADA-SOUTH', 'MX-NORTH' is not a valid option for subject: region",
          "Valid options include: 'US-WEST', 'US-EAST', 'US-SOUTH', 'US-NORTH'",
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail for invalid $nanyOf options (blue skies)", () => {
      const predicateJson = testPredicates.invalidNanyOfOption.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "option: 'CANADA-SOUTH', 'MX-NORTH' is not a valid option for subject: notAnyOneSubject",
          "Valid options include: 'US-WEST', 'US-EAST', 'US-SOUTH', 'US-NORTH'",
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });

    it("Should *not* fail for valid $onOf options (blue skies)", () => {
      const predicateJson = testPredicates.validOneOfOption.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail for invalid $anyOf options (blue skies)", () => {
      const predicateJson = testPredicates.invalidOneOfOption.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "option: NOT_AN_OPTION is not a valid option for subject: favoriteFruit",
          "Valid options include: 'APPLE001', 'GRAPE001', 'ORANGE001'",
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should *not* fail for valid string datatype (blue skies)", () => {
      const predicateJson = testPredicates.validString.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail for invalid string datatype (blue skies)", () => {
      const predicateJson = testPredicates.invalidString.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: ["Value: '9' does not appear to be valid string"],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should *not* fail for valid datetime datatype (blue skies)", () => {
      const predicateJson = testPredicates.validDatetime.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail for invalid datetime datatype (blue skies)", () => {
      const predicateJson = testPredicates.invalidDatetime.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "Value: 'June 29, 2021' does not appear to be valid ISO8601 date format",
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should *not* fail for valid decimal datatype (blue skies)", () => {
      const predicateJson = testPredicates.validDecimal.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should *not* fail for integer (integers can be represented as decimals)", () => {
      const predicateJson = testPredicates.invalidDecimal.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should *not* fail for valid integer datatype (blue skies)", () => {
      const predicateJson = testPredicates.validInteger.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail for invalid integer datatype", () => {
      const predicateJson = testPredicates.invalidInteger.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "Value: '231' does not appear to be valid valid integer",
          "Validation is sensitive to quoted numbers",
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should *not* fail if setting value to 'null'.  value is always required, used or not", () => {
      const predicateJson = testPredicates.validIsNullWithNullValue.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should fail  $isNull has value other than null ", () => {
      const predicateJson = testPredicates.invalidIsNullWithValue.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "isNullSubject value: '231' does not appear to be valid 'null' ",
          "$isNull operator only accepts null for value",
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should $isNull operator fails if there is no value ", () => {
      const predicateJson =
        testPredicates.invalidIsNullWithoutValue.predicateJson.payload;
      const expectedResult = {
        hasError: true,
        errorMessages: [
          "Predicate JSON does not contain exactly keys: 'operator', 'value', 'subjectId'.",
          'Predicate JSON: \'{"operator":"$isNull","subjectId":"isNullSubject"}\'.',
        ],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
    it("Should *not* $empty operator empty string", () => {
      // other datatypes should not be empty?
      // valid operators and datatype are determined on subject dictionary.
      // we will not test that here.
      const predicateJson = testPredicates.validIsEmpty.predicateJson.payload;
      const expectedResult = {
        hasError: false,
        errorMessages: [],
      };

      const actualResult = ValidatePredicateAgainstOperator(
        predicateJson as TPredicateNodeJson,
        subjectDictionary
      );

      expect(actualResult).toStrictEqual(expectedResult);
    });
  });
}); //

const NoError = {
  hasError: false,
  errorMessages: [],
};
