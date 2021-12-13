import { PredicateIdsAbstract } from "./PredicateIdsAbstract";

export class PredicateIdsLeafs extends PredicateIdsAbstract {
  constructor() {
    super();
    this._nodeType = "leaf";
  }
}
