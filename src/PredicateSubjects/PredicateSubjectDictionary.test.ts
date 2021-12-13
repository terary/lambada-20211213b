/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-empty-function */
import { PredicateSubjectDictionary } from "./PredicateSubjectDictionary";

import subjectJson from "../test-case-files/query-subjects-test-docs.json";
import { TPredicateSubjectDictionaryJson } from "./type";
const blueSkiesJson = subjectJson.blueSkies as TPredicateSubjectDictionaryJson;
const brokenAnyOfOptionsNoOptionListJson =
  subjectJson.brokenAnyOfOptionsNoOptionList as TPredicateSubjectDictionaryJson;

describe("SubjectDictionary", () => {
  describe(".getAllSubjects()", () => {
    let subjectDictionary: PredicateSubjectDictionary;
    beforeEach(() => {
      subjectDictionary = PredicateSubjectDictionary.fromJson(
        blueSkiesJson as TPredicateSubjectDictionaryJson
      );
    });

    it("Should return all subjects in a TPredicateSubjectDictionary structure", () => {
      const allSubjects = subjectDictionary.getAllSubjects();
      const expectedKeys = [
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
      expect(Object.keys(allSubjects)).toStrictEqual(expectedKeys);
    });
  }); // describe(".getAllSubjects()"
  describe(".getDefaultSubject()", () => {
    let subjectDictionary: PredicateSubjectDictionary;
    beforeEach(() => {
      subjectDictionary = PredicateSubjectDictionary.fromJson(blueSkiesJson);
    });

    it("Should return the first Subject", () => {
      const expectedSubject = {
        subjectId: "firstname",
        defaultLabel: "First Name",
        datatype: "string",
        validOperators: {
          $eq: true,
          $gt: true,
          $like: true,
        },
      };
      expect(subjectDictionary.getDefaultSubject()).toStrictEqual(expectedSubject);
    });
    it("Should return an empty object if dictionary is empty", () => {
      const emptyTree = new PredicateSubjectDictionary();
      expect(emptyTree.getDefaultSubject()).toStrictEqual({});
    });
  }); // describe(".getDefaultSubject()"
  describe(".makeEmptyPredicate()", () => {
    let subjectDictionary: PredicateSubjectDictionary;
    beforeEach(() => {
      subjectDictionary = PredicateSubjectDictionary.fromJson(blueSkiesJson);
    });

    it("Should create a default projection subject", () => {
      expect(subjectDictionary.makeEmptyPredicate()).toStrictEqual({
        operator: "$eq",
        subjectId: "firstname",
        value: "",
      });
    });
  });
  describe(".getOptionsList()", () => {
    let subjectDictionary: PredicateSubjectDictionary;
    beforeEach(() => {
      subjectDictionary = PredicateSubjectDictionary.fromJson(blueSkiesJson);
    });
    it("Should always return an object {$anyOf:[...],$oneOf:[...]} (subjectId=emptyString)", () => {
      const expected = { $anyOf: [], $nanyOf: [], $oneOf: [] };
      expect(subjectDictionary.getOptionsList("")).toStrictEqual(expected);
    });
    it("Should always return an object {$anyOf:[...],$oneOf:[...]} (subjectId=undefined)", () => {
      const expected = { $anyOf: [], $nanyOf: [], $oneOf: [] };
      // @ts-ignore
      expect(subjectDictionary.getOptionsList()).toStrictEqual(expected);
    });
    it("Should always return an object {$anyOf:[...],$oneOf:[...]} (subject has no options))", () => {
      const expected = { $anyOf: [], $nanyOf: [], $oneOf: [] };
      expect(subjectDictionary.getOptionsList("numberOfEmployees")).toStrictEqual(
        expected
      );
    });
    it("Should always return an object {$anyOf:[...],$oneOf:[...]} ($oneOf has options))", () => {
      const $oneOf = [
        { label: "One", value: 1 },
        { label: "Two", value: 2 },
        { label: "Three", value: 3 },
      ];
      const expected = { $anyOf: [], $nanyOf: [], $oneOf };
      expect(subjectDictionary.getOptionsList("favoriteNumber")).toStrictEqual(expected);
    });
    it("Should always return an object {$anyOf:[...],$oneOf:[...]} ($anyOf has options))", () => {
      const $anyOf = [
        { label: "US West", value: "US-WEST" },
        { label: "US East", value: "US-EAST" },
        { label: "US South", value: "US-SOUTH" },
        { label: "US North", value: "US-NORTH" },
      ];
      const expected = { $anyOf, $nanyOf: [], $oneOf: [] };
      expect(subjectDictionary.getOptionsList("region")).toStrictEqual(expected);
    });
    it("Should always return an object {$anyOf:[...],$oneOf:[...]} ($nanyOf has options))", () => {
      const $nanyOf = [
        { label: "One", value: 1 },
        { label: "Two", value: 2 },
        { label: "Three", value: 3 },
      ];
      const expected = { $anyOf: [], $nanyOf, $oneOf: [] };
      expect(subjectDictionary.getOptionsList("nanyThese")).toStrictEqual(expected);
    });
  }); // describe('getOptionsList'
  describe("instantiation", () => {
    describe(".fromJson()", () => {
      it("Should create from json object", () => {
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
        const subjectDictionary = PredicateSubjectDictionary.fromJson(blueSkiesJson);
        expect(subjectDictionary.getSubjectIds()).toStrictEqual(knownSubjectId);
      });
    });
  }); // describe("instantiation",
  describe(".getColumns", () => {
    it("Should produce an array of columns", () => {
      const subjectDictionary = PredicateSubjectDictionary.fromJson(blueSkiesJson);

      // exercise
      const columns = subjectDictionary.getColumns();

      // postConditions
      expect(columns.length).toBe(9);
      columns.forEach((columnData) => {
        const { datatype, defaultLabel } = subjectDictionary.getSubject(
          columnData.subjectId
        );
        expect(datatype).toStrictEqual(columnData.datatype);
        expect(defaultLabel).toStrictEqual(defaultLabel);
      });
    });
  }); //
});
