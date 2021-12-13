import { PredicateSubjectDictionaryFactory } from ".";
import subjectJson from "../test-case-files/query-subjects-test-docs.json";
import { TPredicateSubjectDictionaryJson } from "./type";
const blueSkiesJson = subjectJson.blueSkies as TPredicateSubjectDictionaryJson;
const brokenAnyOfOptionsNoOptionListJson =
  subjectJson.brokenAnyOfOptionsNoOptionList as TPredicateSubjectDictionaryJson;
describe("PredicateSubjectDictionaryFactory", () => {
  describe("toJson", () => {
    it("Should export to Json", () => {
      const subjectDictionary = PredicateSubjectDictionaryFactory.fromJson(blueSkiesJson);
      const exportedJson = PredicateSubjectDictionaryFactory.toJson(subjectDictionary);

      expect(Object.keys(exportedJson).length).toBe(9);
      expect(exportedJson).toStrictEqual(blueSkiesJson);
    });
  }); // describe('toJson')
  describe("fromJson", () => {
    it("Should create from Json", () => {
      const knownSubjectId = [
        "firstname",
        "lastname",
        "annualRevenue",
        "numberOfEmployees",
        "region",
        "favoriteFruit",
        "favoriteNumber",
        "startDate",
        "nanyThese",
      ];
      const subjectDictionary = PredicateSubjectDictionaryFactory.fromJson(blueSkiesJson);
      expect(subjectDictionary.getSubjectIds()).toStrictEqual(knownSubjectId);
    });
    describe("Detected error conditions:", () => {
      [
        "datatypeMissing",
        "datatypeNotSupported",
        "missingOperatorLabelNotString",
        "missingOperatorLabelNotPresent",
        "missingOperatorLabelNull",
        "invalidOperator",
        "badOptionOptionListInvalidValue",
        "badOptionOptionListBadLabelName",
        "badOptionOptionListBadLabelValue",
        "badOptionOptionListBadValueName",
        "badOptionsScalar",
        "badOptionsMultiSelect",
        "brokenAnyOfOptionsNoOptionList",
        "brokenOneOfOptionsNoOptionList",
      ].forEach((condition) => {
        it(`${condition}`, () => {
          const conditionKey = condition as keyof typeof subjectJson;
          const willThrow = () => {
            PredicateSubjectDictionaryFactory.fromJson(
              subjectJson[conditionKey] as TPredicateSubjectDictionaryJson
            );
          };

          try {
            willThrow();
          } catch (e) {
            expect(e.constructor.name).toBe("PredicateTreeError");
            expect(e.message).toBe("JSON SubjectDictionary invalid");
            expect(e.debugMessages.length).toBeGreaterThan(0);
          }
        });
      }); // forEach((condition);
    });
  }); // describe('toJson')
});
