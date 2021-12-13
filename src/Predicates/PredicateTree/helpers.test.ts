// this is tested incidentals.  Coverage is 100%
// created test to find coverage issues.  This was the issue
// Leaving test incase its useful later.

import * as helpers from "./helpers";
import DirectedTreeError from "../DirectedTreeGraph/DirectedTreeError";
describe("Helpers", () => {
  describe("objectToQueryNode", () => {
    it("Should covert object to QueryNode", () => {
      const expectedToTrow = () => {
        helpers.objectToQueryNode({});
      };
      expect(expectedToTrow).toThrow(DirectedTreeError);

      expect(expectedToTrow).toThrow("Deserialized failed. No operator found: '{}'");
      // expect(expectedToTrow).toThrow("Deserialized failed. Bad format serialNode: '{}'");
    });
  });
});
