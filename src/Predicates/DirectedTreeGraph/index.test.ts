import * as exportNonTypes from "./index";
describe("DirectedTreeGraph.index - export non-type", () => {
  it('Should export only "DirectedTreeGraph" and "DirectedTreeError" non type thing"', () => {
    expect(Object.keys(exportNonTypes).length).toBe(2);
    expect("DirectedTreeError" in exportNonTypes).toBeTruthy();
    expect("DirectedTreeGraph" in exportNonTypes).toBeTruthy();
  });
});
