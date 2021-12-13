import pick from "lodash.pick";
import { DirectedTreeError } from "../DirectedTreeGraph";
import { CONSTS } from "../..";
import type { TPredicateProperties } from "../../index";

// today this should be <payloadJson,payload>
export const objectToQueryNode = <QueryNode>(jsonPayload: any) => {
  if (!jsonPayload) {
    throw new DirectedTreeError(
      `Deserialized failed. Bad format serialNode: '${JSON.stringify(jsonPayload)}'`
    );
  }

  if (!jsonPayload.operator) {
    throw new DirectedTreeError(
      `Deserialized failed. No operator found: '${JSON.stringify(jsonPayload)}'`
    );
  }

  if (CONSTS.JUNCTION_OPERATORS.includes(jsonPayload.operator)) {
    return pick(jsonPayload, ["operator"]) as QueryNode;
  }

  const queryNode = pick(jsonPayload, [
    "subjectId",
    "operator",
    "value",
  ]) as TPredicateProperties;

  // this helper should rely on ValidatePredicateProperties (or whatever it is)
  if (
    !queryNode.subjectId ||
    !queryNode.operator ||
    (!queryNode.value && queryNode.value !== null) ||
    !CONSTS.PREDICATE_OPERATORS.includes(queryNode.operator)
  ) {
    throw new DirectedTreeError(
      `Deserialized failed. No valid predicate found: '${JSON.stringify(queryNode)}'`
    );
  }

  return queryNode as unknown as QueryNode;
};
