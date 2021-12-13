import type {
  TPredicateSubjectOptionsList,
  TPredicateOperator,
  TPredicateSubjectAsColumnDefinition,
  TPredicateSubjectWithId,
  TPredicateSubjectDictionary,
  TPredicateSubjectProperties,
  TPredicateSubjectDictionaryJson,
} from "./type";
import type { TValueLabelList } from "../index";

import { TPredicateProperties } from "../common";
import { IPredicateSubjectDictionary } from "./IPredicateSubjectDictionary";
import cloneDeep from "lodash.clonedeep";

export class PredicateSubjectDictionary implements IPredicateSubjectDictionary {
  private _querySubjects: TPredicateSubjectDictionary;

  constructor() {
    this._querySubjects = {};
  }

  getOptionsList(subjectId: string): TPredicateSubjectOptionsList {
    // should always return {$anyOf:[...], $nanyOf:[...], $oneOf: [...]}
    // where array can empty
    const querySubject = this.getSubject(subjectId);
    let $anyOf = [] as TValueLabelList;
    let $nanyOf = [] as TValueLabelList;
    let $oneOf = [] as TValueLabelList;

    if (!subjectId) {
      return { $anyOf, $nanyOf, $oneOf };
    }
    if (
      // probably caused by predicateSubjectJson in bad format
      // this isn't the place to deal with that.
      !querySubject ||
      !querySubject.validOperators
    ) {
      return { $anyOf, $nanyOf, $oneOf };
    }

    if (typeof querySubject.validOperators.$anyOf === "object") {
      // coverage: blueSkies (or other) need add these conditions
      $anyOf = querySubject.validOperators.$anyOf.optionList || [];
    }

    if (typeof querySubject.validOperators.$nanyOf === "object") {
      // coverage: blueSkies (or other) need add these conditions
      $nanyOf = querySubject.validOperators.$nanyOf.optionList || [];
    }

    if (typeof querySubject.validOperators.$oneOf === "object") {
      // coverage: blueSkies (or other) need add these conditions
      $oneOf = querySubject.validOperators.$oneOf.optionList || [];
    }

    return { $anyOf, $nanyOf, $oneOf };
  }

  getAllSubjects(): TPredicateSubjectDictionary {
    return this._querySubjects;
  }

  getSubjectIds(): string[] {
    return Object.keys(this._querySubjects);
  }

  getColumns(): TPredicateSubjectAsColumnDefinition[] {
    const columns: TPredicateSubjectAsColumnDefinition[] = [];

    Object.entries(this._querySubjects).forEach(([subjectId, props]) => {
      columns.push({
        subjectId,
        datatype: props.datatype,
        defaultLabel: props.defaultLabel,
      });
    });

    return columns;
  }

  getSubjectById(subjectId: string): TPredicateSubjectWithId {
    if (subjectId in this._querySubjects) {
      return { subjectId, ...this._querySubjects[subjectId] };
    }

    // TODO - should have two functions returns null
    //        or throw eg *orThrow
    // @ts-ignore
    return null;
  }

  /**
   * @deprecated  use getSubjectById
   * @param subjectId
   * @returns predicateSubject or null
   */
  getSubject(subjectId: string): TPredicateSubjectWithId {
    return this.getSubjectById(subjectId);
  }

  makeEmptyPredicate(): TPredicateProperties {
    const { subjectId, validOperators } = this.getDefaultSubject();
    return {
      subjectId,
      operator: Object.keys(validOperators).shift() as TPredicateOperator,
      value: "",
    };
  }

  getDefaultSubject(): TPredicateSubjectWithId {
    const [subjectId, subjectProps] = Object.entries(this._querySubjects).shift() || [];

    if (subjectId === undefined || subjectProps === undefined) {
      return {} as TPredicateSubjectWithId;
    }

    return { subjectId, ...subjectProps };
  }

  private addSubject(subjectId: string, subjectProperties: TPredicateSubjectProperties) {
    this._querySubjects[subjectId] = subjectProperties;
  }

  public toJson(): TPredicateSubjectDictionaryJson {
    // TODO - this is probably not the right way.
    // in theory it works but parse(stringify()) -- seems like a bad idea.
    // return JSON.parse(JSON.stringify(this._querySubjects));
    return cloneDeep(this._querySubjects);
  }

  static fromJson(
    jsonObject: TPredicateSubjectDictionaryJson
  ): PredicateSubjectDictionary {
    const newDictionary = new PredicateSubjectDictionary();
    Object.entries(jsonObject as TPredicateSubjectDictionary).forEach(
      ([subjectId, subjectProperties]) => {
        newDictionary.addSubject(subjectId, subjectProperties);
      }
    );

    return newDictionary;
  }
}
