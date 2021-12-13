/**
 *
 *   `type [INDEX_NAME] = key [TYPE_BEING_INDEXED]
 *    example:
 *   `type SubjectPropertyIndex = keyof TPredicateSubjectProperties;`
 *
 *    works to type an array properties of Type.
 *
 *    Which address the error message:
 *        "Element implicitly has an 'any' type because expression of type 'any'
 *         can't be used to index type"
 *
 *   To import every type would cause inter-dependency hell.
 *   To manipulate CONSTS outside of this directory would be
 *    anti-pattern. Also I think CONST maybe frozen.
 */

export const PREDICATE_OPERATORS = [
  "$anyOf", // list value probable implementation: in('x','y')
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
export const SUPPORTED_PREDICATE_OPERATORS = PREDICATE_OPERATORS;

export const JUNCTION_OPERATORS = ["$and", "$nand", "$nor", "$or"];

export const PREDICATE_PROPERTIES = ["operator", "value", "subjectId"];

// supported locales doesn't really belong here - legacy
export const SUPPORTED_LOCALES = ["Symbols", "en", "en-US", "es", "es-MX", "th-TH", "ar"];
export const SUPPORTED_DATATYPES = [
  "integer",
  "decimal",
  "datetime",
  "string",
  "boolean",
];

export const SUBJECT_PROPERTIES = ["datatype", "validOperators", "defaultLabel"];
export const DECIMAL_SYMBOL = ".";
export const TREE_PATH_DELIMITER = ":";
