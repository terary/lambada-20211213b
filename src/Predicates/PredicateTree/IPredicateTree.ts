import { TPredicateProperties } from "../../common";
import type {
  TPredicateJunctionPropsWithChildIds,
  TPredicatePropertiesJunction,
  TPredicateNode,
  TSerializedPredicateTree,
} from "../../index";
//import { IDirectedTreeGraph } from "../DirectedTreeGraph/IDirectedTreeGraph";
import type { IVisitorPredicateTree } from "../index";

export interface IPredicateTree {
  acceptVisitor(visitor: IVisitorPredicateTree): void;

  appendPredicate(parentId: string, predicate: TPredicateNode): string;

  // defaultJunction: TPredicatePropertiesJunction;

  getChildrenIds(predicateId: string): string[];
  getPredicateById(predicateId: string): TPredicateNode | null;

  getPredicateByIdOrThrow(predicateId: string): TPredicateNode;
  getPredicateJunctionPropsById(
    predicateId: string
  ): TPredicateJunctionPropsWithChildIds | null;

  getPredicatePropsById(predicateId: string): TPredicateProperties | null;

  getPredicatePropsByIdOrThrow(predicateId: string): TPredicateProperties;
  getPredicateJunctionPropsByIdOrThrow(
    predicateId: string
  ): TPredicateJunctionPropsWithChildIds;

  // should be renamed to 'isPredicateBranch'
  isBranch(predicateId: string): boolean;

  removePredicate(predicateId: string): void;

  replacePredicate(predicateId: string, predicate: TPredicateNode): void;
  rootNodeId: string;

  // wonder if this is used - if not discard it
  // setDefaultLogicJunctionAND(): void
  // setDefaultLogicJunctionOR(): void

  toJson(): TSerializedPredicateTree;
}
