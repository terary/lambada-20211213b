import * as exportNonTypes from "./index";
describe("PredicateTreeContext.index - export non-type", () => {
  it('Should export only "PredicateTree" non type thing', () => {
    expect(Object.keys(exportNonTypes).length).toBe(4);
    expect("PredicateTree" in exportNonTypes).toBeTruthy();
    expect("PredicateTreeFactory" in exportNonTypes).toBeTruthy();
    expect("PredicateTreeError" in exportNonTypes).toBeTruthy();
    expect("TreeVisitors" in exportNonTypes).toBeTruthy();
  });
});
