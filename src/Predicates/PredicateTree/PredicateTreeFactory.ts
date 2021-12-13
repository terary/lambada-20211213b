import PredicateTree from "./PredicateTree";
import type { IPredicateTree } from "./IPredicateTree";
import { PredicateTreeError } from "./PredicateTreeError";
import type {
  TSerializedPredicateTree,
  IPredicateSubjectDictionary,
  TPredicatePropertiesArrayValue,
  TPredicateProperties,
} from "../../index";
import { Validators } from "../../validators";

export type TPredicateTreeFactoryOptions = {
  newRootId?: string;
};

export const PredicateTreeFactory = {
  fromEmpty: (
    subjectDictionary: IPredicateSubjectDictionary,
    initialPredicateItem: TPredicateProperties | TPredicatePropertiesArrayValue,
    options?: TPredicateTreeFactoryOptions
  ): IPredicateTree => {
    const validation = Validators.ValidatePredicateAgainstOperator(
      initialPredicateItem,
      subjectDictionary
    );
    if (validation.hasError) {
      throw new PredicateTreeError(
        "Failed to initialize predicate tree with initial predicate.",
        validation.errorMessages
      );
    }

    const defaultOptions: TPredicateTreeFactoryOptions = { newRootId: undefined };
    const effectiveOptions = { ...defaultOptions, ...options };

    const predicateTree = new PredicateTree(
      effectiveOptions.newRootId || "root",
      initialPredicateItem
      // subjectDictionary.makeEmptyPredicate()
    );

    return predicateTree;
  },

  fromJson: (
    json: TSerializedPredicateTree,
    subjectDictionary: IPredicateSubjectDictionary,
    options?: TPredicateTreeFactoryOptions
  ): IPredicateTree => {
    //
    const defaultOptions: TPredicateTreeFactoryOptions = { newRootId: undefined };
    const effectiveOptions = { ...defaultOptions, ...options };
    const allErrorMessages: string[] = [];

    const { errorMessages: validPredicateErrors } =
      Validators.ValidateAllPredicatesAgainstOperator(json, subjectDictionary);

    allErrorMessages.push(...validPredicateErrors);
    if (allErrorMessages.length > 0) {
      throw new PredicateTreeError(
        "Failed to convert JSON to usable PredicateTree",
        allErrorMessages
      );
    }

    const predicateTree = PredicateTree.fromFlatObject(json, effectiveOptions.newRootId);
    const { hasError, errorMessages } = Validators.NoSingleChildRule(predicateTree);

    if (hasError) {
      throw new PredicateTreeError(
        "Provided PredicateTree JSON breaks no single child rule.",
        errorMessages
      );
    }

    return predicateTree;
  },

  toJson: (tree: IPredicateTree): TSerializedPredicateTree => {
    return tree.toJson();
  },
};
