// cspell:ignore clonedeep

/*
  External docs MUST use null for root parent Id
  NEVER should circular reference be ok

  Internally - root will be, parentNodeId==thisNodeId
  - this is because typing, don't want either to be null
*/

import clonedeep from "lodash.clonedeep";
import { IDirectedTreeGraph } from "./IDirectedTreeGraph";
import { Incrementor } from "./Incrementor";
import {
  buildTreeStructure,
  convertJsonToDirectedGraphTree,
  getNodeIdsWithNullParents,
  makeTreeNodeRef,
} from "./PublicUtilities";
import { VisitorTreeToJson } from "./VisitorTreeToJson";
import DirectedTreeError from "./DirectedTreeError";
import {
  IVisitor,
  TreeNodeRefDictionary,
  TreeNodeRef,
  TreeNode,
  IIncrementor,
  SerializedTree,
} from "./types";

type TJsonPayloadConverter<J, T> = (json: J) => T;

export default class DirectedTreeGraph<T> implements IDirectedTreeGraph<T> {
  private _tree: TreeNodeRefDictionary<T>;

  private _nodeIncrementor: IIncrementor; // NodeIncrementor;

  private _rootNodeId: string;

  constructor(rootNodeId: string, payload?: T) {
    this._rootNodeId = rootNodeId;
    this._nodeIncrementor = new Incrementor();

    this._tree = {
      // this little hinky, initialize with possible undefined payload.
      [this._rootNodeId]: makeTreeNodeRef<T>(this._rootNodeId, this._rootNodeId, payload),
    };
  }

  get rootNodeId(): string {
    return this._rootNodeId;
  }

  /* mutates property */
  private appendChild(parent: TreeNodeRef<T>, payload: T): TreeNodeRef<T> {
    const childId = this._getNextChildId();
    const nodeId = [parent.nodeId, childId].join(DirectedTreeGraph.PATH_DELIMITER);
    // `${parent.nodeId}${nodeDelimiter}${childId}`;
    if (parent.children === null) {
      // eslint-disable-next-line no-param-reassign
      parent.children = {};
    }
    // eslint-disable-next-line no-param-reassign
    parent.children[childId] = makeTreeNodeRef(parent.nodeId, nodeId, payload);
    return parent.children[childId];
  }

  public accept(visitor: IVisitor<T>) {
    this._visitNodes(visitor, visitor.startNodeId);
  }

  private _visitNodes(visitor: IVisitor<T>, nodeId = this.rootNodeId): void {
    // consider async - maybe this would require long running tasks?
    // currently no use-case for async but its an interesting idea

    const node = this._getNodeByIdRef(nodeId);

    if (!!node) {
      if (visitor.nodeType === "all") {
        visitor.visit(node.parentId, node.nodeId, node.payload);
      } else if (visitor.nodeType === "branch" && this.isBranchNode(nodeId)) {
        visitor.visit(node.parentId, node.nodeId, node.payload);
      } else if (visitor.nodeType === "leaf" && this.isLeafNode(nodeId)) {
        visitor.visit(node.parentId, node.nodeId, node.payload);
      }

      if (node.children !== null) {
        Object.entries(node.children || {}).forEach(([childId, childNode]) => {
          this._visitNodes(visitor, childNode.nodeId);
        });
      }
    }
  }

  public appendPayload(parentNodeId: string, payload: T): string {
    const parentNode = this._getNodeByIdRef(parentNodeId);
    // need to figure out.. Quietly do nothing or throw error
    // should be consistent.  Maybe set upton 'Debug_mode' or read from env
    if (parentNode === null) {
      throw new DirectedTreeError(`Could not find parentId: '${parentNodeId}'`);
    }

    return this.appendChild(parentNode, payload).nodeId;
  }

  public getChildrenIds(parentNodeId: string): string[] {
    const parentNode = this._getNodeByIdRef(parentNodeId);
    if (parentNode === null) {
      return [];
    }
    return Object.entries(parentNode.children || {}).map(([, child]) => child.nodeId);
  }

  public getNodeById(nodeId: string): TreeNode<T> | null {
    const nodeRef = this._getNodeByIdRef(nodeId);
    if (nodeRef === null) {
      return null;
    }
    return {
      // not makeTreeNodeRef, because children are not the same as childrenIds
      nodeId: nodeRef.nodeId,
      parentId: nodeRef.parentId,
      payload: clonedeep(nodeRef.payload),
      childrenIds: this.getChildrenIds(nodeId),
    };
  }

  protected _getNodeByIdRef(nodeId: string): TreeNodeRef<T> | null {
    return this._locateNode(nodeId.split(DirectedTreeGraph.PATH_DELIMITER), this._tree);
  }

  public getPayload(nodeId: string): T | undefined {
    const node = this._getNodeByIdRef(nodeId);
    if (node !== null) {
      return clonedeep(node.payload);
    }
    return undefined;
  }

  public getSiblingIds(nodeId: string): string[] {
    if (nodeId === this.rootNodeId) {
      return [];
    }

    const parent = this._getParent(nodeId);

    if (parent === null) {
      return [];
    }
    const childrenIds = this.getChildrenIds(parent.nodeId);
    return childrenIds.filter((childId) => childId !== nodeId);
  }

  public removeNode(nodeId: string): void {
    if (nodeId === this.rootNodeId) {
      throw new DirectedTreeError(
        `Can not remove Root node. NodeId:  '${this.rootNodeId}'`
      );
    }

    const childId =
      nodeId.split(DirectedTreeGraph.PATH_DELIMITER).pop() || "DOES_NOT_EXIST";
    const parent = this._getParent(nodeId);

    if (parent && parent.children) {
      delete parent.children[childId];
    } else {
      throw new DirectedTreeError(`Remove Node, parent or child not found "${nodeId}"`);
    }
  }

  public mergeChildrenOnToBranch(srcBranchId: string, tarBranchId: string): void {
    this._mergeBranch(srcBranchId, tarBranchId);
  }

  private _mergeBranch(srcBranchId: string, tarBranchId: string): void {
    /* 
      What is obvious: take src children and merge to target children.
      
      What is less Obvious: src payload does *not* get merged into target payload.
            This makes sense if considering target is root. Merging src payload
            into root payload effectively replaces root.. Which is probably a bad idea.
      
      Gotcha:  If src branch is a leaf this should have no effect(maybe deletes the src).

      Practical Advice: guard srcBranch is a branch and not a leaf.
    */

    const jsonBranch = this.toJson(srcBranchId);
    const jsonPayloadConverter = (json: any) => json;
    this._importBranch(jsonBranch, tarBranchId, jsonPayloadConverter);
    this.removeNode(srcBranchId);
  }

  private _importBranch<J>(
    jsonBranch: SerializedTree<J>,
    targetBranchId: string,
    jsonPayloadConverter: TJsonPayloadConverter<J, T>
  ): void {
    const srcBranchId = getNodeIdsWithNullParents(jsonBranch).pop() || "NO_BRANCH_FOUND";
    const parentId = this._getParent(targetBranchId)?.nodeId || this.rootNodeId;

    const reKeyedBranch = convertJsonToDirectedGraphTree<J, T>(
      parentId,
      targetBranchId,
      srcBranchId,
      jsonBranch,
      this._nodeIncrementor,
      jsonPayloadConverter
    ) as TreeNodeRef<T>;

    const targetBranch = this._getNodeByIdRef(targetBranchId);

    if (!targetBranch) {
      return; // maybe throw error
    }

    if (!targetBranch.children) {
      // should test for null.. but somewhere children aren't getting set null
      targetBranch.children = {} as { [nodeId: string]: TreeNodeRef<T> };
    }

    // import/merge should *not* be used with leafs.. If this is a leaf
    // should we be throwing error?
    Object.entries(reKeyedBranch.children || {}).forEach(([childId, child]) => {
      if (targetBranch.children) {
        targetBranch.children[childId] = child as TreeNodeRef<T>;
      }
    });
  }

  public replaceBranch(srcBranchId: string, tarBranchId: string): void {
    // The only use case, that I can think of, but not applicable in this context.
    // if UI wants to rearrange structure to be more visually appealing.
    const jsonBranch = this.toJson(srcBranchId);
    this.removeNode(srcBranchId);
    const jsonConverter = (payload: T) => {
      return payload;
    };

    const parent = this._getParent(tarBranchId);
    if (!parent) {
      return; // or throw error
    }

    // could also reCreate to a new node id.
    // remove target, add reKeyBrach.
    const reKeyedBranch = convertJsonToDirectedGraphTree<T, T>(
      parent.nodeId,
      tarBranchId,
      srcBranchId,
      jsonBranch,
      this._nodeIncrementor,
      jsonConverter
    );
    const childId = tarBranchId.split(DirectedTreeGraph.PATH_DELIMITER).pop() || "";

    if (!parent.children) {
      // tests don't make sense.
      // If target exists, it has a parent, if it has parent
      // then parent has children.
      parent.children = {};
    }
    parent.children[childId] = reKeyedBranch;
  }

  public replacePayload(nodeId: string, payload: T): void {
    const node = this._getNodeByIdRef(nodeId);
    if (node !== null) {
      node.payload = payload;
    }
    // either throw an error or do nothing. Both will require client code
    // to double check.
  }

  private _getParent(nodeId: string): TreeNodeRef<T> | null {
    const child = this._getNodeByIdRef(nodeId);
    if (child === null) {
      return null;
    }

    return this._getNodeByIdRef(child.parentId);
  }

  private _getNextChildId() {
    // ids are used and object keys, not array indexes
    // client code should coerced into string
    return this._nodeIncrementor.nextValue;
  }

  public isBranchNode(nodeId: string) {
    return this.getChildrenIds(nodeId).length > 0;
  }
  public isLeafNode(nodeId: string) {
    return !this.isBranchNode(nodeId);
  }
  public isRootNode(nodeId: string) {
    return nodeId === this._rootNodeId;
  }

  // because paths are known this should be more efficient than using visitor
  private _locateNode(
    paths: string[],
    tree: { [nodeId: string]: TreeNodeRef<T> }
  ): TreeNodeRef<T> | null {
    const root = paths.shift();

    if (root === undefined || tree[root] === undefined) {
      return null;
    }

    if (paths.length === 0) {
      return tree[root];
    }

    if (tree[root].children !== null) {
      return this._locateNode(paths, tree[root].children || {});
    }

    return null; //difficult to test
  }

  public toJson(branchId: string = this.rootNodeId): SerializedTree<T> {
    const jsonVisitor = new VisitorTreeToJson<T>(branchId);

    this.accept(jsonVisitor);
    return jsonVisitor.jsonTree;
  }

  static toJson<U>(tree: DirectedTreeGraph<U>): SerializedTree<U> {
    return tree.toJson();
  }

  static fromJson<J, T>(
    serializedTree: SerializedTree<J>,
    jsonPayloadConverter: TJsonPayloadConverter<J, T>,
    newRootName?: string
  ): DirectedTreeGraph<T> {
    return DirectedTreeGraph.fromFlatObject<J, T>(
      serializedTree,
      jsonPayloadConverter,
      newRootName
    );
  }

  static fromFlatObject<J, T>(
    serializedTree: SerializedTree<J>,
    jsonPayloadConverter: TJsonPayloadConverter<J, T>, // (jsonPayload: J) => T,
    newRootName?: string
  ): DirectedTreeGraph<T> {
    //
    const serializedTreeCloned = clonedeep(serializedTree);
    const possibleRootNodeIds = getNodeIdsWithNullParents(serializedTreeCloned);

    if (possibleRootNodeIds.length !== 1) {
      throw new DirectedTreeError("No single root node found");
    }

    const rootNodeId = possibleRootNodeIds[0];
    const newTreeRootName = newRootName || rootNodeId; // use jsonRoot name or different name for root

    const tree = new DirectedTreeGraph<T>(
      newTreeRootName,
      // rootNodeId,
      serializedTreeCloned[rootNodeId].payload as unknown as T
    );

    const { orphans } = buildTreeStructure<J, T>(
      serializedTreeCloned,
      jsonPayloadConverter,
      newTreeRootName
    );

    //     tree._importBranch(serializedTreeCloned, rootNodeId, jsonPayloadConverter);
    tree._importBranch(serializedTreeCloned, newTreeRootName, jsonPayloadConverter);

    // if all nodes *not* consumed by tree create - we have a corrupted structure (file);
    if (Object.keys(orphans).length !== 0) {
      throw new DirectedTreeError(
        `Orphan nodes or circular reference detected. Offending node(s) '${Object.keys(
          orphans
        ).join(", ")}'`
      );
    }
    return tree;
  }
  static PATH_DELIMITER = ":";
} // ends class
