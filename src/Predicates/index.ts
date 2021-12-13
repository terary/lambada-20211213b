// moving away from 'serialized[something]' toward '[something]Json'
import { TPredicateNode } from "../common/type";
import type { SerializedTree } from "./DirectedTreeGraph";
type TSerializedPredicateTree = SerializedTree<TPredicateNode>;

export type { SerializedTree as TSerializedTree, TSerializedPredicateTree };

//  re-export
export { PredicateTree, PredicateTreeFactory } from "./PredicateTree";
export { PredicateTreeError } from "./PredicateTree/PredicateTreeError";
export { TreeVisitors } from "./TreeVisitors";

export type { VisitorNodeType, IVisitor } from "./DirectedTreeGraph";
export type { TPredicateTreeFactoryOptions } from "./PredicateTree";
export type { IVisitorPredicateTree } from "./PredicateTree";
