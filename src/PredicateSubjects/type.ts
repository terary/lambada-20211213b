import { TValueLabelList } from "../index";
import { TSupportedDatatype } from "../common";

type TPredicateSubjectOptionsList = {
  [op in Extract<TPredicateOperator, "$anyOf" | "$nanyOf" | "$oneOf">]?: TValueLabelList;
};

type TPredicateJunctionOperator = "$and" | "$nand" | "$nor" | "$or";
type TPredicateJunctionOperatorExt =
  | TPredicateJunctionOperator
  | "$betweeni"
  | "$betweenx";

type TPredicateOperator =
  | "$anyOf"
  | "$eq"
  | "$empty"
  | "$gt"
  | "$gte"
  | "$isNull"
  | "$like"
  | "$lt"
  | "$lte"
  | "$oneOf"
  | "$nanyOf"
  | "$ne";

type TOperatorOptions = {
  attributes?: Record<string, unknown>;
  optionList?: TValueLabelList;
};

type TValidOperatorList = {
  [operator in TPredicateOperator]?: true | TOperatorOptions;
  // notice the '?' making it 'one of operator'
  // bool | Options, boolean should always be true
};
type TPredicateSubjectProperties = {
  validOperators: TValidOperatorList;
  datatype: TSupportedDatatype;
  defaultLabel: string;
};
type TPredicateSubjectDictionary = {
  [subjectId: string]: TPredicateSubjectProperties;
};
type TPredicateSubjectPropertiesJson = Partial<TPredicateSubjectProperties>;

type TPredicateSubjectDictionaryJson = {
  [subjectId: string]: TPredicateSubjectPropertiesJson;
};

type TPredicateSubjectWithId = TPredicateSubjectProperties & { subjectId: string };

type TPredicateSubjectAsColumnDefinition = {
  subjectId: string;
  datatype: TSupportedDatatype;
  defaultLabel: string;
};

export type {
  TOperatorOptions,
  TPredicateJunctionOperator,
  TPredicateSubjectAsColumnDefinition,
  TPredicateSubjectWithId,
  TPredicateSubjectDictionary,
  TPredicateSubjectDictionaryJson,
  TPredicateSubjectOptionsList,
  TPredicateOperator,
  TPredicateSubjectProperties,
  TPredicateSubjectPropertiesJson,
  TValidOperatorList,
};
