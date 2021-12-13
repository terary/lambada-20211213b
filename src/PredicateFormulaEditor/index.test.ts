import * as exportNonTypes from "./index";
describe("PredicateTreeContext.index - export non-type", () => {
  it('Should export only "PredicateTree" non type thing', () => {
    expect(Object.keys(exportNonTypes).length).toBe(2);
    expect("PredicateFormulaEditorFactory" in exportNonTypes).toBeTruthy();
    expect("PredicateFormulaEditor" in exportNonTypes).toBeTruthy();
  });
});
