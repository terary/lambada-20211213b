import { PredicateTreeFactory } from "./PredicateTreeFactory";
import { cloneDeep } from "lodash";
import blueSkiesPredicateTreeJson from "../../test-case-files/predicate-tree-blue-skies.json";
import subjectDictionaryJson from "../../test-case-files/harden-cases/subject-dictionary-blue-skies.json";
import { TSerializedPredicateTree } from "..";
import { TPredicateSubjectDictionaryJson } from "../../index";
import { PredicateSubjectDictionaryFactory } from "../../PredicateSubjects";
import { assert } from "console";
import { PredicateTreeError } from "./PredicateTreeError";

const predicateTreeJson = cloneDeep(
  blueSkiesPredicateTreeJson
) as TSerializedPredicateTree;
const subjectDictionary = PredicateSubjectDictionaryFactory.fromJson(
  subjectDictionaryJson as TPredicateSubjectDictionaryJson
);

describe("PredicateTreeFactory", () => {
  describe(".fromJson", () => {
    it("Should convert JSON directed graph into PredicateTree ", () => {
      // setup
      let leafCount = 0;
      const rootCount = 1;

      // exercise
      const pTree = PredicateTreeFactory.fromJson(predicateTreeJson, subjectDictionary);

      // postConditions
      const childrenIds = pTree.getChildrenIds(pTree.rootNodeId);
      const childrenCount = childrenIds.length;

      childrenIds.forEach((childId) => {
        leafCount += pTree.getChildrenIds(childId).length;
      });

      expect(leafCount).toBe(6);
      expect(childrenCount).toBe(5);
      expect(rootCount + childrenCount + leafCount).toBe(
        Object.keys(predicateTreeJson).length
      );
      expect(rootCount + childrenCount + leafCount).toBe(12);
    });
    it("Should accept options object with 'newRootId' to be used as rootId for new tree.", () => {
      // setup
      let leafCount = 0;
      const rootCount = 1;

      const options = { newRootId: "newRoot" };
      const newRootRegExp = /newRoot/;

      // exercise
      const pTree = PredicateTreeFactory.fromJson(
        predicateTreeJson,
        subjectDictionary,
        options
      );

      // postConditions
      const pTreeJson = pTree.toJson();
      expect(Object.keys(pTreeJson).length).toBe(12);
      Object.keys(pTreeJson).forEach((key) => {
        expect(newRootRegExp.test(key)).toStrictEqual(true);
      });
    });
  }); // fromJson
  describe(".fromEmpty", () => {
    it("Should create empty predicate tree, with default subject as root predicate", () => {
      const initialRootPredicate = subjectDictionary.makeEmptyPredicate();
      const emptyTree = PredicateTreeFactory.fromEmpty(
        subjectDictionary,
        initialRootPredicate
      );

      expect(emptyTree.getChildrenIds(emptyTree.rootNodeId)).toStrictEqual([]);
      expect(emptyTree.getPredicateById(emptyTree.rootNodeId)).toStrictEqual(
        initialRootPredicate
      );
    });
    it("Should throw error if initial predicate is invalid", () => {
      const initialRootPredicate = { something: "invalid" };

      const willThrow = () => {
        const emptyTree = PredicateTreeFactory.fromEmpty(
          subjectDictionary,
          //@ts-ignore
          initialRootPredicate
        );
      };
      expect(willThrow).toThrowError(
        "Failed to initialize predicate tree with initial predicate."
      );
    });
    it("Should throw error if initial predicate is invalid, should have debug output", () => {
      const initialRootPredicate = { something: "invalid" };

      try {
        const emptyTree = PredicateTreeFactory.fromEmpty(
          subjectDictionary,
          //@ts-ignore
          initialRootPredicate
        );
      } catch (e) {
        expect(e).toBeInstanceOf(PredicateTreeError);
        // expect(e.message).toStrictEqual("something");
      }
    });
  });

  describe(".toJson", () => {
    it("Should create JSON predicate document", () => {
      const pTree = PredicateTreeFactory.fromJson(predicateTreeJson, subjectDictionary);

      //assert
      assert(Object.keys(pTree).length === 12);

      //exercise
      const exportedJson = PredicateTreeFactory.toJson(pTree);

      //post condition
      expect(Object.keys(exportedJson).length).toBe(12);
    });
  });
});
