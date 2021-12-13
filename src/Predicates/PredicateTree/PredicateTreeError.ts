// export class PredicateTreeError extends Error {}

/* eslint-disable import/prefer-default-export */
export class PredicateTreeError extends Error {
  public debugMessages: string[] = [];

  constructor(message: string, otherMessages: string[] = []) {
    super(message);
    this.debugMessages = otherMessages;
  }
}
