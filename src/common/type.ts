import type { TPredicateOperator, TPredicateJunctionOperator } from "../index";

type TValueLabel = {
  value: number | string;
  label: string;
};
type TValueLabelList = TValueLabel[];

type TSupportedDatatype = "integer" | "decimal" | "datetime" | "string" | "boolean";

type TPredicateProperties = {
  subjectId: string;
  operator: TPredicateOperator;
  value: number | string; // this is the instance of Predicate, the type of this is
  // determined by the subject definition {subjectId, validOps, datatype...}
};

type TPredicatePropertiesArrayValue = {
  subjectId: string;
  operator: TPredicateOperator;
  value: (number | string)[];
};

type TPredicatePropertiesJunction = {
  operator: TPredicateJunctionOperator;
};

type TPredicateJunctionPropsWithChildIds = TPredicatePropertiesJunction & {
  childrenIds: string[];
};

type TPredicateNode =
  | TPredicateProperties
  | TPredicatePropertiesJunction
  | TPredicatePropertiesArrayValue;

type TPredicateNodeJson = Partial<TPredicateNode>;
// type TPredicateNodeJson = {
//   subjectId?: string;
//   operator?: TPredicateOperator | TPredicateJunctionOperator;
//   value?: number | string | null | (number | string)[];
// };

export type {
  TPredicateJunctionPropsWithChildIds,
  TPredicateProperties,
  TPredicatePropertiesArrayValue,
  TPredicatePropertiesJunction,
  TPredicateNode,
  TPredicateNodeJson,
  TSupportedDatatype,
  TValueLabelList,
};
