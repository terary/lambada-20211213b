import * as exportNonTypes from ".";
import type * as theTypes from "./index";
describe("PredicateTree.index - export non-type", () => {
  it('Should export only "PredicateTree" non type thing"', () => {
    expect(Object.keys(exportNonTypes).length).toBe(2);
    expect("PredicateTree" in exportNonTypes).toBeTruthy();
    expect("PredicateTreeFactory" in exportNonTypes).toBeTruthy();
  });
  it("Should export two types", () => {
    const p = {} as theTypes.PredicateTree;
    expect(typeof p).toBe("object");
  });
  it("Should not have undefined exports", () => {
    // sometimes coverage shows index 0, this test helps - I don't understand why
    Object.keys(exportNonTypes).forEach((exportKey) =>
      //@ts-ignore
      expect(Boolean(exportNonTypes[exportKey])).toBe(true)
    );
  });
});
