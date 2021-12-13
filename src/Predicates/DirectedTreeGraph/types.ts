// TODO - Need to decide what needs to be exported and export one statement.

export type SerializedTreeNode<T> = {
  parentId: string;
  payload: T;
};
export type SerializedRootNode<T> = {
  parentId: null;
  payload: T;
};

export type SerializedTree<T> = {
  [nodeId: string]: SerializedTreeNode<T> | SerializedRootNode<T>;
};

type TreeNodeBase<T> = {
  parentId: string;
  nodeId: string;
  payload: T;
};

export type TreeNodeRef<T> = TreeNodeBase<T> & {
  children: {
    [nodeId: string]: TreeNodeRef<T>;
  } | null;
};

export type TreeNode<T> = TreeNodeBase<T> & {
  childrenIds: string[];
};

export type TreeNodeRefDictionary<T> = {
  [nodeId: string]: TreeNodeRef<T>;
};
// This is the same shape as DirectedGraphTree._tree
// Some reason that is not typed?  Also this shape maybe found
// somewhere else.
//
// ultimately the goal of DirectedTreeGraph:
//   SerializedTreeNode -> TreeNodeRefDictionary
//   TreeNodeRefDictionary -> SerializedTreeNode
//   except instead of using word serial  we've got to using
//   the word json

// export type payloadConverterType = <T>(payload: any) => T;

export interface IIncrementor {
  readonly nextValue: number; // should increase each time its called
  readonly currentValue: number; //
}

export type VisitorNodeType = "branch" | "leaf" | "all";

export interface IVisitor<T> {
  nodeType: VisitorNodeType;
  visit: (parentId: string, nodeId: string, payload: T) => void;
  startNodeId?: string;
}
