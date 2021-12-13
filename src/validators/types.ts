export type TValidatorResponse = { hasError: boolean; errorMessages: string[] };

//deprecated - do not use.
export interface IValidator {
  (...args: any[]): TValidatorResponse;
}

// TODO  - *tmc* - change each IValidator to
// see https://github.com/terary/gabby-query-protocol-lib/issues/23
