/* eslint-disable @typescript-eslint/no-use-before-define */
import { assert } from "console";
import cloneDeep from "lodash.clonedeep";
import differenceWith from "lodash.differencewith";
import type {
  TPredicatePropertiesJunction,
  TPredicateProperties,
  TPredicateNode,
} from "../../index";
import PredicateTree from "./PredicateTree";
import { simplePredicates } from "./test-helpers";
import predicateTreeJson from "../../test-case-files/predicate-tree-blue-skies.json";
import { TSerializedPredicateTree } from "..";
import { TreeVisitors } from "../TreeVisitors";
import { PredicateTreeError } from "./PredicateTreeError";

const VisitorOperatorCounter = TreeVisitors.OperatorCounter;

const serializedDoc = cloneDeep(predicateTreeJson) as TSerializedPredicateTree;

const getInvisibleChildId = (knownChildId: string, childrenIds: string[]) => {
  // if branch has two children (one invisible)
  assert(childrenIds.length === 2);

  const knownIndex = childrenIds.indexOf(knownChildId);
  if (knownIndex === 0) {
    return childrenIds[1];
  }
  return childrenIds[0];
};

const getInvisibleChildren = (knownChildrenIds: string[], allChildrenIds: string[]) =>
  differenceWith(allChildrenIds, knownChildrenIds, (a, b) => a === b);
describe("PredicateTree", () => {
  describe("Creation", () => {
    it("Should get created", () => {
      const pTree = new PredicateTree("myPTree");
      expect(pTree.queryId).toBe("myPTree");
    });
  }); // describe('Creation',
  describe("_ascendChild", () => {
    it("Should replace parent content with grand child content (removing parent)", () => {
      /*
        All branch must have to or more children.
        When removing one of the last two children, the remaining child's childrent
        will ascend to the grandparent. 

        effectively when remove one of the last two children. Both children
        are removed but the children of the remaining child be appended
        to *their* grandparent. 
      */
      // setup
      const subjectDoc = cloneDeep(serializedDoc);
      const pTree = PredicateTree.fromFlatObject(subjectDoc);

      let rootChildrenIds = pTree.getChildrenIds(pTree.rootNodeId);

      // want root to have two children each having their own children
      let childrenWithChildren = rootChildrenIds.filter((childId) => {
        return pTree.getChildrenIds(childId).length > 0;
      });
      let childrenWithOutChildren = rootChildrenIds.filter((childId) => {
        return pTree.getChildrenIds(childId).length === 0;
      });
      childrenWithOutChildren.forEach((childId) => {
        pTree.removePredicate(childId);
      });
      for (let i = 0; i < childrenWithChildren.length - 2; i++) {
        pTree.removePredicate(childrenWithChildren[i]);
      }

      // recount to assure we are effective
      rootChildrenIds = pTree.getChildrenIds(pTree.rootNodeId);
      childrenWithChildren = rootChildrenIds.filter((childId) => {
        return pTree.getChildrenIds(childId).length > 0;
      });
      childrenWithOutChildren = rootChildrenIds.filter((childId) => {
        return pTree.getChildrenIds(childId).length === 0;
      });

      expect(rootChildrenIds.length).toBe(2);
      expect(childrenWithChildren.length).toBe(2);
      expect(childrenWithOutChildren.length).toBe(0);

      const [removeChildId, lastChildId] = rootChildrenIds;

      const ascendedChildren = pTree.getChildrenIds(lastChildId);
      const expectedRootPredicates = ascendedChildren.map((childId) => {
        return pTree.getPredicateById(childId);
      });
      expect(expectedRootPredicates.length).toBeGreaterThan(0);
      expectedRootPredicates.forEach((predicate) => {
        expect(predicate).toBeTruthy();
      });

      // exercise
      pTree.removePredicate(removeChildId);

      // postConditions
      const actualRootPredicates = pTree
        .getChildrenIds(pTree.rootNodeId)
        .map((childId) => {
          return pTree.getPredicateById(childId);
        });

      expect(expectedRootPredicates).toStrictEqual(actualRootPredicates);
    });
    it("Should throw error if childId does not exist", () => {
      // setup
      const pTree = PredicateTree.fromFlatObject(serializedDoc);
      const removeRootNodeError = () => {
        pTree.removePredicate("DOES_NOT_EXIST");
      };
      expect(removeRootNodeError).toThrow(
        "removePredicate failed. Predicate with ID 'DOES_NOT_EXIST' does not exist."
      );
    });
  }); // describe("ascendChild"

  describe("appendPredict", () => {
    let pTree: PredicateTree;
    const rootNode: TPredicateNode = {
      subjectId: "customers.firstname",
      operator: "$eq",
      value: "Minnie",
    };
    const newPredicate: TPredicateNode = {
      subjectId: "customers.lastname",
      operator: "$eq",
      value: "Mouse",
    };

    beforeEach(() => {
      pTree = new PredicateTree("myPTree", rootNode);
    });
    it("Should insert predicate into given parent", () => {
      // setup
      const otherPredicate: TPredicateNode = {
        subjectId: "customers.lastname",
        operator: "$eq",
        value: "Mouse",
      };
      const simpleTree = new PredicateTree("theTree", rootNode);
      simpleTree.appendPredicate(simpleTree.rootNodeId, newPredicate);

      // preConditions
      expect(simpleTree.getChildrenIds(simpleTree.rootNodeId).length).toBe(2);

      // exercise
      const newPredicateId = simpleTree.appendPredicate(
        simpleTree.rootNodeId,
        otherPredicate
      );

      // postConditions
      expect(simpleTree.getChildrenIds(simpleTree.rootNodeId).length).toBe(3);
      expect(simpleTree.getPredicateById(newPredicateId)).toStrictEqual(otherPredicate);
    });
    it("Should insert new predicate into root, if root predicate is undefined", () => {
      // setup
      const noRootPredicateTree = new PredicateTree("theTree");

      // preConditions
      expect(noRootPredicateTree.getPredicateById("theTree")).toBeUndefined();
      expect(noRootPredicateTree.getChildrenIds("theTree").length).toBe(0);

      // exercise
      noRootPredicateTree.appendPredicate("theTree", newPredicate);

      // post conditions
      expect(noRootPredicateTree.getPredicateById("theTree")).toStrictEqual(newPredicate);
      expect(noRootPredicateTree.getChildrenIds("theTree").length).toBe(0);
    });
    it("Should check parent exists", () => {
      // setup
      const noRootPredicateTree = new PredicateTree("theTree");

      // preConditions
      expect(noRootPredicateTree.getPredicateById("theTree")).toBeUndefined();
      expect(noRootPredicateTree.getChildrenIds("theTree").length).toBe(0);

      // exercise
      const willThrow = () => {
        noRootPredicateTree.appendPredicate("DOES_NOT_EXIST", newPredicate);
      };
      expect(willThrow).toThrow("Couldn't locate parent with id: 'DOES_NOT_EXIST'");
      // post conditions
      // expect(noRootPredicateTree.getPredicateById("theTree")).toStrictEqual(newPredicate);
      // expect(noRootPredicateTree.getChildrenIds("theTree").length).toBe(0);
    });
    it("Should insert invisible child if parent has no children (all parents have 2 or more children rule)", () => {
      // setup
      const expectedRootPredicate = { operator: "$and" };

      // preCondition
      expect(pTree.getPredicateById(pTree.rootNodeId)).toStrictEqual(rootNode);

      // exercise
      const childId = pTree.appendPredicate(pTree.rootNodeId, newPredicate);

      // postCondition
      const rootChildrenIds = pTree.getChildrenIds(pTree.rootNodeId);
      const invisibleChildId = getInvisibleChildId(childId, rootChildrenIds);

      expect(pTree.getPredicateById(invisibleChildId)).toStrictEqual(rootNode);
      expect(pTree.getPredicateById(pTree.rootNodeId)).toStrictEqual(
        expectedRootPredicate
      );
      expect(pTree.getPredicateById(childId)).toStrictEqual(newPredicate);
    });
  });

  describe("getPredicateById", () => {
    it("Should return the predicate for the given nodeId", () => {
      const pTree = new PredicateTree("getPredicateById", simplePredicates.root);
      const childId = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);

      const invisibleChildId = getInvisibleChildId(
        childId,
        pTree.getChildrenIds(pTree.rootNodeId)
      );
      expect(pTree.getPredicateById(pTree.rootNodeId)).toStrictEqual({
        operator: "$and",
      });
      expect(pTree.getPredicateById(childId)).toStrictEqual(simplePredicates.child0);
      expect(pTree.getPredicateById(invisibleChildId)).toStrictEqual(
        simplePredicates.root
      );
    });
    it("Should return null if nodeId does not exist", () => {
      const pTree = new PredicateTree("getPredicateById", simplePredicates.root);
      pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);

      expect(pTree.getPredicateById("DOES_NOT_EXIST")).toBeNull();
    });
  });
  describe("geTPredicateNode", () => {
    let pTree: PredicateTree;
    const rootNode: TPredicateNode = {
      subjectId: "customers.firstname",
      operator: "$eq",
      value: "fish",
    };

    beforeEach(() => {
      pTree = new PredicateTree("myPTree", rootNode);
    });
    it("Should abstract away node related attributes, making visible only", () => {
      const actualRootNode = pTree.getPredicateById(pTree.rootNodeId);
      expect(actualRootNode).toStrictEqual(rootNode);
    });
  }); // describe('geTPredicateNode'
  describe("isBranch", () => {
    let pTree: PredicateTree;
    const nodeIds: { [nodeId: string]: string } = {};
    const rootNode: TPredicateNode = {
      subjectId: "customers.firstname",
      operator: "$eq",
      value: "Minnie",
    };
    const child0: TPredicateNode = {
      subjectId: "customers.lastname",
      operator: "$eq",
      value: "Duck",
    };
    beforeEach(() => {
      pTree = new PredicateTree("myPTree", rootNode);
      nodeIds.root = pTree.rootNodeId; // this is unnecessary, but follows pattern
      nodeIds.child0 = pTree.appendPredicate(pTree.rootNodeId, child0);
    });

    it("Should return true for branch nodes, false for non-branch nodes", () => {
      expect(pTree.isBranch(nodeIds.root)).toBe(true);
      expect(pTree.isBranch(nodeIds.child0)).toBe(false);
    });
  });
  describe("removePredicate", () => {
    let pTree: PredicateTree;
    const nodeIds: { [nodeId: string]: string } = {};
    const rootNode: TPredicateNode = {
      subjectId: "customers.firstname",
      operator: "$eq",
      value: "Minnie",
    };
    const child0: TPredicateNode = {
      subjectId: "customers.lastname",
      operator: "$eq",
      value: "child0",
    };
    const child1: TPredicateNode = {
      subjectId: "customers.lastname",
      operator: "$eq",
      value: "child1",
    };
    const grandChild0: TPredicateNode = {
      subjectId: "customers.lastname",
      operator: "$eq",
      value: "grandchild0",
    };
    const grandChild1: TPredicateNode = {
      subjectId: "customers.lastname",
      operator: "$eq",
      value: "grandchild1",
    };

    beforeEach(() => {
      pTree = new PredicateTree("myPTree", rootNode);
      nodeIds.root = pTree.rootNodeId; // this is unnecessary, but follows pattern
      nodeIds.child0 = pTree.appendPredicate(pTree.rootNodeId, child0);
      nodeIds.child1 = pTree.appendPredicate(pTree.rootNodeId, child1);
      nodeIds.child1Child0 = pTree.appendPredicate(nodeIds.child1, grandChild0);
      nodeIds.child1Child1 = pTree.appendPredicate(nodeIds.child1, grandChild1);
    });

    it("should remove leaf predicate as expected", () => {
      // preConditions
      expect(
        (pTree.getPredicateById(nodeIds.child1Child1) as TPredicateProperties).value
      ).toBe("grandchild1");
      pTree.removePredicate(nodeIds.child1Child1);
      expect(pTree.getPredicateById(nodeIds.child1Child1)).toBeNull();
    });
    it("Should remove branch and children of branch when predicate is branch", () => {
      const grandchildren = 2;
      const invisibleGrandchild = 1;
      // setup
      const childrenIds = pTree.getChildrenIds(nodeIds.child1);

      // preConditions
      expect(
        (pTree.getPredicateById(nodeIds.child1) as TPredicatePropertiesJunction).operator
      ).toBe("$and");
      expect(childrenIds.length).toBe(grandchildren + invisibleGrandchild);
      childrenIds.forEach((childId) => {
        expect(pTree.getPredicateById(childId)).not.toBeNull();
      });

      // exercise
      pTree.removePredicate(nodeIds.child1);

      // postConditions
      childrenIds.forEach((childId) => {
        expect(pTree.getPredicateById(childId)).toBeNull();
      });
      expect(pTree.getPredicateById(nodeIds.child1)).toBeNull();
    });
    it(`Should ascend last child. Parent's predicate becomes child's predicate, child disappears`, () => {
      // setup
      pTree.removePredicate(nodeIds.child1Child1);

      const parentId = nodeIds.child1;
      const originalChildrenIds = pTree.getChildrenIds(parentId);
      assert(originalChildrenIds.length === 2);
      const [invisibleChildId, killChildId] = originalChildrenIds;
      const invisibleChildPredicate = pTree.getPredicateById(invisibleChildId);

      // preConditions
      expect(
        (pTree.getPredicateById(invisibleChildId) as TPredicateProperties).value
      ).toBe("child1");

      expect(
        (pTree.getPredicateById(nodeIds.child1) as TPredicatePropertiesJunction).operator
      ).toBe("$and");

      // exercise
      pTree.removePredicate(killChildId);

      // postConditions - child predicate promoted to be parent's predicate
      expect(pTree.getPredicateById(invisibleChildId)).toBeNull();
      expect(pTree.getPredicateById(parentId)).toStrictEqual(invisibleChildPredicate);
    });
    it("Should throw error when attempting to remove rootNode", () => {
      const removeRootNodeError = () => {
        pTree.removePredicate(pTree.rootNodeId);
      };
      expect(removeRootNodeError).toThrow("Can not remove Root node. NodeId:  'myPTree'");
    });
    it("Should throw error if removing node that does not exist", () => {
      const removeRootNodeError = () => {
        pTree.removePredicate("DOES_NOT_EXIST");
      };
      expect(removeRootNodeError).toThrow(
        "removePredicate failed. Predicate with ID 'DOES_NOT_EXIST' does not exist."
      );
    });
  });
  describe("fromFlatObject", () => {
    it("Should create a tree...", () => {
      // client code should not expect predictable key assignment
      // we'll have to test values are in the their correct relational position.
      // eg, the only child with children, has two children with values.
      // seems cumbersome but works for this structure's purpose.

      // set up
      const expectedChildrenValues = [
        "$nand",
        "$nor",
        "$or",
        "first child",
        "second child",
      ];
      const expectedGrandchildrenValue = ["first grandchild", "second grandchild"];

      // exercise
      const pTree = PredicateTree.fromFlatObject(serializedDoc);

      expect(pTree.getPredicateById(pTree.rootNodeId)).toStrictEqual({
        operator: "$and",
      });

      // postConditions
      // --------------------- find children
      // for testing purposes - we'll compare the value property of children
      const childrenIds = pTree.getChildrenIds(pTree.rootNodeId);
      const childrenValues = childrenIds.map((childId) => {
        const predicate = pTree.getPredicateById(childId);
        if (["$and", "$nand", "$nor", "$or"].includes(predicate?.operator || "")) {
          // junction operators have no value
          return predicate?.operator;
        }
        return (predicate as TPredicateProperties).value;
      });

      // sort is necessary because order is not an internal concern
      expect(childrenValues.sort()).toStrictEqual(expectedChildrenValues.sort());

      // --------------------- find grandchildren
      const childrenWithChildren = childrenIds.filter(
        (childId) => pTree.getChildrenIds(childId).length > 0
      );
      expect(childrenWithChildren.length).toBe(3);

      const grandchildrenId = pTree.getChildrenIds(childrenWithChildren[0]);

      const grandchildrenValues = grandchildrenId.map(
        (childId) => (pTree.getPredicateById(childId) as TPredicateProperties).value
      );

      expect(grandchildrenValues.sort()).toStrictEqual(expectedGrandchildrenValue.sort());
    });
  }); // describe('fromFlatObject'
  describe("toJson", () => {
    it("Should be able to create serializable structure from tree", () => {
      const nodeIds: { [nodeName: string]: string } = {};
      const pTree = new PredicateTree("theTree", simplePredicates.root);

      // invisible child
      nodeIds.childId0 = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);
      nodeIds.childId1 = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child1);
      nodeIds.childId2 = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child2);

      nodeIds.grandchild0 = pTree.appendPredicate(
        nodeIds.childId1,
        simplePredicates.grandchild0
      );

      nodeIds.grandchild1 = pTree.appendPredicate(
        nodeIds.childId1,
        simplePredicates.grandchild1
      );

      // exercise
      const flatDoc = pTree.toJson();

      // postCondition
      expect(flatDoc[nodeIds.childId0]).toStrictEqual({
        ...{ parentId: pTree.rootNodeId },
        ...{ payload: simplePredicates.child0 },
      });

      // this will becomes $and because we create tree (instead of fromFlatObject)
      expect(flatDoc[nodeIds.childId1]).toStrictEqual({
        ...{ parentId: pTree.rootNodeId },
        ...{ payload: { operator: "$and" } },
      });

      expect(flatDoc[nodeIds.childId2]).toStrictEqual({
        ...{ parentId: pTree.rootNodeId },
        ...{ payload: simplePredicates.child2 },
      });

      // grandchildren
      // will have extra grandchild because we append to parent
      const grandchildrenIds = pTree.getChildrenIds(nodeIds.childId1);

      const invisibleChildrenIds = getInvisibleChildren(
        [nodeIds.grandchild0, nodeIds.grandchild1],
        grandchildrenIds
      );
      expect(invisibleChildrenIds.length).toBe(1);
      const invisibleChildId = invisibleChildrenIds.pop() || "";

      expect(flatDoc[invisibleChildId]).toStrictEqual({
        ...{ parentId: nodeIds.childId1 },
        ...{ payload: simplePredicates.child1 },
      });

      expect(flatDoc[nodeIds.grandchild0]).toStrictEqual({
        ...{ parentId: nodeIds.childId1 },
        ...{ payload: simplePredicates.grandchild0 },
      });

      expect(flatDoc[nodeIds.grandchild1]).toStrictEqual({
        ...{ parentId: nodeIds.childId1 },
        ...{ payload: simplePredicates.grandchild1 },
      });
    });
  }); // describe('toJson'
  describe("PredicateTree.serialize, PredicateTree.deserialize", () => {
    it("Should serialize", () => {
      const nodeIds: { [nodeName: string]: string } = {};
      const pTree = new PredicateTree("theTree", simplePredicates.root);

      // invisible child
      nodeIds.childId0 = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);
      nodeIds.childId1 = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child1);
      nodeIds.childId2 = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child2);

      nodeIds.grandchild0 = pTree.appendPredicate(
        nodeIds.childId1,
        simplePredicates.grandchild0
      );

      nodeIds.grandchild1 = pTree.appendPredicate(
        nodeIds.childId1,
        simplePredicates.grandchild1
      );

      // exercise
      const jsondoc = PredicateTree.serialize(pTree);
      const jsonObj = JSON.parse(jsondoc);

      // this test maybe silly.. It was written for toFlatObject
      // which was replaced to toJson.  Not sure this test is applicable.

      // this may not work because node keys can not be known.
      // works now only because keys all nodes the same. If that routine changes
      // this will stop work.  There is no guarantee key routine will remain unchanged.
      expect(jsonObj).toStrictEqual(pTree.toJson());
    });
    it("Should be able to deserialize", () => {
      const serialized =
        '{"theTree":{"parentId":null,"payload":{"operator":"$and"}},"theTree:0":{"parentId":"theTree","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree","payload":{"subjectId":"child2","operator":"$eq","value":"Child Two"}}}';
      const pTreeDeserialized = PredicateTree.deserialize(serialized);
      const nodeIds: { [nodeName: string]: string } = {};

      const pTree = new PredicateTree("theTree", simplePredicates.root);

      // invisible child
      nodeIds.childId0 = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);
      nodeIds.childId1 = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child1);
      nodeIds.childId2 = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child2);

      nodeIds.grandchild0 = pTree.appendPredicate(
        nodeIds.childId1,
        simplePredicates.grandchild0
      );

      nodeIds.grandchild1 = pTree.appendPredicate(
        nodeIds.childId1,
        simplePredicates.grandchild1
      );

      // keys will be unknown, order nodes added will be different
      // probably testing values is sufficient. otherwise would
      // have to compare two objects relations.  Sort of like
      // comparing to sets for equality [A,B,C] == [C,A,B]
      const flatValues = extractValues(pTree).sort();
      const deserializeValues = extractValues(pTreeDeserialized).sort();

      expect(flatValues).toStrictEqual(deserializeValues);
    });
    it("Should throw error no operator for empty payload", () => {
      const serialized =
        '{"theTree":{"parentId":null,"payload":{"operator":"$and"}},"theTree:0":{"parentId":"theTree","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree","payload":{}}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow("Deserialized failed. No operator found: '{}'");
    });
    it("Should throw error bad format for missing payload", () => {
      const serialized =
        '{"theTree":{"parentId":null,"payload":{"operator":"$and"}},"theTree:0":{"parentId":"theTree","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree"}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow(
        "Deserialized failed. Bad format serialNode: 'undefined'"
      );
    });
    it("Should throw error circular reference", () => {
      const serialized =
        '{"theTree":{"parentId":null,"payload":{"operator":"$and"}},"theTree:0":{"parentId":"theTree","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree:3","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree:2","payload":{"subjectId":"child2","operator":"$eq","value":"Child Two"}}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow(/orphan nodes/i);
    });
    it("Should throw error orphan node for circular reference", () => {
      const serialized =
        '{"theTree":{"parentId":null,"payload":{"operator":"$and"}},"theTree:0":{"parentId":"theTree:3","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree:0","payload":{"subjectId":"child2","operator":"$eq","value":"Child Two"}}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow(/orphan nodes/i);
    });
    it("Should throw error orphan node for orphan node", () => {
      const serialized =
        '{"theTree":{"parentId":null,"payload":{"operator":"$and"}},"theTree:0":{"parentId":"DOES_NOT_EXIST","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree","payload":{"subjectId":"child2","operator":"$eq","value":"Child Two"}}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow(/orphan nodes/i);
    });
    it("Should throw error malformed payload, missing operator", () => {
      const serialized =
        '{"theTree":{"parentId":null,"payload":{"operator":"$and"}},"theTree:0":{"parentId":"theTree","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree","payload":{"subjectId":"child2","value":"Child Two"}}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow(/Deserialized failed. No operator found/i);
    });
    it("Should throw error malformed payload, missing value", () => {
      const serialized =
        '{"theTree":{"parentId":null,"payload":{"operator":"$and"}},"theTree:0":{"parentId":"theTree","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree","payload":{"subjectId":"child2","operator":"$eq"}}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow(/Deserialized failed. No valid predicate found/i);
    });
    it("Should throw error malformed payload, missing subjectId", () => {
      const serialized =
        '{"theTree":{"parentId":null,"payload":{"operator":"$and"}},"theTree:0":{"parentId":"theTree","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree","payload":{"operator":"$eq","value":"Child Two"}}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow(/Deserialized failed. No valid predicate found/i);
    });
    it("Should throw error miss root node", () => {
      const serialized =
        '{"theTree:0":{"parentId":"theTree","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree","payload":{"subjectId":"child2","operator":"$eq","value":"Child Two"}}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow("No single root node found");
    });
    it("Should throw generic SyntaxError for broken JSON", () => {
      const serialized =
        '"theTree:0":{"parentId":"theTree","payload":{"subjectId":"theRoot","operator":"$eq","value":"The Root"}},"theTree:1":{"parentId":"theTree","payload":{"subjectId":"child0","operator":"$eq","value":"Child Zero"}},"theTree:2":{"parentId":"theTree","payload":{"operator":"$and"}},"theTree:2:4":{"parentId":"theTree:2","payload":{"subjectId":"child1","operator":"$eq","value":"Child One"}},"theTree:2:5":{"parentId":"theTree:2","payload":{"subjectId":"grandchild0","operator":"$eq","value":"Grandchild Zero"}},"theTree:2:6":{"parentId":"theTree:2","payload":{"subjectId":"grandchild1","operator":"$eq","value":"Grandchild One"}},"theTree:3":{"parentId":"theTree","payload":{"subjectId":"child2","operator":"$eq","value":"Child Two"}}}';
      const emptyPayloadError = () => {
        PredicateTree.deserialize(serialized);
      };
      expect(emptyPayloadError).toThrow(/Unexpected token : in JSON at position/i);
      expect(emptyPayloadError).toThrow(SyntaxError);
    });
  });
  describe("Visitor", () => {
    it("Should accept a visitor", () => {
      const opCounterVisitor = new VisitorOperatorCounter();
      const pTree = PredicateTree.fromFlatObject(serializedDoc);
      pTree.acceptVisitor(opCounterVisitor);
      const daCounts = opCounterVisitor.opCounts;
      expect(opCounterVisitor.opCounts).toStrictEqual({
        $and: 1,
        $nand: 1,
        $nor: 1,
        $or: 1,
        $anyOf: 0,
        $empty: 1,
        $eq: 4,
        $gt: 0,
        $gte: 0,
        $isNull: 2,
        $like: 0,
        $lt: 0,
        $lte: 0,
        $oneOf: 0,
        $nanyOf: 0,
        $ne: 1,
      });
    });
  });
  describe("getPredicateByIdOrThrow", () => {
    it("Should work the same as non 'orThrow'", () => {
      const pTree = new PredicateTree("getPredicateById", simplePredicates.root);
      const childId = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);
      expect(pTree.getPredicateByIdOrThrow(childId)).toStrictEqual(
        simplePredicates.child0
      );
      expect(pTree.getPredicateByIdOrThrow(childId)).toStrictEqual(
        pTree.getPredicateById(childId)
      );
    });
    it("Should throw error when predicate id does not exist", () => {
      const pTree = new PredicateTree("getPredicateById", simplePredicates.root);
      const childId = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);

      const throwsError = () => {
        pTree.getPredicateByIdOrThrow("DOES_NOT_EXIST");
      };
      expect(throwsError).toThrow("Couldn't locate predicate with id: 'DOES_NOT_EXIST'");
      expect(throwsError).toThrow(PredicateTreeError);
    });
  }); // describe getPredicateByIdOrThrow
  describe("getPredicateJunctionPropsById", () => {
    it("Should return PredicateJunctionProperties, when predicate is a junction, null otherwise", () => {
      const invisibleChildId = "getPredicateById:0";
      const pTree = new PredicateTree("getPredicateById", simplePredicates.root);
      const childId = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);

      expect(pTree.getPredicateJunctionPropsById(pTree.rootNodeId)).toStrictEqual({
        operator: "$and",
        childrenIds: [invisibleChildId, childId],
      });

      expect(pTree.getPredicateJunctionPropsById("DOES_NOT_EXIST")).toBeNull();
    });
    it("Should return null if does not exist", () => {
      const invisibleChildId = "getPredicateById:0";
      const pTree = new PredicateTree("getPredicateById", simplePredicates.root);
      const childId = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);

      expect(pTree.getPredicateJunctionPropsById("DOES_NOT_EXIST")).toBeNull();
    });
  });
  describe("getPredicateJunctionPropsByIdOrThrow", () => {
    it("Should return same as getPredicateJunctionPropsById(...) or throw error", () => {
      const invisibleChildId = "getPredicateById:0";
      const pTree = new PredicateTree("getPredicateById", simplePredicates.root);
      const childId = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);

      expect(pTree.getPredicateJunctionPropsByIdOrThrow(pTree.rootNodeId)).toStrictEqual({
        operator: "$and",
        childrenIds: [invisibleChildId, childId],
      });

      expect(pTree.getPredicateJunctionPropsByIdOrThrow(pTree.rootNodeId)).toStrictEqual(
        pTree.getPredicateJunctionPropsById(pTree.rootNodeId)
      );

      const throwsError = () => {
        pTree.getPredicateJunctionPropsByIdOrThrow("DOES_NOT_EXIST");
      };
      expect(throwsError).toThrow("Couldn't locate branch with id: 'DOES_NOT_EXIST'");
      expect(throwsError).toThrow(PredicateTreeError);
    });
  }); // describe getPredicateJunctionPropsByIdOrThrow
  describe("getPredicatePropsById", () => {
    it("Should return predicate properties, if leaf null otherwise", () => {
      const invisibleChildId = "getPredicateById:0";
      const pTree = new PredicateTree("getPredicateById", simplePredicates.root);
      const childId = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);

      expect(pTree.getPredicatePropsById(childId)).toStrictEqual(simplePredicates.child0);

      expect(pTree.getPredicatePropsById(pTree.rootNodeId)).toBeNull();
      expect(pTree.getPredicatePropsById("DOES_NOT_EXIST")).toBeNull();
    });
  }); // describe getPredicatePropsById
  describe("getPredicatePropsByIdOrThrow", () => {
    it("Should return predicate properties, if leaf null otherwise", () => {
      const pTree = new PredicateTree("testingRoot", simplePredicates.root);
      const childId = pTree.appendPredicate(pTree.rootNodeId, simplePredicates.child0);

      expect(pTree.getPredicatePropsByIdOrThrow(childId)).toStrictEqual(
        simplePredicates.child0
      );

      const willThrowNotPredicateNonLeaf = () => {
        pTree.getPredicatePropsByIdOrThrow(pTree.rootNodeId);
      };
      expect(willThrowNotPredicateNonLeaf).toThrow(PredicateTreeError);
      expect(willThrowNotPredicateNonLeaf).toThrow(
        "Couldn't locate leaf with id: 'testingRoot'"
      );

      const willThrowNotPredicateDoesNotExist = () => {
        pTree.getPredicatePropsByIdOrThrow("DOES_NOT_EXIST");
      };
      expect(willThrowNotPredicateDoesNotExist).toThrow(PredicateTreeError);
      expect(willThrowNotPredicateDoesNotExist).toThrow(
        "Couldn't locate leaf with id: 'DOES_NOT_EXIST'"
      );
    });
  }); // describe getPredicatePropsByIdOrThrow
}); // describe('PredicateTree'
describe("Predicate.isBranchOperator", () => {
  it("Should return true for all branch operators", () => {
    ["$and", "$or", "$nand", "$nor"].forEach((op) => {
      expect(PredicateTree.isBranchOperator(op)).toStrictEqual(true);
    });
  });
}); // describe('Predicate

const extractValues = (pTree: PredicateTree): (string | number)[] => {
  const theFlat = pTree.toJson();

  const flatValues = Object.entries(theFlat).map(([nodeId, node]) => {
    const nodeQ = node.payload as unknown as TPredicateNode;
    if (!nodeQ.operator) {
      throw new Error("All nodes should have operator");
    }
    if (nodeQ.operator === "$and" || nodeQ.operator === "$or") {
      return nodeQ.operator;
    }
    return (nodeQ as TPredicateProperties).value;
  });

  return flatValues;
};
