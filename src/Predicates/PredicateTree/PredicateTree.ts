/*
  Predicate Tree may require a little explaining.

  PredicateTree is an adaptation of a directed tree graph.
  
  Exception - all branches have two or more children.
  This makes sense when considering all junction (AND/OR) will
  have two operands. x AND y -> ok.  X AND AND Y -> illogical

  When adding a child to a leaf, two nodes get added..
    1. leaf becomes branch
    2. new child added to branch
    3. predicate from original will be added to branch as new leaf.

  Invisible child.  The leaf node that gets added in addition to
  the intended new leaf (#3 from above).

  When removing one of two leaves the remaining leaf (invisible child)
  will ascend to parent position.

  Remove c2
            c1:[1,2]        -->      c1:[1,2,p,q]
            /     \
      c2:[x,y]   c3:[p,q]       
     
  * this is demonstration of relationship only. Branch value [$and, $or,...] can not
    be same type as leaf value [$eq, $ne, $like....].
*/
import { CONSTS } from "../../common";
import { PredicateTreeError } from "./PredicateTreeError";
import {
  DirectedTreeError,
  DirectedTreeGraph,
  SerializedTree,
} from "../DirectedTreeGraph";
import type { IVisitorPredicateTree } from "../index";
import type {
  TPredicateJunctionPropsWithChildIds,
  TPredicatePropertiesJunction,
  TPredicateProperties,
  TPredicateNode,
  TPredicateNodeJson,
  TSerializedPredicateTree,
} from "../../index";

import { IDirectedTreeGraph } from "../DirectedTreeGraph/IDirectedTreeGraph";
import { IPredicateTree } from "./IPredicateTree";
import * as helpers from "./helpers";

const junctionAND = { operator: "$and" } as TPredicatePropertiesJunction;

export default class PredicateTree implements IPredicateTree {
  private _tree: IDirectedTreeGraph<TPredicateNode>;

  private _defaultJunction: TPredicatePropertiesJunction = junctionAND;

  constructor(rootNodeId: string, queryNode?: TPredicateNode) {
    this._tree = new DirectedTreeGraph<TPredicateNode>(rootNodeId, queryNode);
  }

  get defaultJunction(): TPredicatePropertiesJunction {
    return { ...this._defaultJunction };
  }
  acceptVisitor(visitor: IVisitorPredicateTree): void {
    this._tree.accept(visitor);
  }

  appendPredicate(parentId: string, predicate: TPredicateNode): string {
    const parentNode = this._tree.getNodeById(parentId);
    if (parentNode === null) {
      throw new PredicateTreeError(`Couldn't locate parent with id: '${parentId}'`);
    }
    const siblingIds = this._tree.getChildrenIds(parentId);
    if (siblingIds.length === 0) {
      const firstChildPredicate = this._tree.getPayload(parentId);

      if (firstChildPredicate === undefined) {
        // this condition should only happen if tree was initialized without
        // predicate.
        this._tree.replacePayload(parentId, predicate);
        return parentId;
      }
      this._tree.replacePayload(parentId, this.defaultJunction);
      this._tree.appendPayload(parentId, { ...firstChildPredicate });
    }
    return this._tree.appendPayload(parentId, { ...predicate });
  }

  getChildrenIds(predicateId: string): string[] {
    return this._tree.getChildrenIds(predicateId);
  }

  private _ascendChild(childId: string): void {
    const child = this._tree.getNodeById(childId);

    if (child !== null && child.childrenIds.length > 0) {
      this._tree.mergeChildrenOnToBranch(childId, child.parentId);
    }
    if (child !== null && child.childrenIds.length === 0) {
      const childPredicate = this.getPredicateById(childId);
      if (childPredicate !== null) {
        // typescript funny about checking for null on variable and not on function call
        this.replacePredicate(child.parentId, childPredicate);
        this._tree.removeNode(childId);
      }
    }
  }

  removePredicate(predicateId: string): void {
    const siblings = this._tree.getSiblingIds(predicateId);
    const thisChild = this._tree.getNodeById(predicateId);

    if (thisChild === null) {
      throw new DirectedTreeError(
        `removePredicate failed. Predicate with ID '${predicateId}' does not exist.`
      );
    }

    if (siblings.length === 1) {
      this._ascendChild(siblings[0]);
      this._tree.removeNode(predicateId);
    } else {
      this._tree.removeNode(predicateId);
    }

    // if siblings.length == 0, this condition implies significant internal logic error
    // eg: no single child rule.
  }

  replacePredicate(predicateId: string, predicate: TPredicateNode): void {
    this._tree.replacePayload(predicateId, { ...predicate });
  }

  isBranch(predicateId: string): boolean {
    return this.getChildrenIds(predicateId).length > 0;
  }

  toJson(): TSerializedPredicateTree {
    return this._tree.toJson();
  }

  get queryId(): string {
    return this.rootNodeId;
  }

  get rootNodeId(): string {
    return this._tree.rootNodeId;
  }

  getPredicatePropsById(predicateId: string): TPredicateProperties | null {
    // const props =
    if (this.isBranch(predicateId)) {
      return null;
    }
    return this.getPredicateById(predicateId) as TPredicateProperties;
  }

  getPredicatePropsByIdOrThrow(predicateId: string): TPredicateProperties {
    const props = this.getPredicatePropsById(predicateId);
    if (props === null) {
      throw new PredicateTreeError(`Couldn't locate leaf with id: '${predicateId}'`);
    }
    return props;
  }

  getPredicateJunctionPropsById(
    predicateId: string
  ): TPredicateJunctionPropsWithChildIds | null {
    if (!this.isBranch(predicateId)) {
      return null;
    }

    const operator = this.getPredicateById(predicateId) as TPredicatePropertiesJunction;
    const childrenIds = this.getChildrenIds(predicateId);

    if (operator === null) {
      // coverage says not tested, but it is.?
      return null;
    }

    return {
      ...operator,
      childrenIds,
    };
  }

  getPredicateJunctionPropsByIdOrThrow(
    predicateId: string
  ): TPredicateJunctionPropsWithChildIds {
    const props = this.getPredicateJunctionPropsById(predicateId);

    if (props === null) {
      throw new PredicateTreeError(`Couldn't locate branch with id: '${predicateId}'`);
    }

    return props;
  }

  getPredicateByIdOrThrow(predicateId: string): TPredicateNode {
    const predicateProps = this.getPredicateById(predicateId);
    if (predicateProps === null) {
      throw new PredicateTreeError(`Couldn't locate predicate with id: '${predicateId}'`);
    }
    return predicateProps;
  }

  getPredicateById(predicateId: string): TPredicateNode | null {
    const node = this._tree.getNodeById(predicateId);
    if (node === null) {
      return null;
    }
    return node.payload; // this is clone - not the original object
  }

  static isBranchOperator(operator: string): boolean {
    return CONSTS.JUNCTION_OPERATORS.indexOf(operator) > -1;
  }

  static toFlatObject(tree: PredicateTree): SerializedTree<TPredicateNode> {
    // coverage says its not tested - it is depreciated, should be using toJson
    return tree._tree.toJson();
  }

  // serial tree should be TPredicateNodeJson  SerializedTree<TPredicateNode>
  static fromFlatObject(
    serialized: SerializedTree<TPredicateNodeJson>,
    newTreeRootNode?: string
  ): PredicateTree {
    const directedTree = DirectedTreeGraph.fromFlatObject<
      TPredicateNodeJson,
      TPredicateNode
    >(serialized, helpers.objectToQueryNode, newTreeRootNode);

    const newTree = new PredicateTree(directedTree.rootNodeId);
    newTree._tree = directedTree;

    return newTree;
  }

  static deserialize(serializedTree: string): PredicateTree {
    return PredicateTree.fromFlatObject(JSON.parse(serializedTree));
  }

  static serialize(tree: PredicateTree): string {
    return JSON.stringify(tree.toJson());
  }
}
