import { CONSTS } from "../common";
import { TPredicateNodeJson } from "../index";
import { TPredicateJunctionOperator } from "../index";

const negScientificNotationRegEx = /[\d]+(e-)[\d]+/;

// matches: 2021-03-23T23:23:58Z
// matches: 2021-03-23T23:23:58(+/-)hh:mm
// matches: 2021-03-29T23:23:58(+/-)29:49  <-- this is bad.
// alternative maybe new Date(...).toISO() === dateString. (probably with regEx. iso has a few formats)
// const iso8601LongRegex =
//   /^\d{4}-[0-1][0-9]-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(Z|(\+|-)[0-2]\d:[0-5]\d)$/;
const iso8601LongRegex =
  /^\d{4}-[0-1][0-9]-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d((.\d{3}){0,1}Z|(\+|-)[0-2]\d:[0-5]\d)$/;

export const isString = (value: any) => {
  return typeof value === "string" || value instanceof String;
};

export const isNumeric = (value: any): boolean => {
  return !Number.isNaN(value - parseFloat(value));
};

// export const isDecimal = (value: any): boolean => {
//   // it seems js quietly converts 5000.00 to 5000
//   // (can't seem to find documentation now).
//   // I guess this is safe because any int can be represented as decimal.
//   return isNumeric(value);
// };

export const isInteger = (value: any) => {
  return Number.isSafeInteger(value) && !hasDecimalSymbol(value);
};

export const hasNegativeScientificNotation = (value: any) => {
  return negScientificNotationRegEx.test("" + value);
};
export const hasDecimalSymbol = (value: any) => {
  return ("" + Number(value)).indexOf(CONSTS.DECIMAL_SYMBOL) !== -1;
};

export const isDateISO8601String = (value: any): boolean => {
  // YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)
  // 1974-06-29T03:33:59(+|-)hh:mm
  // 1974-06-29T03:33:59Z

  // wont catch things like
  // 2021-03-23T23:23:58-34:00
  // or
  // 2021-03-23T28:23:58-04:00

  // consider creating date get the ISO string and compare
  // to original string.
  return iso8601LongRegex.test(value);
};

export const isDate = (value: any): boolean => {
  if (isString(value)) {
    return false;
  }

  return value instanceof Date;
};

export const isValidJunctionPredicate = (predicateJson: TPredicateNodeJson) => {
  if (!hasExactlyProperties(predicateJson, "operator")) {
    return false;
  }

  const { operator } = predicateJson;

  if (CONSTS.JUNCTION_OPERATORS.includes(operator as TPredicateJunctionOperator)) {
    return true;
  }

  return false;
};

export const hasExactlyProperties = (o: any, ...properties: string[]): boolean => {
  if (!o) {
    return false;
  }

  // coverage complains about this not be reachable
  // I guess spread operator guarantees array.
  // if (!Array.isArray(properties)) {
  //   return false;
  // }

  // not really sure how to check if an object has enumerable keys, other than try.
  // if (typeof o !== "object") {
  //   return false;
  // }
  const objProps = Object.keys(o);

  if (objProps.length !== properties.length) {
    return false;
  }
  for (let prop of objProps) {
    if (!properties.includes(prop)) {
      return false;
    }
  }

  return true;
};
