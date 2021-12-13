import { IExportToJson, TPredicateProperties } from "../common";
import type {
  TPredicateSubjectOptionsList,
  TPredicateSubjectWithId,
  TPredicateSubjectDictionary,
  TPredicateSubjectAsColumnDefinition,
  TPredicateSubjectDictionaryJson,
} from "./type";

export interface IPredicateSubjectDictionary
  extends IExportToJson<IPredicateSubjectDictionary, TPredicateSubjectDictionaryJson> {
  getOptionsList(subjectId: string): TPredicateSubjectOptionsList;

  // getAllSubjects(): TPredicateSubjectDictionary; // internal dictionary
  getSubjectIds(): string[];
  getSubjectById(subjectId: string): TPredicateSubjectWithId;

  /**
   * @deprecated  use getSubjectById
   * @param subjectId
   */
  getSubject(subjectId: string): TPredicateSubjectWithId;
  //   getSubjectOrThrow(subjectId: string): TPredicateSubjectWithId;
  getDefaultSubject(): TPredicateSubjectWithId;
  makeEmptyPredicate(): TPredicateProperties;
  getColumns(): TPredicateSubjectAsColumnDefinition[];
  toJson(): TPredicateSubjectDictionaryJson;
}
