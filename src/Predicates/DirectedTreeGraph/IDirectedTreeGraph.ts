import { TreeNode, SerializedTree } from "./types";
import type { IVisitor } from "./types";

export interface IDirectedTreeGraph<T> {
  readonly rootNodeId: string;
  accept(visitor: IVisitor<T>): void;

  appendPayload(parentNodeId: string, payload: T): string;
  getChildrenIds(parentNodeId: string): string[];
  getNodeById(nodeId: string): TreeNode<T> | null;
  getPayload(nodeId: string): T | undefined;
  getSiblingIds(nodeId: string): string[];
  removeNode(nodeId: string): void;
  mergeChildrenOnToBranch(srcBranchId: string, tarBranchId: string): void;
  replacePayload(nodeId: string, payload: T): void;
  // toFlatObject(): SerializedTree<T>;
  toJson(): SerializedTree<T>;
}
