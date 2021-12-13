import * as exportNonTypes from "./index";
describe("Library index - export non-type", () => {
  it('Should export only "PredicateTree" non type thing', () => {
    expect(Object.keys(exportNonTypes).length).toBe(11);

    expect("CONSTS" in exportNonTypes).toBeTruthy();
    expect("EXAMPLE_JSON_BLUE_SKIES" in exportNonTypes).toBeTruthy();
    expect("PredicateFormulaEditor" in exportNonTypes).toBeTruthy();

    expect("PredicateFormulaEditorFactory" in exportNonTypes).toBeTruthy();
    expect("PredicateSubjectDictionary" in exportNonTypes).toBeTruthy();
    expect("PredicateSubjectDictionaryFactory" in exportNonTypes).toBeTruthy();
    expect("PredicateTree" in exportNonTypes).toBeTruthy();
    expect("PredicateTreeError" in exportNonTypes).toBeTruthy();
    expect("PredicateTreeFactory" in exportNonTypes).toBeTruthy();
    expect("TreeVisitors" in exportNonTypes).toBeTruthy();
    expect("Validators" in exportNonTypes).toBeTruthy();
  });
  it("Should not have undefined exports", () => {
    // sometimes coverage shows index 0, this test helps - I don't understand why
    // also I thought I as doing that by checking expect key count. Guess not.
    Object.keys(exportNonTypes).forEach((exportKey) =>
      //@ts-ignore
      expect(Boolean(exportNonTypes[exportKey])).toBe(true)
    );
  });
});
