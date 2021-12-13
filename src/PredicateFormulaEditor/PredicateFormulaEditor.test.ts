import {
  blueSkiesJson,
  singleChildJson,
  circularRefJson,
  predicateInvalidSubjects,
} from "../test-case-files/harden-cases";
import { PredicateFormulaEditorFactory } from "./PredicateFormulaEditorFactory";
import type { PredicateFormulaEditorJson } from "./types";
import { PredicateTreeError } from "../Predicates/PredicateTree/PredicateTreeError";
import { DirectedTreeError } from "../Predicates/DirectedTreeGraph";
import { PredicateFormulaEditor } from "./PredicateFormulaEditor";
import { VisitorNodeCounter } from "../Predicates/DirectedTreeGraph/VisitorNodeCounter";
import { Validators } from "../validators";
import { TPredicateSubjectDictionaryJson } from "../PredicateSubjects";
import { predicateFormula } from "../../examples";
import { TPredicateProperties } from "..";

describe("PredicateFormulaEditor", () => {
  it("Should be create formula editor without issue (smoke test)", () => {
    const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
      blueSkiesJson as PredicateFormulaEditorJson
    );
    expect(predicateFormulaEditor.subjectsGetAllIds().sort()).toStrictEqual(
      [
        "firstName",
        "isEmptySubject",
        "isNullSubject",
        "lastName",
        "notEqualSubject",
      ].sort()
    );
    const predicateChildren = predicateFormulaEditor.predicatesGetChildrenIds(
      predicateFormulaEditor.rootNodeId
    );
    expect(predicateChildren).toStrictEqual(["flatFileTest:0", "flatFileTest:1"]);
  });
  it("Should be create formula editor, predicate tree optional", () => {
    // this behavior has changed.  Now if now predicateJson provide,
    // client code should use fromEmpty and provide initialRootPredicate

    const initialRootPredicate: TPredicateProperties = {
      subjectId: "firstName",
      operator: "$eq",
      value: "Initial Root Predicate",
    };

    const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
      {
        subjectDictionaryJson:
          blueSkiesJson.subjectDictionaryJson as TPredicateSubjectDictionaryJson,
      },
      initialRootPredicate
    );
    expect(predicateFormulaEditor.subjectsGetAllIds().sort()).toStrictEqual(
      [
        "firstName",
        "isEmptySubject",
        "isNullSubject",
        "lastName",
        "notEqualSubject",
      ].sort()
    );

    const predicate = predicateFormulaEditor.predicatesGetPropertiesById(
      predicateFormulaEditor.rootNodeId
    );
    const predicateChildren = predicateFormulaEditor.predicatesGetChildrenIds(
      predicateFormulaEditor.rootNodeId
    );

    expect(predicate.operator).toBeDefined();
    expect(predicate.subjectId).toBeDefined();
    expect(predicate.value).toBeDefined();

    expect(predicateChildren).toStrictEqual([]);
  });
  it(".fromJson Should throw error if json elements are undefined", () => {
    const willThrow = () => {
      const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
        {} as PredicateFormulaEditorJson
      );
    };
    expect(willThrow).toThrow(
      "Can not build tree from undefined subjection dictionary json."
    );
    expect(willThrow).toThrow(PredicateTreeError);
  });
  it(".fromJson Should throw error if json is undefined", () => {
    const willThrow = () => {
      const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
        //@ts-ignore
        undefined as PredicateFormulaEditorJson
      );
    };
    expect(willThrow).toThrow("Can not build tree from undefined json.");
    expect(willThrow).toThrow(PredicateTreeError);
  });
  it(".fromEmpty Should throw error if json is undefined", () => {
    const initialRootPredicate: TPredicateProperties = {
      subjectId: "firstname",
      operator: "$eq",
      value: "Initial Root Predicate",
    };
    const willThrow = () => {
      const predicateFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
        {} as PredicateFormulaEditorJson,
        initialRootPredicate
      );
    };
    expect(willThrow).toThrow(
      "Build tree failed due to subjection dictionary errors. See debug messages for more details"
    );
    expect(willThrow).toThrow(PredicateTreeError);
  });
  it("Should be create formula editor with initialRootPredicate  without issue (smoke test)", () => {
    const initialRootPredicate: TPredicateProperties = {
      subjectId: "firstName",
      operator: "$eq",
      value: "Initial Root Predicate",
    };

    //
    // exercise
    const predicateFormulaEditor = PredicateFormulaEditorFactory.fromEmpty(
      blueSkiesJson.subjectDictionaryJson as TPredicateSubjectDictionaryJson,
      initialRootPredicate
    );

    // postConditions
    expect(predicateFormulaEditor.subjectsGetAllIds().sort()).toStrictEqual(
      [
        "firstName",
        "isEmptySubject",
        "isNullSubject",
        "lastName",
        "notEqualSubject",
      ].sort()
    );
    const predicateChildren = predicateFormulaEditor.predicatesGetChildrenIds(
      predicateFormulaEditor.rootNodeId
    );
    const rootPredicate = predicateFormulaEditor.predicatesGetPropertiesById(
      predicateFormulaEditor.rootNodeId
    );

    expect(predicateChildren).toStrictEqual([]);
    expect(rootPredicate).toStrictEqual(initialRootPredicate);
  });
  it("Should be create formula editor with custom rootNode", () => {
    const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
      blueSkiesJson as PredicateFormulaEditorJson,
      undefined,
      { newRootId: "myAwesomeRoot" }
    );
    expect(predicateFormulaEditor.subjectsGetAllIds().sort()).toStrictEqual(
      [
        "firstName",
        "isEmptySubject",
        "isNullSubject",
        "lastName",
        "notEqualSubject",
      ].sort()
    );
    const predicateTreeJson = predicateFormulaEditor.predicatesToJsonTree();
    const predicateIdRegEx = /myAwesomeRoot/;
    expect(Object.keys(predicateTreeJson).length).toBe(5);
    Object.keys(predicateTreeJson).forEach((key) => {
      expect(predicateIdRegEx.test(key)).toStrictEqual(true);
    });
  });
  it("Should be create formula editor with custom rootNode", () => {
    const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
      blueSkiesJson as PredicateFormulaEditorJson
    );
    const spy = jest.spyOn(predicateFormulaEditor.subjectDictionary, "getDefaultSubject");
    expect(predicateFormulaEditor.subjectsGetDefault);

    // exercise
    predicateFormulaEditor.subjectsGetDefault();
    expect(spy).toHaveBeenCalled();
  });

  describe("Import ", () => {
    it("Should throw error single child ", () => {
      const singleChildError = () => {
        const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
          singleChildJson as PredicateFormulaEditorJson
        );
      };
      expect(singleChildError).toThrow(PredicateTreeError);
      expect(singleChildError).toThrow(
        "Provided PredicateTree JSON breaks no single child rule."
      );
      try {
        singleChildError();
      } catch (e) {
        const otherMessages = (e as PredicateTreeError).debugMessages;
        expect(otherMessages).toStrictEqual([
          "Branch with ID: 'flatFileTest:1' fails 2 or more children rule.",
        ]);
      }
    });

    it("Should throw error orphan/circular reference", () => {
      const singleChildError = () => {
        const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
          circularRefJson as PredicateFormulaEditorJson
        );
      };
      expect(singleChildError).toThrow(DirectedTreeError);
      expect(singleChildError).toThrow(/Orphan nodes or circular reference detected/i);
    });
    it("Should validate predicates against subject", () => {
      //predicateInvalidSubjects
      const invalidPredicateError = () => {
        const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
          predicateInvalidSubjects as unknown as PredicateFormulaEditorJson
        );
      };
      expect(invalidPredicateError).toThrow(PredicateTreeError);
      expect(invalidPredicateError).toThrow(
        "Failed to convert JSON to usable PredicateTree"
      );

      try {
        invalidPredicateError();
      } catch (e) {
        const otherMessages = (e as PredicateTreeError).debugMessages;
        expect(otherMessages.length).toBe(17);
      }
    });
  });

  describe("Wrapped Methods", () => {
    let predicateFormulaEditor: PredicateFormulaEditor;
    beforeEach(() => {
      predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
        blueSkiesJson as PredicateFormulaEditorJson
      );
    });
    it("acceptVisitor calls predicateTree.acceptVisitor", () => {
      const spy = jest.spyOn(predicateFormulaEditor.predicateTree, "acceptVisitor");
      predicateFormulaEditor.predicatesAcceptVisitor(new VisitorNodeCounter());
      expect(spy).toBeCalled();
    });
    it("appendPredicate calls validator then predicateTree.appendPredicate if all goes well", () => {
      const spyAppendPredicate = jest.spyOn(
        predicateFormulaEditor.predicateTree,
        "appendPredicate"
      );
      const spyValidator = jest.spyOn(Validators, "ValidatePredicateAgainstOperator");

      const willThrow = () => {
        predicateFormulaEditor.predicatesAppend("flatFileTest", {
          operator: "$eq",
          value: "test",
          subjectId: "firstName",
        });
      };
      expect(willThrow).not.toThrow(PredicateTreeError);
      expect(spyValidator).toBeCalled();
      expect(spyAppendPredicate).toBeCalled();
    });
    it("appendPredicate calls validator then throws if things dont go well", () => {
      const spyAppendPredicate = jest.spyOn(
        predicateFormulaEditor.predicateTree,
        "appendPredicate"
      );
      const spyValidator = jest.spyOn(Validators, "ValidatePredicateAgainstOperator");

      const willThrow = () => {
        predicateFormulaEditor.predicatesAppend("parentId", {
          operator: "$eq",
          value: "test",
          subjectId: "DOES_NOT_EXIST",
        });
      };
      expect(willThrow).toThrow(PredicateTreeError);
      expect(spyValidator).toBeCalled();
      expect(spyAppendPredicate).not.toBeCalled();
    });
    it("getPredicateById calls predicateTree.getPredicateById", () => {
      const spy = jest.spyOn(predicateFormulaEditor.predicateTree, "getPredicateById");
      predicateFormulaEditor.predicatesGetById("ANY_WILL_DO");
      expect(spy).toBeCalled();
    });
    it("predicatesGetJunctionById calls predicateTree.getPredicateJunctionPropsByIdOrThrow", () => {
      const willThrow = () => {
        predicateFormulaEditor.predicatesGetJunctionById("ANY_WILL_DO");
      };
      expect(willThrow).toThrow(PredicateTreeError);
    });
    it("predicatesGetPropertiesById calls predicateTree.getPredicatePropsByIdOrThrow", () => {
      const willThrow = () => {
        predicateFormulaEditor.predicatesGetPropertiesById("ANY_WILL_DO");
      };
      expect(willThrow).toThrow(PredicateTreeError);
    });
    it("predicatesIsBranch calls predicateTree.isBranch", () => {
      const spy = jest.spyOn(predicateFormulaEditor.predicateTree, "isBranch");
      predicateFormulaEditor.predicatesIsBranch("ANY_WILL_DO");
      expect(spy).toBeCalled();
    });
    it("predicatesRemove calls predicateTree.removePredicate", () => {
      const spy = jest.spyOn(predicateFormulaEditor.predicateTree, "removePredicate");
      const willThrow = () => {
        predicateFormulaEditor.predicatesRemove("ANY_WILL_DO");
      };
      expect(willThrow).toThrow(DirectedTreeError);
      expect(spy).toBeCalled();
    });

    it("predicatesReplace calls predicateTree.replacePredicate", () => {
      const spy = jest.spyOn(predicateFormulaEditor.predicateTree, "replacePredicate");
      predicateFormulaEditor.predicatesReplace("ANY_WILL_DO", { operator: "$or" });
      expect(spy).toBeCalled();
    });

    it("getSubjectDictionary is the subject dictionary", () => {
      const subjectDictionary = predicateFormulaEditor.subjectDictionary;
      expect(subjectDictionary.constructor.name).toBe("PredicateSubjectDictionary");
    });
    it(".subjectGetColumns() - should return subjects with type", () => {
      const columns = predicateFormulaEditor.subjectGetColumns();
      expect(columns).toStrictEqual(columnsBlueSkies);
    });

    it("getOptionsList calls subjectDictionary.getOptionsList", () => {
      expect(predicateFormulaEditor.subjectsGetOptionsList("ANY_WILL_DO")).toStrictEqual({
        $anyOf: [],
        $nanyOf: [],
        $oneOf: [],
      });
    });
    it("getSubject calls subjectDictionary.getSubject", () => {
      const spy = jest.spyOn(predicateFormulaEditor.subjectDictionary, "getSubject");
      predicateFormulaEditor.subjectsGetById("ANY_WILL_DO");
      expect(spy).toBeCalled();
    });
    it("toJson calls subjectDictionary.toJson and predicateTreeJson", () => {
      const spySubjects = jest.spyOn(predicateFormulaEditor.subjectDictionary, "toJson");

      predicateFormulaEditor.toJson();
      expect(spySubjects).toBeCalled();
    });
    it(".predicatesToJsonTree ", () => {
      const predicateFormulaEditor = PredicateFormulaEditorFactory.fromJson(
        blueSkiesJson as PredicateFormulaEditorJson
      );
      expect(predicateFormulaEditor.predicatesToJsonTree()).toStrictEqual(
        blueSkiesJson.predicateTreeJson
      );
    });
    it(".makeEmptyPredicate ", () => {
      const spySubjects = jest.spyOn(
        predicateFormulaEditor.subjectDictionary,
        "makeEmptyPredicate"
      );

      predicateFormulaEditor.makeEmptyPredicate();
      expect(spySubjects).toBeCalled();
    });
  }); //describe('Wrapped Methods',
});

const columnsBlueSkies = [
  {
    subjectId: "firstName",
    datatype: "string",
    defaultLabel: "First Name",
  },
  {
    subjectId: "lastName",
    datatype: "string",
    defaultLabel: "Last Name",
  },
  {
    subjectId: "isNullSubject",
    datatype: "string",
    defaultLabel: "Can be null",
  },
  {
    subjectId: "notEqualSubject",
    datatype: "string",
    defaultLabel: "Can be not equal",
  },
  {
    subjectId: "isEmptySubject",
    datatype: "string",
    defaultLabel: "Can be empty",
  },
];
