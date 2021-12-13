import { cloneDeep } from "lodash";
import { TreeNodeRef, IIncrementor, SerializedTreeNode, SerializedTree } from "./types";
import DirectedTreeGraph from "./DirectedTreeGraph";
import { Incrementor } from "./Incrementor";

export const getNodeIdsWithNullParents = <U>(serializedTree: SerializedTree<U>) => {
  // these are root candidates
  return Object.entries(serializedTree)
    .filter(([nodeId, node]) => {
      return node.parentId === null;
    })
    .map(([nodeId, node]) => {
      return nodeId;
    });
};

const getJsonChildIds = <T>(parentId: string, shrinkingTreeJson: SerializedTree<T>) => {
  const childrenIds: string[] = [];
  Object.entries(shrinkingTreeJson).forEach(([nodeId, node]) => {
    if ((node as SerializedTreeNode<T>).parentId === parentId) {
      childrenIds.push(nodeId);
    }
  });
  return childrenIds;
};

export const makeTreeNodeRef = <T>(
  parentId: string,
  nodeId: string,
  payload: T | undefined
) => {
  return {
    parentId,
    nodeId,
    children: null,
    payload,
  } as TreeNodeRef<T>;
};

export const convertJsonToDirectedGraphTree = <J, T>(
  /**
   * Recursively builds internal tree for DirectedGraphTree (DGT)
   * from supplied json. Mentally I think of a DNA helix
   * dividing into two each node at a time.
   *
   * The result structure can become DirectedGraphTree._tree
   *
   * Input:  JSON tree
   * Output: root branch of DGT (which contain children branches, recursively)
   * Side Effect: Elements are removed from from the supplied
   *              jsonTree. Items remaining in jsonTree are orphans.
   *              orphans are consider bad. Its likely an error condition.
   */

  parentId: string, // DGT
  thisNodeId: string, // DGT current node ('this')
  currentJsonNodeId: string, // json
  shrinkingTreeJson: SerializedTree<J>, // json
  incrementor: IIncrementor,
  jsonPayloadConverter: (jsonPayload: J) => T,
  isRoot = false
): TreeNodeRef<T> => {
  // need to figure out lint/prettier rule for function first line
  //
  const newBranch = makeTreeNodeRef<T>(
    isRoot ? thisNodeId : parentId, // parentId
    thisNodeId, // nodeId (recursive call, current node)
    jsonPayloadConverter(shrinkingTreeJson[currentJsonNodeId].payload)
  );

  // TreeNodeRef<T>
  delete shrinkingTreeJson[currentJsonNodeId];

  const childIds = getJsonChildIds(currentJsonNodeId, shrinkingTreeJson);
  if (childIds.length === 0) {
    newBranch.children = null;
  } else {
    newBranch.children = {};
    childIds.forEach((jsonChildId) => {
      const newChildId = incrementor.nextValue;
      const newChildNodeId = [thisNodeId, newChildId].join(
        DirectedTreeGraph.PATH_DELIMITER
      );

      // ts, lint, prettier thinks this maybe null despite above assignment
      (newBranch.children || {})[newChildId] = convertJsonToDirectedGraphTree<J, T>(
        thisNodeId,
        newChildNodeId,
        jsonChildId,
        shrinkingTreeJson,
        incrementor,
        jsonPayloadConverter
      );
    });
  }

  return newBranch;
};

export const buildTreeStructure = <J, T>(
  /**
   * utilities for error detection.  Primary finding orphan nodes.
   * Orphans are consider error condition.  Use this function
   * to determine if DTG will have orphans.
   */
  serializedTree: SerializedTree<J>,
  jsonPayloadConverter: (jsonPayload: J) => T,
  treeRootNode?: string
) => {
  const serializedTreeCloned = cloneDeep(serializedTree);
  const jsonRootNodeIds = getNodeIdsWithNullParents(serializedTreeCloned);
  const jsonRootNodeId = jsonRootNodeIds[0];
  const nextNodeId = jsonRootNodeId;

  const nodeIncrementor = new Incrementor();

  const rootBranch = convertJsonToDirectedGraphTree<J, T>(
    jsonRootNodeId,
    treeRootNode || jsonRootNodeId,
    nextNodeId,
    serializedTreeCloned,
    nodeIncrementor,
    jsonPayloadConverter,
    true
  );

  return {
    rootBranch, // (aka theTree)
    nodeIncrementor, //
    orphans: serializedTreeCloned,
  };
};
