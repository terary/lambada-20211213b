/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-empty-function */
import cloneDeep from "lodash.clonedeep";
import DirectedTreeError from "./DirectedTreeError";
import DirectedTreeGraph from "./DirectedTreeGraph";
import { VisitorTreeToJson } from "./VisitorTreeToJson";
import { VisitorNodeCounter } from "./VisitorNodeCounter";

type ArbitraryType = {
  value: string;
};

type ArbitraryTypeJson = {
  value?: string;
};

const jsonPayloadConverter = (jsonPayload: ArbitraryTypeJson) => {
  return jsonPayload as ArbitraryType;
};
const jsonPayloadConverterString = (jsonPayload: string) => {
  return jsonPayload;
};

const treeWithGrandchildrenSerialized = {
  theRoot: { parentId: null, payload: { value: "The Root Payload" } },
  "theRoot:0": { parentId: "theRoot", payload: { value: "Child0 payload" } },
  "theRoot:1": { parentId: "theRoot", payload: { value: "Child1 payload" } },
  "theRoot:2": { parentId: "theRoot", payload: { value: "Child2 payload" } },

  "theRoot:1:0": { parentId: "theRoot:1", payload: { value: "Child0 of Child1" } },
  "theRoot:1:1": { parentId: "theRoot:1", payload: { value: "Child1 of Child1" } },
  "theRoot:1:2": { parentId: "theRoot:1", payload: { value: "Child2 of Child1" } },
};
const treeWithNoRoot = {
  "theRoot:0": { parentId: "theRoot", payload: { value: "Child0 payload" } },
  "theRoot:1": { parentId: "theRoot", payload: { value: "Child1 payload" } },
  "theRoot:2": { parentId: "theRoot", payload: { value: "Child2 payload" } },

  "theRoot:1:0": { parentId: "theRoot:1", payload: { value: "Child0 of Child1" } },
  "theRoot:1:1": { parentId: "theRoot:1", payload: { value: "Child1 of Child1" } },
  "theRoot:1:2": { parentId: "theRoot:1", payload: { value: "Child2 of Child1" } },
};
const treeCircularReference = {
  theRoot: { parentId: null, payload: { value: "The Root Payload" } },
  "theRoot:0": { parentId: "theRoot", payload: { value: "Child0 payload" } },
  "theRoot:1": { parentId: "theRoot", payload: { value: "Child1 payload" } },
  "theRoot:2": { parentId: "theRoot", payload: { value: "Child2 payload" } },

  circA: { parentId: "circB", payload: { value: "Child0 of Child1" } },
  circB: { parentId: "circC", payload: { value: "Child1 of Child1" } },
  circC: { parentId: "circA", payload: { value: "Child2 of Child1" } },
};
const treeOrphanNode = {
  theRoot: { parentId: null, payload: { value: "The Root Payload" } },
  "theRoot:0": { parentId: "theRoot", payload: { value: "Child0 payload" } },
  "theRoot:1": { parentId: "theRoot", payload: { value: "Child1 payload" } },
  "theRoot:2": { parentId: "DOES_NOT_EXIST", payload: { value: "Child2 payload" } },

  "theRoot:1:0": { parentId: "theRoot:1", payload: { value: "Child0 of Child1" } },
  "theRoot:1:1": { parentId: "DOES_NOT_EXIST", payload: { value: "Child1 of Child1" } },
  "theRoot:1:2": { parentId: "theRoot:1", payload: { value: "Child2 of Child1" } },
};
const treeWithGrandchildrenUnOrdered = {
  childThree: { parentId: "grandpa", payload: { value: "Child1 payload" } },
  childOne: { parentId: "grandpa", payload: { value: "Child0 payload" } },
  childTwoChildTwo: { parentId: "childTwo", payload: { value: "Child1 of Child1" } },

  grandpa: { parentId: null, payload: { value: "The Root Payload" } },

  childTwoChildOne: { parentId: "childTwo", payload: { value: "Child0 of Child1" } },
  childTwo: { parentId: "grandpa", payload: { value: "Child2 payload" } },
  childTwoChildThree: { parentId: "childTwo", payload: { value: "Child2 of Child1" } },
};

describe("DirectedTreeGraph<T>", () => {
  describe("Creation", () => {
    it("Should instantiate with payload", () => {
      // setup
      const expectedSerialObject = {
        theRoot: { parentId: null, payload: "The Root Payload" },
      };
      // exercise
      const treeGraph = new DirectedTreeGraph<string>("theRoot", "The Root Payload");

      // post condition
      const serializedObject = treeGraph.toJson();
      expect(serializedObject).toStrictEqual(expectedSerialObject);
    });
    it("Should instantiate without payload", () => {
      // setup
      const expectedSerialObject = {
        theRoot: { parentId: null, payload: undefined },
      };

      // exercise
      const treeGraph = new DirectedTreeGraph<string>("theRoot");

      // post condition

      const serializedObject = treeGraph.toJson();
      expect(serializedObject).toStrictEqual(expectedSerialObject);
    });
    it("Should instantiate without payload, first call appendPayload creates new Node, root payload remains undefined", () => {
      // setup
      const expectedSerialObject = {
        theRoot: { parentId: null, payload: undefined },
        "theRoot:0": { parentId: "theRoot", payload: "The Root Payload" },
      };

      // exercise
      const treeGraph = new DirectedTreeGraph<string>("theRoot");
      treeGraph.appendPayload("theRoot", "The Root Payload");

      // post condition
      const serializedObject = treeGraph.toJson();
      expect(serializedObject).toStrictEqual(expectedSerialObject);
    });
    it("Should instantiate from serialized file", () => {
      const serializedObject = {
        theRoot: { parentId: null, payload: "The Root Payload" },
        "theRoot:0": { parentId: "theRoot", payload: "Child0 payload" },
        "theRoot:1": { parentId: "theRoot", payload: "Child1 payload" },
      };
      const root = {
        childrenIds: ["theRoot:0", "theRoot:1"],
        nodeId: "theRoot",
        parentId: "theRoot",
        // the internal workings parentId = null or parentId=parentId, not our concern.
        payload: "The Root Payload",
      };

      const child1 = {
        childrenIds: [],
        nodeId: "theRoot:0",
        parentId: "theRoot",
        payload: "Child0 payload",
      };
      const child2 = {
        childrenIds: [],
        nodeId: "theRoot:1",
        parentId: "theRoot",
        payload: "Child1 payload",
      };
      const treeGraph = DirectedTreeGraph.fromFlatObject(
        serializedObject,
        jsonPayloadConverterString
      );
      expect(treeGraph.getNodeById("theRoot")).toStrictEqual(root);
      expect(treeGraph.getNodeById("theRoot:0")).toStrictEqual(child1);
      expect(treeGraph.getNodeById("theRoot:1")).toStrictEqual(child2);
    });
    it("Should throw orphan error if instantiate with orphan nodes", () => {
      const serializedObject = {
        theRoot: { parentId: null, payload: "The Root Payload" },
        "theRoot:0": { parentId: "DOES_NOT_EXIST", payload: "Child0 payload" },
        "theRoot:1": { parentId: "DOES_NOT_EXIST", payload: "Child1 payload" },
      };
      const errorMessage =
        "Orphan nodes or circular reference detected. Offending node(s) 'theRoot:0, theRoot:1'";
      const orphanError = () => {
        DirectedTreeGraph.fromFlatObject(serializedObject, jsonPayloadConverterString);
      };
      expect(orphanError).toThrow(DirectedTreeError);
      expect(orphanError).toThrow(errorMessage);
    });
    it("Should throw orphan error if instantiate with orphan nodes (2)", () => {
      const serializedObject = {
        theRoot: { parentId: null, payload: "The Root Payload" },
        "theRoot:0": { parentId: "theRoot:1", payload: "Child0 payload" },
        "theRoot:1": { parentId: "theRoot:0", payload: "Child1 payload" },
      };
      const errorMessage =
        "Orphan nodes or circular reference detected. Offending node(s) 'theRoot:0, theRoot:1'";
      const orphanError = () => {
        DirectedTreeGraph.fromFlatObject(serializedObject, jsonPayloadConverterString);
      };
      expect(orphanError).toThrow(DirectedTreeError);
      expect(orphanError).toThrow(errorMessage);
    });
  }); // describe('instantiation')
  describe("appendPayload", () => {
    let tree: DirectedTreeGraph<ArbitraryType>;
    beforeEach(() => {
      tree = DirectedTreeGraph.fromFlatObject<ArbitraryTypeJson, ArbitraryType>(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );
    });
    it("Should creat new child node with given payload (leaf), returning new nodeId", () => {
      // setup
      const targetNode = "theRoot:1:2";
      const newPayload = { value: "new payload" };
      const childrenOfLeaf = tree.getChildrenIds(targetNode);

      // preCondition
      expect(childrenOfLeaf).toStrictEqual([]);

      // exercise
      const newNodeId = tree.appendPayload("theRoot:1:2", newPayload);

      // postCondition
      expect(tree.getChildrenIds(targetNode)).toStrictEqual(["theRoot:1:2:6"]);
      expect(tree.getPayload(newNodeId)).toStrictEqual({ value: "new payload" });
    });
    it("Should creat new child node with given payload (branch), returning new nodeId", () => {
      // setup
      const targetNode = "theRoot:1";
      const newPayload = { value: "new payload" };
      const childrenOfLeaf = tree.getChildrenIds(targetNode);

      // preCondition
      expect(childrenOfLeaf).toStrictEqual(["theRoot:1:2", "theRoot:1:3", "theRoot:1:4"]);

      // exercise
      const newNodeId = tree.appendPayload("theRoot:1", newPayload);

      // postCondition
      expect(tree.getChildrenIds(targetNode).sort()).toStrictEqual(
        ["theRoot:1:2", "theRoot:1:3", "theRoot:1:4", "theRoot:1:6"].sort()
      );
      expect(tree.getPayload(newNodeId)).toStrictEqual({ value: "new payload" });
    });
    it("Should creat new child node with given payload (root)", () => {
      const newPayload = { value: "new payload" };
      const childrenOfLeaf = tree.getChildrenIds(tree.rootNodeId);

      // preCondition
      expect(childrenOfLeaf).toStrictEqual(["theRoot:0", "theRoot:1", "theRoot:5"]);

      // exercise
      const newNodeId = tree.appendPayload(tree.rootNodeId, newPayload);

      // postCondition
      expect(tree.getChildrenIds(tree.rootNodeId).sort()).toStrictEqual(
        ["theRoot:0", "theRoot:1", "theRoot:5", newNodeId].sort()
      );
      expect(tree.getPayload(newNodeId)).toStrictEqual({ value: "new payload" });
    });
    it("Should creat new child node with given payload (root, undefined payload)", () => {
      // setup
      const littleTree = new DirectedTreeGraph<ArbitraryType>("noRootPayload");

      // preConditions
      expect(littleTree.getPayload(littleTree.rootNodeId)).toBeUndefined();
      expect(littleTree.getChildrenIds(littleTree.rootNodeId)).toStrictEqual([]);

      // exercise
      const newNodeId = littleTree.appendPayload(littleTree.rootNodeId, {
        value: "new value",
      });

      // postConditions
      expect(littleTree.getPayload(newNodeId)).toStrictEqual({
        value: "new value",
      });
      expect(littleTree.getChildrenIds(littleTree.rootNodeId)).toStrictEqual([newNodeId]);
      expect(littleTree.getPayload(littleTree.rootNodeId)).toBeUndefined();
    });
    it("Should do something of parentNodeId does not exist", () => {
      // setup
      const noParentNodeError = () => {
        tree.appendPayload("DOES_NOT_EXIST", { value: "FAIL" });
      };
      const errorMessage = "Could not find parentId: 'DOES_NOT_EXIST'";

      // exercise
      expect(noParentNodeError).toThrow(DirectedTreeError);
      expect(noParentNodeError).toThrow(errorMessage);
    });
  }); // describe('appendPayload'

  describe("getChildrenIds", () => {
    let tree: DirectedTreeGraph<ArbitraryType>;
    beforeEach(() => {
      tree = DirectedTreeGraph.fromFlatObject<ArbitraryTypeJson, ArbitraryType>(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );
    });

    it("Should return childrenId of given node", () => {
      const expectedChildrenIds = ["theRoot:0", "theRoot:1", "theRoot:5"];
      expect(tree.getChildrenIds("theRoot")).toStrictEqual(expectedChildrenIds);
    });
    it("Should return empty array if no children for node", () => {
      const leafNodeId = "theRoot:1:2";
      const expectedChildrenIds: string[] | null = [];
      expect(tree.getChildrenIds(leafNodeId)).toStrictEqual(expectedChildrenIds);
    });
    it("Should return empty array if parent does not exist", () => {
      const leafNodeId = "DOES_NOT_EXIST";
      expect(tree.getChildrenIds(leafNodeId)).toStrictEqual([]);
      // const noParentError = () => {
      //   tree.getChildrenIds(leafNodeId);
      // };
      // const errorMessage = "Could not find parentId: 'DOES_NOT_EXIST'";

      // expect(noParentError).toThrow(DirectedTreeError);
      // expect(noParentError).toThrow(errorMessage);
    });
  }); // describe('getChildrenIds')
  describe("getNodeById", () => {
    let tree: DirectedTreeGraph<ArbitraryType>;
    beforeEach(() => {
      tree = DirectedTreeGraph.fromFlatObject<ArbitraryTypeJson, ArbitraryType>(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );
    });
    it("Should return null of nodeId not found", () => {
      expect(tree.getNodeById("DOES_NOT_EXIST")).toBeNull();
    });

    it("Should not cause mutation leak, returns clone", () => {
      // set up
      const mutant = tree.getNodeById("theRoot:1");
      const original = tree.getNodeById("theRoot:1");

      // preCondition
      expect(mutant).toStrictEqual(original);
      expect(mutant).not.toBeNull();

      // exercise
      if (mutant === null || original === null) {
        // to get typescript to cooperate
        throw new Error("Should never throw, null check done above");
      }

      mutant.parentId = "something different";
      mutant.nodeId = "something different";
      mutant.payload = { value: "something different" };
      mutant.childrenIds = ["something", "different"];

      // postCondition
      expect(mutant.parentId).not.toEqual(original.parentId);
      expect(mutant.nodeId).not.toEqual(original.nodeId);
      expect(mutant.payload).not.toEqual(original.payload);
      expect(mutant.childrenIds).toEqual(["something", "different"]);
      expect(original.childrenIds).toEqual(["theRoot:1:2", "theRoot:1:3", "theRoot:1:4"]);
      expect(original).toStrictEqual(tree.getNodeById("theRoot:1"));
    });
  });
  describe("getPayload", () => {
    let tree: DirectedTreeGraph<ArbitraryType>;
    beforeEach(() => {
      tree = DirectedTreeGraph.fromFlatObject<ArbitraryTypeJson, ArbitraryType>(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );
    });
    it("Returns undefined if no matching nodeId", () => {
      expect(tree.getPayload("DOES_NOT_EXIST")).toBeUndefined();
    });

    it("Should not cause mutation leak, returns clone", () => {
      // set up
      const mutantPayload = tree.getPayload("theRoot:1:4");
      const originalPayload = tree.getPayload("theRoot:1:4");

      // preCondition
      expect(mutantPayload).toStrictEqual(originalPayload);

      if (!mutantPayload || !originalPayload) {
        throw new Error("This should not be, here to make TS happy");
      }

      // exercise
      mutantPayload.value = "something different";
      expect(originalPayload).toStrictEqual({ value: "Child2 of Child1" });
      expect(mutantPayload).toStrictEqual({ value: "something different" });
      expect(originalPayload).toStrictEqual(tree.getPayload("theRoot:1:4"));
    });
  }); // describe('getPayload')

  describe("removeNode", () => {
    let tree: DirectedTreeGraph<ArbitraryType>;
    beforeEach(() => {
      tree = DirectedTreeGraph.fromFlatObject<ArbitraryTypeJson, ArbitraryType>(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );
    });
    it("Should remove leaf node", () => {
      const leafNode = "theRoot:1:2";

      // preCondition
      expect(tree.getNodeById(leafNode)).not.toBeNull();

      // exercise
      tree.removeNode(leafNode);

      // postCondition
      expect(tree.getNodeById(leafNode)).toBeNull();
    });
    it("Should remove branch node and all children", () => {
      const branchNode = "theRoot:1";
      const childrenIds = tree.getChildrenIds(branchNode);

      // preCondition
      expect(tree.getNodeById(branchNode)).not.toBeNull();
      expect(childrenIds.length).toBe(3);
      childrenIds.forEach((childId) => {
        expect(tree.getNodeById(childId)).not.toBeNull();
      });

      // exercise
      tree.removeNode(branchNode);

      // postCondition
      expect(tree.getNodeById(branchNode)).toBeNull();
      childrenIds.forEach((childId) => {
        expect(tree.getNodeById(childId)).toBeNull();
      });
    });
    it("Should not remove root", () => {
      const removeRootNodeError = () => {
        tree.removeNode(tree.rootNodeId);
      };
      expect(removeRootNodeError).toThrow(DirectedTreeError);
      expect(removeRootNodeError).toThrow("Can not remove Root node. NodeId:  'theRoot'");
    });
    it("Should throw error when nodeId does not exist", () => {
      const removeRootNodeError = () => {
        tree.removeNode("DOES_NOT_EXIST");
      };
      expect(removeRootNodeError).toThrow(DirectedTreeError);
      expect(removeRootNodeError).toThrow(
        'Remove Node, parent or child not found "DOES_NOT_EXIST"'
      );
    });
  }); // describe('removeNode')

  describe("replacePayload", () => {
    let tree: DirectedTreeGraph<ArbitraryType>;
    beforeEach(() => {
      tree = DirectedTreeGraph.fromFlatObject<ArbitraryTypeJson, ArbitraryType>(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );
    });

    it("Should set node value", () => {
      // setup
      // const targetNodeId = 'theRoot:1:1';
      const targetNodeId = "theRoot";

      const newPayload = { value: "new payload" };
      const existingPayload = tree.getPayload(targetNodeId);

      // precondition
      expect(newPayload).not.toStrictEqual(existingPayload);

      // exercise
      tree.replacePayload(targetNodeId, newPayload);

      // postCondition
      expect(tree.getPayload(targetNodeId)).toStrictEqual(newPayload);
    });
    it("Should quietly *not* set payload if nodeId not found", () => {
      // setup
      const targetNodeId = "DOES_NOT_EXIST";

      const newPayload = { value: "new payload" };
      const existingPayload = tree.getPayload(targetNodeId);

      // precondition
      expect(newPayload).not.toStrictEqual(existingPayload);

      // exercise
      tree.replacePayload(targetNodeId, newPayload);

      // postCondition
      expect(tree.getPayload(targetNodeId)).toStrictEqual(existingPayload);
    });
  }); // describe('setPayload')
  describe("getSiblingIds", () => {
    class ProtectedTester<T> extends DirectedTreeGraph<T> {
      getSiblingIdsTest(nodeId: string) {
        return this.getSiblingIds(nodeId);
      }
    }
    let childId0: string;
    let childId1: string;
    let childId2: string;
    let tGraph: ProtectedTester<string>;
    beforeEach(() => {
      tGraph = new ProtectedTester<string>("root", "root payload");
      childId0 = tGraph.appendPayload(tGraph.rootNodeId, "child0");
      childId1 = tGraph.appendPayload(tGraph.rootNodeId, "child1");
      childId2 = tGraph.appendPayload(tGraph.rootNodeId, "child2");
    });
    it("Should return siblingIds for a given node", () => {
      expect(tGraph.getSiblingIdsTest(childId0)).toStrictEqual([childId1, childId2]);
    });
    it("Should return empty array if there are no siblings (root)", () => {
      expect(tGraph.getSiblingIdsTest(tGraph.rootNodeId)).toStrictEqual([]);
    });
    it("Should return empty array if there are no siblings (non root)", () => {
      const grandchild0 = tGraph.appendPayload(childId0, "grandchild0");

      expect(tGraph.getSiblingIdsTest(grandchild0)).toStrictEqual([]);
    });
    it("Should return empty array nodeId does not exist", () => {
      expect(tGraph.getSiblingIdsTest("DOES_NOT_EXIST")).toStrictEqual([]);
    });
  });
  describe("DirectedTreeGraph.fromFlatObject", () => {
    it("Should build tree from Query Protocol Document, regardless of nodeId order, or naming convention  (Arbitrary NodeIds)", () => {
      const tree = DirectedTreeGraph.fromFlatObject<ArbitraryTypeJson, ArbitraryType>(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );

      const firstGeneration = tree.getNodeById(tree.rootNodeId);

      if (firstGeneration === null) {
        throw Error("Should not happen, here to make TS happy");
      }
      expect(firstGeneration.payload).toStrictEqual({ value: "The Root Payload" });
      expect(firstGeneration.childrenIds.length).toBe(3);

      const secondGeneration: { [value: string]: any } = {};
      const thirdGeneration: { [value: string]: any } = {};

      firstGeneration.childrenIds.forEach((childId) => {
        const childNode = tree.getNodeById(childId);
        if (childNode === null) {
          throw Error("Should not happen, here to make TS happy");
        }
        secondGeneration[childNode.payload.value] = childNode;
      });

      secondGeneration["Child1 payload"].childrenIds.forEach((childId: string) => {
        const childNode = tree.getNodeById(childId);
        if (childNode === null) {
          throw Error("Should not happen, here to make TS happy");
        }
        thirdGeneration[childNode.payload.value] = childNode;
      });

      expect(secondGeneration["Child0 payload"].parentId).toBe(tree.rootNodeId);
      expect(secondGeneration["Child0 payload"].childrenIds).toStrictEqual([]);
      expect(secondGeneration["Child0 payload"].payload).toStrictEqual({
        value: "Child0 payload",
      });

      expect(secondGeneration["Child1 payload"].parentId).toBe(tree.rootNodeId);
      expect(secondGeneration["Child1 payload"].childrenIds).toStrictEqual([
        "theRoot:1:2",
        "theRoot:1:3",
        "theRoot:1:4",
      ]);
      expect(secondGeneration["Child1 payload"].payload).toStrictEqual({
        value: "Child1 payload",
      });

      expect(secondGeneration["Child2 payload"].parentId).toBe(tree.rootNodeId);
      expect(secondGeneration["Child2 payload"].childrenIds.length).toBe(0);
      expect(secondGeneration["Child2 payload"].payload).toStrictEqual({
        value: "Child2 payload",
      });

      const thirdGenerationParentId = secondGeneration["Child1 payload"].nodeId;

      expect(thirdGeneration["Child0 of Child1"].parentId).toBe(thirdGenerationParentId);
      expect(thirdGeneration["Child0 of Child1"].childrenIds).toStrictEqual([]);
      expect(thirdGeneration["Child0 of Child1"].payload).toStrictEqual({
        value: "Child0 of Child1",
      });

      expect(thirdGeneration["Child1 of Child1"].parentId).toBe(thirdGenerationParentId);
      expect(thirdGeneration["Child1 of Child1"].childrenIds).toStrictEqual([]);
      expect(thirdGeneration["Child1 of Child1"].payload).toStrictEqual({
        value: "Child1 of Child1",
      });

      expect(thirdGeneration["Child2 of Child1"].parentId).toBe(thirdGenerationParentId);
      expect(thirdGeneration["Child2 of Child1"].childrenIds).toStrictEqual([]);
      expect(thirdGeneration["Child2 of Child1"].payload).toStrictEqual({
        value: "Child2 of Child1",
      });
    });
    it("Should throw error if orphan node detected", () => {
      const errorMessage =
        "Orphan nodes or circular reference detected. Offending node(s) 'theRoot:2, theRoot:1:1'";

      const errorOrphanNode = () => {
        DirectedTreeGraph.fromFlatObject(treeOrphanNode, jsonPayloadConverter);
      };
      expect(errorOrphanNode).toThrow(DirectedTreeError);
      expect(errorOrphanNode).toThrow(errorMessage);
    });
    it("Should throw error if not root node found", () => {
      const headless = cloneDeep(treeOrphanNode);
      delete (headless as any).theRoot;
      const errorMessage = "No single root node found";

      const errorOrphanNode = () => {
        DirectedTreeGraph.fromFlatObject(headless, jsonPayloadConverter);
      };
      expect(errorOrphanNode).toThrow(DirectedTreeError);
      expect(errorOrphanNode).toThrow(errorMessage);
    });
    it("Should throw error for  missing parent (orphan)", () => {
      const parentless = cloneDeep(treeOrphanNode);
      parentless["theRoot:1:0"].parentId = "DOES_NOT_EXIST";
      const errorMessage = /Orphan nodes or circular reference detected. Offending node/i;

      const errorOrphanNode = () => {
        DirectedTreeGraph.fromFlatObject(parentless, jsonPayloadConverter);
      };

      expect(errorOrphanNode).toThrow(DirectedTreeError);
      expect(errorOrphanNode).toThrow();
    });
    it("Should throw error if circular reference detected", () => {
      const errorMessage =
        "Orphan nodes or circular reference detected. Offending node(s) 'circA, circB, circC'";

      const errorOrphanNode = () => {
        DirectedTreeGraph.fromFlatObject(treeCircularReference, jsonPayloadConverter);
      };
      expect(errorOrphanNode).toThrow(DirectedTreeError);
      expect(errorOrphanNode).toThrow(errorMessage);
    });
    it("Should throw error if no root found", () => {
      const errorMessage = "No single root node found";

      const errorOrphanNode = () => {
        DirectedTreeGraph.fromFlatObject(treeWithNoRoot, jsonPayloadConverter);
      };
      expect(errorOrphanNode).toThrow(DirectedTreeError);
      expect(errorOrphanNode).toThrow(errorMessage);
    });
  }); // describe('fromSerialized'
  describe("(toJson) DirectedTreeGraph ", () => {
    it("Static Method and instance method do the same thing (backwards compatibility)", () => {
      const tree = DirectedTreeGraph.fromFlatObject(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );

      expect(tree.toJson()).toStrictEqual(DirectedTreeGraph.toJson(tree));
    });
    it("Serialize Tree", () => {
      // non exhaustive
      // because keys are unknown exhaustive test would require traversing
      // tree and checking value according to parent/child relationship

      const tree = DirectedTreeGraph.fromFlatObject(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );
      const serial = tree.toJson();
      const values = Object.values(serial);
      expect(values.length).toStrictEqual(
        Object.values(treeWithGrandchildrenSerialized).length
      );
    });
    it("(toJson) Serialize Branch (branch)", () => {
      const tree = DirectedTreeGraph.fromFlatObject(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );
      const theFlattenedBranch = tree.toJson("theRoot:1");

      // DirectedTreeGraph.serializeBranch(tree, "theRoot:1");

      expect(theFlattenedBranch["theRoot:1"].parentId).toBeNull();
      expect(theFlattenedBranch["theRoot:1:2"].parentId).toBe("theRoot:1");
      expect(theFlattenedBranch["theRoot:1:3"].parentId).toBe("theRoot:1");
      expect(theFlattenedBranch["theRoot:1:4"].parentId).toBe("theRoot:1");
      expect(Object.keys(theFlattenedBranch).length).toBe(4);
    });
    it("Serialize Branch (leaf)", () => {
      const tree = DirectedTreeGraph.fromFlatObject(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );

      const theFlattenedBranch = tree.toJson("theRoot:1:4");

      expect(theFlattenedBranch["theRoot:1:4"].parentId).toBeNull();
      expect(Object.keys(theFlattenedBranch).length).toBe(1);
    });
    it("Serialize Branch (root)", () => {
      const tree = DirectedTreeGraph.fromFlatObject(
        treeWithGrandchildrenSerialized,
        jsonPayloadConverter
      );

      const theFlattenedBranch = tree.toJson("theRoot");

      expect(theFlattenedBranch.theRoot.parentId).toBeNull();
      expect(theFlattenedBranch["theRoot:0"].parentId).toBe("theRoot");
      expect(theFlattenedBranch["theRoot:1"].parentId).toBe("theRoot");
      expect(theFlattenedBranch["theRoot:1:2"].parentId).toBe("theRoot:1");
      expect(theFlattenedBranch["theRoot:1:3"].parentId).toBe("theRoot:1");
      expect(theFlattenedBranch["theRoot:1:4"].parentId).toBe("theRoot:1");
      expect(theFlattenedBranch["theRoot:5"].parentId).toBe("theRoot");
      expect(Object.keys(theFlattenedBranch).length).toBe(7);
    });
  }); // describe('fromSerialized'
  describe("Visitors", () => {
    describe("VisitorTreeToJson", () => {
      it("Should clone/convert tree to json", () => {
        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        const jsonVisitor = new VisitorTreeToJson(theTree.rootNodeId);
        theTree.accept(jsonVisitor);

        const json = jsonVisitor.jsonTree;
      });
      it("Should clone/convert branch on, given nodeId", () => {
        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        const jsonVisitor = new VisitorTreeToJson("grandpa:2");
        theTree.accept(jsonVisitor);
        expect(Object.keys(jsonVisitor.jsonTree)).toStrictEqual([
          "grandpa:2",
          "grandpa:2:3",
          "grandpa:2:4",
          "grandpa:2:5",
        ]);
      });
    }); //describe VisitorTreeToJson
    describe("mergeBranch", () => {
      it("Should do nothing if the target node does not exist", () => {
        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        expect(
          theTree.mergeChildrenOnToBranch("grandpa:0", "DOES_NOT_EXIST")
        ).toBeFalsy();
      });
      it("Should take some branch and merge it into other branch", () => {
        // set-up
        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        theTree.appendPayload("grandpa:0", { value: "New Grandchild One" });
        theTree.appendPayload("grandpa:0", { value: "New Grandchild Two" });

        // preConditions
        const originalChildId = theTree.getChildrenIds("grandpa:2");
        theTree.getChildrenIds("grandpa:0"); // throws no error

        // exercise
        theTree.mergeChildrenOnToBranch("grandpa:0", "grandpa:2");

        // postConditions
        const children0Ids = theTree.getChildrenIds("grandpa:0");
        expect(children0Ids).toStrictEqual([]);
        const children2Ids = theTree.getChildrenIds("grandpa:2");

        const newChildIds = children2Ids.filter((x) => !originalChildId.includes(x));

        // taking a chance on order.  There really is no guarantee which will be first or Second
        expect(theTree.getPayload(newChildIds[0])).toStrictEqual({
          value: "New Grandchild One",
        });
        expect(theTree.getPayload(newChildIds[1])).toStrictEqual({
          value: "New Grandchild Two",
        });

        originalChildId.forEach((childId) => {
          expect(children2Ids.includes(childId)).toBeTruthy();
        });

        // expect(1).toBe(2);
      });
      it("Should be able to merge branch onto leaf", () => {
        // set-up
        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        theTree.appendPayload("grandpa:0", { value: "New Grandchild One" });
        theTree.appendPayload("grandpa:0", { value: "New Grandchild Two" });

        // preConditions
        const originalChildId = theTree.getChildrenIds("grandpa:1");
        theTree.getChildrenIds("grandpa:0"); // throws no error

        // exercise
        theTree.mergeChildrenOnToBranch("grandpa:0", "grandpa:1");

        // postConditions
        const children0Ids = theTree.getChildrenIds("grandpa:0");
        expect(children0Ids).toStrictEqual([]);
        const children1Ids = theTree.getChildrenIds("grandpa:1");

        const newChildIds = children1Ids.filter((x) => !originalChildId.includes(x));

        // taking a chance on order.  There really is no guarantee which will be first or Second
        expect(theTree.getPayload(newChildIds[0])).toStrictEqual({
          value: "New Grandchild One",
        });
        expect(theTree.getPayload(newChildIds[1])).toStrictEqual({
          value: "New Grandchild Two",
        });

        originalChildId.forEach((childId) => {
          expect(children1Ids.includes(childId)).toBeTruthy();
        });

        // expect(1).toBe(2);
      });
    }); // describe merge
    describe("replaceBranch", () => {
      it("Should do nothing if the target node does not exist", () => {
        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );

        expect(theTree.replaceBranch("grandpa:0", "DOES_NOT_EXIST")).toBeFalsy();
      });
      it("Should take some branch and merge it into other branch", () => {
        // set-up
        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        theTree.appendPayload("grandpa:0", { value: "New Grandchild One" });
        theTree.appendPayload("grandpa:0", { value: "New Grandchild Two" });

        // preConditions
        const preGrandpa0ids = theTree.getChildrenIds("grandpa:0");
        const preGrandpa2ids = theTree.getChildrenIds("grandpa:2");
        theTree.getChildrenIds("grandpa:0"); // throws no error
        // expect(originalGrandpa0ids.sort()).not.toStrictEqual(originalGrandpa2ids.sort())

        // exercise
        theTree.replaceBranch("grandpa:0", "grandpa:2");

        // postConditions
        const postGrandpa0ids = theTree.getChildrenIds("grandpa:0");
        const postGrandpa2ids = theTree.getChildrenIds("grandpa:2");

        // expect(preGrandpa0ids.sort()).toStrictEqual(postGrandpa2ids.sort())
        expect(postGrandpa0ids).toStrictEqual([]);

        // taking a chance on order.  There really is no guarantee which will be first or Second
        expect(theTree.getPayload(postGrandpa2ids[0])).toStrictEqual({
          value: "New Grandchild One",
        });
        expect(theTree.getPayload(postGrandpa2ids[1])).toStrictEqual({
          value: "New Grandchild Two",
        });
      });
    }); // describe replaceBranch
    describe("is[Root|BranchLeaf]Type", () => {
      it("Should return true appropriately for Branch, Leaf, Root", () => {
        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        expect(theTree.isRootNode("grandpa")).toStrictEqual(true);
        expect(theTree.isRootNode("grandpa:1")).toStrictEqual(false);

        expect(theTree.isLeafNode("grandpa:1")).toStrictEqual(true);
        expect(theTree.isLeafNode("grandpa")).toStrictEqual(false);

        expect(theTree.isBranchNode("grandpa:2")).toStrictEqual(true);
        expect(theTree.isLeafNode("grandpa:2")).toStrictEqual(false);
      });
    });
    describe("VisitorNodeCounter", () => {
      it("Should run visitors (all nodes)", () => {
        const counterVisitor = new VisitorNodeCounter();

        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        theTree.accept(counterVisitor);
        expect(counterVisitor.nodeCount).toBe(7);
        expect(counterVisitor.nodeCount).toBe(
          Object.keys(treeWithGrandchildrenUnOrdered).length
        );
      });
      it("Should run visitors (branch nodes)", () => {
        const counterVisitor = new VisitorNodeCounter("branch");

        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        theTree.accept(counterVisitor);
        expect(counterVisitor.nodeCount).toBe(2);
      });
      it("Should run visitors (leaf nodes)", () => {
        const counterVisitor = new VisitorNodeCounter("leaf");

        const theTree = DirectedTreeGraph.fromJson(
          treeWithGrandchildrenUnOrdered,
          jsonPayloadConverter
        );
        theTree.accept(counterVisitor);
        expect(counterVisitor.nodeCount).toBe(5);
      });
    });
  }); //describe('Visitors',
});
