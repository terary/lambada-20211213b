/**
 * Silly visitor mostly for testing purposes.
 *
 */

import { CONSTS } from "../../common";
import type { TPredicateNode } from "../../index";
import type { IVisitorPredicateTree } from "../PredicateTree/IVisitorPredicateTree";

import { TPredicateOperator, TPredicateJunctionOperator } from "../../PredicateSubjects";
import type { VisitorNodeType } from "../index";

const SUPPORTED_OPERATORS = CONSTS.JUNCTION_OPERATORS.concat(CONSTS.PREDICATE_OPERATORS);

type ValidOpTypes = TPredicateOperator | TPredicateJunctionOperator;
export class OperatorCounter implements IVisitorPredicateTree {
  private _operatorCounts: {
    [key in ValidOpTypes]?: number;
  } = {};
  private _nodeType: VisitorNodeType;
  constructor() {
    this._nodeType = "all";
    SUPPORTED_OPERATORS.forEach((op) => {
      this._operatorCounts[op as ValidOpTypes] = 0;
    });
  }
  visit(parentId: string, nodeId: string, payload: TPredicateNode) {
    this._operatorCounts[payload.operator] =
      (this._operatorCounts[payload.operator] || 0) + 1;
  }

  get nodeType(): VisitorNodeType {
    return this._nodeType;
  }

  get opCounts() {
    return this._operatorCounts;
  }
}
