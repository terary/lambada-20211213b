import { IIncrementor } from "./types";

export class Incrementor implements IIncrementor {
  private _i = 0;
  get nextValue() {
    return this._i++;
  }
  getNextValue() {
    return this.nextValue;
  }
  get currentValue() {
    return this._i;
  }
}
