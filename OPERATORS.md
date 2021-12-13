Junction Operators:

    type TPredicateJunctionOperator = "$and" | "$nand" | "$nor" | "$or";

Predicate Operators

    export const PREDICATE_OPERATORS = [
    "$anyOf", // list value probable implementation: in('x','y'), If exists in (a U b)
    "$empty", // implementors can choose how/what this means
    "$eq",
    "$gt",
    "$gte",
    "$isNull",
    "$like",
    "$lt",
    "$lte",
    "$oneOf", // scalar value probable implementation: $eq
    "$nanyOf", // list value probable implementation: NOT in('x','y')
    "$ne",
    ];
