import { TValidatorResponse } from "./types";
import { PredicateTree } from "../index";
import { TreeVisitors } from "../Predicates/TreeVisitors";

export const NoSingleChildRule = (pTree: PredicateTree): TValidatorResponse => {
  const branchIdVisitor = new TreeVisitors.PredicateIdsBranches();
  pTree.acceptVisitor(branchIdVisitor);

  const errorMessages = branchIdVisitor.predicateIds
    .filter((predicateId) => {
      return pTree.getChildrenIds(predicateId).length < 2;
    })
    .map(
      (predicateId) => `Branch with ID: '${predicateId}' fails 2 or more children rule.`
    );

  return { hasError: errorMessages.length > 0, errorMessages };
};
