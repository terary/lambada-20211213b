import { PredicateIdsAbstract } from "./PredicateIdsAbstract";

export class PredicateIdsBranches extends PredicateIdsAbstract {
  constructor() {
    super();
    this._nodeType = "branch";
  }
}
