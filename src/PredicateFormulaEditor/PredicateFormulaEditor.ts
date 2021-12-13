import type {
  IPredicateSubjectDictionary,
  IPredicateTree,
  TPredicateSubjectAsColumnDefinition,
  TPredicateSubjectOptionsList,
  TPredicateSubjectWithId,
  IVisitorPredicateTree,
  TPredicateJunctionPropsWithChildIds,
  TPredicateProperties,
  TPredicatePropertiesArrayValue,
  TPredicateNode,
  TSerializedPredicateTree,
} from "../index";
import { IExportToJson } from "../common";
import type { PredicateFormulaEditorJson } from "./types";
import { Validators } from "../validators";
import type { TPredicateSubjectDictionaryJson } from "../PredicateSubjects";
import {
  PredicateTree,
  PredicateSubjectDictionary,
  PredicateSubjectDictionaryFactory,
  PredicateTreeFactory,
} from "../index";
import { PredicateTreeError } from "../Predicates/PredicateTree/PredicateTreeError";
import type { IVisitor, TPredicateTreeFactoryOptions } from "../Predicates";
import { ValidateSubjectDictionary } from "../validators/ValidateSubjectDictionary";

export class PredicateFormulaEditor
  implements IExportToJson<PredicateFormulaEditor, PredicateFormulaEditorJson>
{
  private _predicateTree: IPredicateTree;
  private _predicateSubjectDictionary: IPredicateSubjectDictionary;

  private constructor(rootId = "root") {
    this._predicateTree = new PredicateTree(rootId);
    this._predicateSubjectDictionary = new PredicateSubjectDictionary();
  }

  get rootNodeId() {
    return this._predicateTree.rootNodeId;
  }

  get predicateTree(): IPredicateTree {
    // cloning would add a level of protection
    return this._predicateTree;
  }

  get subjectDictionary(): IPredicateSubjectDictionary {
    // cloning would add a level of protection
    return this._predicateSubjectDictionary;
  }

  predicatesAcceptVisitor(visitor: IVisitorPredicateTree | IVisitor<any>): void {
    // don't love the IVisitor<any>,  but I think its probably safe.
    // using 'TPredicateNode' causes issue when trying to implement with TPredicateProperties.

    this._predicateTree.acceptVisitor(visitor);
  }

  predicatesAppend(
    parentId: string,
    predicate: TPredicateProperties | TPredicatePropertiesArrayValue
  ): string {
    // only applicable for predicate, not predicateJunction
    const { hasError, errorMessages } = Validators.ValidatePredicateAgainstOperator(
      predicate,
      this._predicateSubjectDictionary
    );
    if (hasError) {
      throw new PredicateTreeError(
        "appendPredicate, predicate failed validation",
        errorMessages
      );
    }
    return this._predicateTree.appendPredicate(parentId, predicate);
  }

  predicatesGetById(predicateId: string): TPredicateNode | null {
    return this._predicateTree.getPredicateById(predicateId);
  }

  predicatesGetChildrenIds(predicateId: string): string[] {
    return this._predicateTree.getChildrenIds(predicateId);
  }

  predicatesGetJunctionById(predicateId: string): TPredicateJunctionPropsWithChildIds {
    return this._predicateTree.getPredicateJunctionPropsByIdOrThrow(predicateId);
  }

  predicatesGetPropertiesById(predicateId: string): TPredicateProperties {
    return this._predicateTree.getPredicatePropsByIdOrThrow(predicateId);
  }

  // should be renamed to 'isPredicateBranch'
  predicatesIsBranch(predicateId: string): boolean {
    return this._predicateTree.isBranch(predicateId);
  }

  predicatesRemove(predicateId: string): void {
    // should this check/throw?
    this._predicateTree.removePredicate(predicateId);
  }

  predicatesReplace(predicateId: string, predicate: TPredicateNode): void {
    this._predicateTree.replacePredicate(predicateId, predicate);
  }

  /**
   * Purpose - snapshot of current tree.  Useful for UI state management and/or cloning
   *
   * @returns TSerializedPredicateTree - json representation of the internal tree
   */
  predicatesToJsonTree(): TSerializedPredicateTree {
    return this._predicateTree.toJson();
  }

  // subjects
  subjectsGetDefault(): TPredicateSubjectWithId {
    // I *think* the purpose is for UI, building predicates will
    // need to start with something..
    return this._predicateSubjectDictionary.getDefaultSubject();
  }

  subjectsGetOptionsList(subjectId: string): TPredicateSubjectOptionsList {
    return this._predicateSubjectDictionary.getOptionsList(subjectId);
  }

  subjectsGetAllIds(): string[] {
    return this._predicateSubjectDictionary.getSubjectIds();
  }

  subjectsGetById(subjectId: string): TPredicateSubjectWithId {
    return this._predicateSubjectDictionary.getSubject(subjectId);
  }

  subjectGetColumns(): TPredicateSubjectAsColumnDefinition[] {
    return this._predicateSubjectDictionary.getColumns();
  }

  makeEmptyPredicate(): TPredicateProperties {
    return this.subjectDictionary.makeEmptyPredicate();
  }

  toJson(): PredicateFormulaEditorJson {
    return {
      predicateTreeJson: this._predicateTree.toJson(),
      subjectDictionaryJson: this._predicateSubjectDictionary.toJson(),
    };
  }

  static fromJson(
    json: PredicateFormulaEditorJson,
    initialRootPredicate?: TPredicateProperties | TPredicatePropertiesArrayValue,
    options?: TPredicateTreeFactoryOptions
  ): PredicateFormulaEditor {
    if (json === undefined) {
      throw new PredicateTreeError("Can not build tree from undefined json.");
    }
    if (json.subjectDictionaryJson === undefined) {
      throw new PredicateTreeError(
        "Can not build tree from undefined subjection dictionary json."
      );
    }

    if (!json.predicateTreeJson && !initialRootPredicate) {
      throw new PredicateTreeError(
        "Can not build tree from undefined predicate tree json. " +
          "Either 'initialRootPredicate' or 'predicateTreeJson' MUST be defined"
      );
    }

    // no longer possible
    if (json.predicateTreeJson === undefined) {
      return PredicateFormulaEditor.fromEmpty(
        json.subjectDictionaryJson,
        initialRootPredicate as TPredicateProperties | TPredicatePropertiesArrayValue
      );
    }

    const hpm = new PredicateFormulaEditor();
    hpm._predicateSubjectDictionary = PredicateSubjectDictionaryFactory.fromJson(
      json.subjectDictionaryJson
    );

    hpm._predicateTree = PredicateTreeFactory.fromJson(
      json.predicateTreeJson,
      hpm._predicateSubjectDictionary,
      options
    );
    return hpm;
  }

  static fromEmpty(
    subjectDictionaryJson: TPredicateSubjectDictionaryJson,
    initialRootPredicate: TPredicatePropertiesArrayValue | TPredicateProperties,
    options?: TPredicateTreeFactoryOptions
  ): PredicateFormulaEditor {
    const hpm = new PredicateFormulaEditor();

    const { hasError, errorMessages } = ValidateSubjectDictionary(subjectDictionaryJson);
    if (hasError) {
      throw new PredicateTreeError(
        "Build tree failed due to subjection dictionary errors. See debug messages for more details",
        errorMessages
      );
    }

    hpm._predicateSubjectDictionary =
      PredicateSubjectDictionaryFactory.fromJson(subjectDictionaryJson);

    hpm._predicateTree = PredicateTreeFactory.fromEmpty(
      hpm._predicateSubjectDictionary,
      initialRootPredicate,
      options
    );
    return hpm;
  }
}
