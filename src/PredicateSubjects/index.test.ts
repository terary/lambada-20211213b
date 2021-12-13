import * as exportNonTypes from "./index";
describe("QuerySubject.index - export non-type", () => {
  it('Should export only "PredicateSubjectDictionary non type thing"', () => {
    expect(Object.keys(exportNonTypes).length).toBe(2);
    expect(exportNonTypes.PredicateSubjectDictionary).toBeTruthy();
    expect(exportNonTypes.PredicateSubjectDictionaryFactory).toBeTruthy();
  });
});
