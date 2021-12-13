import {
  PREDICATE_OPERATORS,
  JUNCTION_OPERATORS,
  SUPPORTED_LOCALES,
  SUPPORTED_DATATYPES,
} from "./consts";

describe("consts", () => {
  it("(PREDICATE_OPERATORS) Should not change (or test should be updated", () => {
    expect(PREDICATE_OPERATORS).toStrictEqual([
      "$anyOf", "$empty", "$eq", "$gt", "$gte", "$isNull", "$like", "$lt", "$lte", "$oneOf", "$nanyOf", "$ne"
    ]);
  });
  it("(JUNCTION_OPERATORS) Should not change (or test should be updated", () => {
    expect(JUNCTION_OPERATORS).toStrictEqual(["$and", "$nand", "$nor", "$or"]);
  });
  it("(SUPPORTED_DATATYPES) Should not change (or test should be updated", () => {
    expect(SUPPORTED_DATATYPES).toStrictEqual([
      "integer",
      "decimal",
      "datetime",
      "string",
      "boolean",
    ]);
  });

  it("(SUPPORTED_LOCALES) Should not change (or test should be updated", () => {
    expect(SUPPORTED_LOCALES).toStrictEqual([
      "Symbols",
      "en",
      "en-US",
      "es",
      "es-MX",
      "th-TH",
      "ar",
    ]);
  });
});
